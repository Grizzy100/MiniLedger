
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { AppToast } from "../../components/AppToast";
import { createLoan } from "../../src/api";
import { validateLoan } from "../../src/validation";
import { theme } from "../../constants/theme";

type Toast = {
  message: string;
  type: "error" | "success";
};

type Receipt = {
  uri: string;
  name: string;
  type: string;
};

export default function AddLoanScreen() {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: Toast["type"] = "error") {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ message, type });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
  }

  function updateFieldError(field: string) {
    setErrors((current) => {
      if (!current[field]) return current;
      return { ...current, [field]: "" };
    });
  }

  function handleNameChange(value: string) {
    const filtered = value.replace(/[^a-zA-Z\s'-]/g, "");
    setFriendName(filtered);
    updateFieldError("friendName");
  }

  function handleAmountChange(value: string) {
    // Keep digits and a single decimal point.
    let filtered = value.replace(/[^\d.]/g, "");
    const decimalIndex = filtered.indexOf(".");

    if (decimalIndex !== -1) {
      filtered =
        filtered.slice(0, decimalIndex + 1) +
        filtered.slice(decimalIndex + 1).replace(/\./g, "");
    }

    // Allow at most two digits after the decimal point.
    const parts = filtered.split(".");
    if (parts.length === 2) {
      filtered = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setAmount(filtered);
    updateFieldError("amount");
  }

  function handleDateChange(value: string) {
    // Accept digits only, then format as YYYY-MM-DD.
    const digits = value.replace(/\D/g, "").slice(0, 8);

    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    }

    setDueDate(formatted);
    updateFieldError("dueDate");
  }

  async function chooseReceipt() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showToast("Photo access is needed to attach a receipt.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (!asset) {
        showToast("Could not select the receipt. Please try again.");
        return;
      }

      const type = asset.mimeType;

      if (!type || !["image/jpeg", "image/png"].includes(type)) {
        showToast("Please choose a JPEG or PNG image.");
        return;
      }

      if (asset.fileSize != null && asset.fileSize > 5 * 1024 * 1024) {
        showToast("Receipt must be 5 MB or smaller.");
        return;
      }

      setReceipt({
        uri: asset.uri,
        name:
          asset.fileName ??
          `receipt.${type === "image/png" ? "png" : "jpg"}`,
        type,
      });
    } catch {
      showToast("Could not open the photo library. Please try again.");
    }
  }

  async function handleSubmit() {
    if (loading) return;

    const nextErrors = validateLoan({
      friendName,
      amount,
      dueDate,
      note,
    });

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);

    try {
      await createLoan({
        friendName: friendName.trim(),
        amountPaise: Math.round(Number(amount) * 100),
        dueDate,
        note: note.trim() || undefined,
        receipt: receipt ?? undefined,
      });

      router.back();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Could not save entry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add an entry</Text>

          <Text style={styles.subtitle}>
            Capture the details now so follow-up is simple later.
          </Text>

          <View style={styles.form}>
            <AppInput
              error={errors.friendName}
              label="Friend's name"
              onChangeText={(value) => {
                const filtered = value.replace(/[^a-zA-Z\s'-]/g, "");
                setFriendName(filtered);

                setErrors((current) => ({
                  ...current,
                  friendName: "",
                }));
              }}
              placeholder="Aarav"
              value={friendName}
              maxLength={100}
            />

            <AppInput
              error={errors.amount}
              keyboardType="decimal-pad"
              label="Amount (INR)"
              onChangeText={handleAmountChange}
              placeholder="2500.00"
              value={amount}
            />

            <AppInput
              error={errors.dueDate}
              keyboardType="number-pad"
              label="Due date"
              maxLength={10}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
              value={dueDate}
            />

            <AppInput
              error={errors.note}
              label="Note (optional)"
              multiline
              maxLength={255}
              onChangeText={(value) => {
                setNote(value.slice(0, 255));
                updateFieldError("note");
              }}
              placeholder="Dinner split"
              value={note}
            />

            <View style={styles.receiptSection}>
              <Text style={styles.receiptLabel}>Receipt (optional)</Text>

              {receipt ? (
                <>
                  <Image
                    source={{ uri: receipt.uri }}
                    style={styles.preview}
                    resizeMode="contain"
                  />

                  <View style={styles.receiptActions}>
                    <View style={styles.receiptButton}>
                      <AppButton
                        secondary
                        onPress={chooseReceipt}
                        title="Replace"
                      />
                    </View>

                    <View style={styles.receiptButton}>
                      <AppButton
                        secondary
                        onPress={() => setReceipt(null)}
                        title="Remove"
                      />
                    </View>
                  </View>

                  <Text style={styles.receiptName} numberOfLines={1}>
                    {receipt.name}
                  </Text>
                </>
              ) : (
                <AppButton
                  secondary
                  onPress={chooseReceipt}
                  title="Attach receipt"
                />
              )}

              <Text style={styles.receiptHint}>
                JPEG or PNG, maximum 5 MB.
              </Text>
            </View>

            <AppButton
              loading={loading}
              onPress={handleSubmit}
              title="Add Entry"
            />

            <AppButton
              onPress={() => router.back()}
              secondary
              title="Cancel"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  receiptSection: {
    gap: 8,
  },
  receiptLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  preview: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    height: 180,
    width: "100%",
  },
  receiptActions: {
    flexDirection: "row",
    gap: 10,
  },
  receiptButton: {
    flex: 1,
  },
  receiptName: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
  receiptHint: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
});
