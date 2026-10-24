import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { AppToast } from "../../components/AppToast";
import { LoanItem } from "../../components/LoanItem";
import { SummaryCard } from "../../components/SummaryCard";
import {
  clearSession,
  getLoans,
  getSummary,
  getReceiptDataUri,
  repayLoan,
  type Loan,
  type Summary,
} from "../../src/api";
import { theme } from "../../constants/theme";

type Tab = "active" | "repaid";
type Toast = { message: string; type: "error" | "success" };

export default function DashboardScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tab, setTab] = useState<Tab>("active");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [repayingId, setRepayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [receiptLoan, setReceiptLoan] = useState<Loan | null>(null);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptFailed, setReceiptFailed] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: Toast["type"] = "error") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  // Fetches page 1 fresh — used on initial load and pull-to-refresh.
  async function loadData() {
    try {
      const [loanResult, summaryResult] = await Promise.all([
        getLoans(1),
        getSummary(),
      ]);
      setLoans(loanResult.data);
      setPage(1);
      setTotalPages(loanResult.pagination.totalPages);
      setSummary(summaryResult);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not load your ledger.");
    }
  }

  // Appends the next page to the existing list.
  async function loadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getLoans(nextPage);
      setLoans((prev) => [...prev, ...result.data]);
      setPage(nextPage);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  // Initial load + reload when navigating back from add-loan.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, []),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleRepay(loan: Loan) {
    setRepayingId(loan.id);
    try {
      await repayLoan(loan.id);
      showToast(`${loan.friendName} marked as repaid.`, "success");
      await loadData(); // re-fetch to update summary and move loan to Repaid tab
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update entry.");
    } finally {
      setRepayingId(null);
    }
  }

  async function handleLogout() {
    await clearSession();
    router.replace("/(auth)/phone");
  }

  async function openReceipt(loan: Loan) {
    setReceiptLoan(loan);
    setReceiptUri(null);
    setReceiptFailed(false);
    setReceiptLoading(true);

    try {
      setReceiptUri(await getReceiptDataUri(loan.id));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load this receipt.");
      setReceiptFailed(true);
    } finally {
      setReceiptLoading(false);
    }
  }

  function closeReceipt() {
    setReceiptLoan(null);
    setReceiptUri(null);
    setReceiptLoading(false);
    setReceiptFailed(false);
  }

  // Filter the accumulated list by the current tab.
  const visibleLoans = loans.filter((l) =>
    tab === "active" ? !l.repaidAt : !!l.repaidAt,
  );

  const hasMore = page < totalPages;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.list}
        data={visibleLoans}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[theme.colors.primary]}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* ── Title row ── */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>My Ledger</Text>
                <Text style={styles.subtitle}>A clear view of money lent.</Text>
              </View>
              <Pressable
                accessibilityLabel="Log out"
                accessibilityRole="button"
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>

            {/* ── Summary card ── */}
            {summary ? <SummaryCard summary={summary} /> : null}

            {/* ── Add button ── */}
            <AppButton
              onPress={() => router.push("/(app)/add-loan")}
              title="＋ Add lending entry"
            />

            {/* ── Tabs ── */}
            <View style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === "active" }}
                onPress={() => setTab("active")}
                style={[styles.tab, tab === "active" && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
                  Active {summary ? `(${summary.activeLoans})` : ""}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === "repaid" }}
                onPress={() => setTab("repaid")}
                style={[styles.tab, tab === "repaid" && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === "repaid" && styles.tabTextActive]}>
                  Repaid {summary ? `(${summary.repaidLoans})` : ""}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {tab === "active"
              ? "No active entries yet.\nTap ＋ above to add your first one."
              : "No repaid entries yet.\nMark a loan as repaid to see it here."}
          </Text>
        }
        ListFooterComponent={
          hasMore ? (
            <Pressable
              accessibilityRole="button"
              disabled={loadingMore}
              onPress={loadMore}
              style={styles.loadMoreButton}
            >
              {loadingMore ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Load more</Text>
              )}
            </Pressable>
          ) : undefined
        }
        renderItem={({ item }) => (
        <LoanItem
          loan={item}
          onRepay={() => handleRepay(item)}
          repaying={repayingId === item.id}
          onViewReceipt={() => void openReceipt(item)}
        />
      )}
      />

      <Modal
        animationType="slide"
        onRequestClose={closeReceipt}
        transparent
        visible={receiptLoan !== null}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={closeReceipt} />
          <View style={styles.receiptSheet}>
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptTitle}>Receipt</Text>
                {receiptLoan ? (
                  <Text style={styles.receiptSubtitle}>
                    {receiptLoan.friendName} · {receiptLoan.dueDate}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityLabel="Close receipt"
                accessibilityRole="button"
                hitSlop={10}
                onPress={closeReceipt}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            {receiptLoading ? (
              <ActivityIndicator color={theme.colors.primary} size="large" />
            ) : receiptFailed || !receiptUri ? (
              <Text style={styles.receiptError}>Could not load this receipt.</Text>
            ) : (
              <Image
                accessibilityLabel="Loan receipt"
                onError={() => setReceiptFailed(true)}
                resizeMode="contain"
                source={{ uri: receiptUri }}
                style={styles.receiptImage}
              />
            )}
          </View>
        </View>
      </Modal>

      {toast ? (
        <AppToast
          key={toast.message}
          message={toast.message}
          type={toast.type}
          visible
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  centered: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: "center",
  },
  list: {
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    gap: 16,
    marginBottom: 4,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  logoutText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    gap: 4,
  },
  tab: {
    borderBottomColor: theme.colors.inputBorder,
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: theme.colors.primary,
  },

  // Empty state
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 32,
    textAlign: "center",
  },

  // Load more
  loadMoreButton: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 16,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  receiptSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "72%",
    padding: 20,
  },
  receiptHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  receiptTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  receiptSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    marginTop: 3,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#F0F2F0",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  closeButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 26,
    lineHeight: 29,
  },
  receiptImage: {
    flex: 1,
    width: "100%",
  },
  receiptError: {
    color: theme.colors.error,
    flex: 1,
    fontFamily: theme.fonts.regular,
    paddingTop: 32,
    textAlign: "center",
  },
});
