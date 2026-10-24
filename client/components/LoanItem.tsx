
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Loan } from "../src/api";
import { formatRupees, isOverdue } from "../src/validation";
import { theme } from "../constants/theme";

const SUCCESS_GREEN = "#027A48";

type Props = {
  loan: Loan;
  onRepay: () => void;
  onViewReceipt?: () => void;
  repaying?: boolean;
};

export function LoanItem({
  loan,
  onRepay,
  onViewReceipt,
  repaying = false,
}: Props) {
  const overdue = isOverdue(loan.dueDate, loan.repaidAt);
  const repaid = loan.repaidAt !== null && loan.repaidAt !== undefined;

  const statusLabel = repaid ? "Repaid" : overdue ? "Overdue" : "Active";
  const statusColor = repaid
    ? SUCCESS_GREEN
    : overdue
      ? theme.colors.error
      : theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.friendName}>{loan.friendName}</Text>
          <Text style={styles.dueDate}>
            {repaid
              ? `Repaid ${loan.repaidAt!.slice(0, 10)}`
              : `Due ${loan.dueDate}`}
          </Text>
        </View>

        <Text style={[styles.amount, repaid && styles.amountRepaid]}>
          {formatRupees(loan.amountPaise)}
        </Text>
      </View>

      {loan.note ? <Text style={styles.note}>{loan.note}</Text> : null}

      {loan.hasReceipt && onViewReceipt ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View receipt for ${loan.friendName}`}
          onPress={onViewReceipt}
          hitSlop={8}
        >
          <Text style={styles.receiptLink}>View receipt</Text>
        </Pressable>
      ) : null}

      <View style={styles.bottomRow}>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusLabel}
        </Text>

        {!repaid ? (
          <Pressable
            accessibilityLabel={`Mark ${loan.friendName} as repaid`}
            accessibilityRole="button"
            disabled={repaying}
            onPress={onRepay}
            hitSlop={8}
            style={styles.repayButton}
          >
            {repaying ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Text style={styles.repayText}>Mark repaid</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.inputBorder,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  nameBlock: {
    flex: 1,
  },
  friendName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  dueDate: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
  amount: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  amountRepaid: {
    color: theme.colors.textSecondary,
  },
  note: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  status: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  repayButton: {
    minHeight: 28,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  repayText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    fontWeight: "700",
  },
  receiptLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
});
