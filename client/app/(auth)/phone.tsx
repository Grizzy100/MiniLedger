import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { AppToast } from "../../components/AppToast";
import { Logo } from "../../components/Logo";
import { requestOtp } from "../../src/api";
import { validatePhone } from "../../src/validation";
import { theme } from "../../constants/theme";

type Toast = { message: string; type: "error" | "success" };

export default function PhoneScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-18)).current;
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(logoTranslateY, {
        toValue: 0,
        damping: 16,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoTranslateY]);

  function showToast(message: string, type: Toast["type"] = "error") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 10000);
  }

  async function handleSubmit() {
    const cleanPhone = phone.replace(/\D/g, "");
    const validationError = validatePhone(cleanPhone);
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    try {
      const result = await requestOtp(cleanPhone, countryCode);
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phone: cleanPhone, countryCode, mockOtp: result.mockOtp ?? "" },
      });
    } catch (requestError) {
      showToast(
        requestError instanceof Error
          ? requestError.message
          : "Could not send OTP. Please try again.",
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
          {/* Logo — same position as OTP screen */}
          <Animated.View
            style={[
              styles.logoArea,
              {
                opacity: logoOpacity,
                transform: [{ translateY: logoTranslateY }],
              },
            ]}
          >
            <Logo />
          </Animated.View>

          {/* Heading */}
          <View style={styles.headingArea}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Keep track of every rupee you lend,{"\n"}without the awkward spreadsheet.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formArea}>
            <Text style={styles.phoneLabel}>Phone number</Text>
            <View style={styles.phoneRow}>
              <Pressable
                accessibilityLabel="Country code"
                accessibilityRole="button"
                onPress={() => setCountryPickerOpen(true)}
                style={styles.countryCode}
              >
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
              <AppInput
                autoFocus
                containerStyle={styles.phoneInput}
                error={error}
                keyboardType="phone-pad"
                label=""
                maxLength={10}
                onChangeText={(t) => {
                  setPhone(t.replace(/\D/g, ""));
                  if (error) setError("");
                }}
                placeholder="9876543210"
                value={phone}
              />
            </View>
            <Text style={styles.hint}>
              We&apos;ll send a one-time password to your selected number.
            </Text>
            <View style={styles.buttonFrame}>
              <AppButton loading={loading} onPress={handleSubmit} title="Send OTP" />
            </View>
          </View>

          <View style={styles.spacer} />
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

      <Modal
        animationType="fade"
        transparent
        visible={countryPickerOpen}
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCountryPickerOpen(false)}>
          <View style={styles.countryMenu}>
            {[
              ["+91", "India"],
              ["+1", "United States"],
              ["+44", "United Kingdom"],
            ].map(([code, name]) => (
              <Pressable
                key={code}
                accessibilityRole="button"
                onPress={() => {
                  setCountryCode(code);
                  setCountryPickerOpen(false);
                }}
                style={styles.countryOption}
              >
                <Text style={styles.countryOptionCode}>{code}</Text>
                <Text style={styles.countryOptionName}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },

  logoArea: {
    alignItems: "center",
    marginBottom: 36,
    marginTop: 52,
  },

  headingArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  heading: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },

  formArea: {
    gap: 16,
  },
  hint: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
  },
  phoneLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  phoneRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  countryCode: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  countryCodeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
  chevron: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    marginLeft: 6,
    marginTop: -4,
  },
  phoneInput: {
    flex: 1,
  },
  buttonFrame: {
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    padding: 3,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  countryMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.md,
    elevation: 6,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: "100%",
  },
  countryOption: {
    alignItems: "center",
    borderBottomColor: theme.colors.inputBorder,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  countryOptionCode: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    width: 58,
  },
  countryOptionName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },

  spacer: { flex: 1, minHeight: 48 },
});
