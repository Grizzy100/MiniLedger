// import { useEffect, useRef, useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { AppToast } from "../../components/AppToast";
// import { AppButton } from "../../components/AppButton";
// import { Logo } from "../../components/Logo";
// import { OtpInput } from "../../components/OtpInput";
// import { requestOtp, verifyOtp } from "../../src/api";
// import { useCountdown } from "../../hooks/useCountdown";
// import { theme } from "../../constants/theme";

// // ─────────────────────────────────────────────────────────────────────────────
// // Toast helper type
// // ─────────────────────────────────────────────────────────────────────────────
// type Toast = { message: string; type: "error" | "success" };

// export default function VerifyOtpScreen() {
//   const params = useLocalSearchParams<{
//     phone: string;
//     countryCode?: string;
//     mockOtp?: string;
//   }>();
//   const phone = Array.isArray(params.phone) ? params.phone[0] : (params.phone ?? "");
//   const countryCode = Array.isArray(params.countryCode)
//     ? params.countryCode[0]
//     : (params.countryCode ?? "+91");
//   const mockOtp = Array.isArray(params.mockOtp)
//     ? params.mockOtp[0]
//     : (params.mockOtp ?? "");

//   const [otp, setOtp] = useState("");
//   const [verifying, setVerifying] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [toast, setToast] = useState<Toast | null>(null);

//   const countdown = useCountdown();
//   const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   useEffect(() => {
//     if (mockOtp) showToast(`Development OTP: ${mockOtp}`, "success");
//   }, [mockOtp]);

//   // ── Toast helpers ────────────────────────────────────────────────────────
//   function showToast(message: string, type: Toast["type"] = "error") {
//     if (toastTimer.current) clearTimeout(toastTimer.current);
//     setToast({ message, type });
//     // Keep the development OTP visible for the full toast duration.
//     toastTimer.current = setTimeout(() => setToast(null), 10000);
//   }

//   // ── Submit ───────────────────────────────────────────────────────────────
//   async function handleSubmit() {
//     if (otp.length !== 6 || verifying) return;
//     setVerifying(true);
//     try {
//       await verifyOtp(phone, otp, countryCode);
//       // Token is saved inside verifyOtp (src/api.ts).
//       router.replace("/(app)/dashboard");
//     } catch (err) {
//       showToast(
//         err instanceof Error ? err.message : "Invalid OTP. Please try again.",
//       );
//       // Clear digits so the user can try again cleanly.
//       setOtp("");
//     } finally {
//       setVerifying(false);
//     }
//   }

//   // ── Resend ───────────────────────────────────────────────────────────────
//   async function handleResend() {
//     if (countdown.active || resending) return;
//     setResending(true);
//     try {
//       const result = await requestOtp(phone, countryCode);
//       // Only start the countdown after the backend confirms the new OTP.
//       countdown.start(30);
//       setOtp("");
//       showToast(
//         result.mockOtp
//           ? `Development OTP: ${result.mockOtp}`
//           : "A new code has been sent.",
//         "success",
//       );
//     } catch (err) {
//       showToast(
//         err instanceof Error ? err.message : "Could not resend OTP. Please try again.",
//       );
//     } finally {
//       setResending(false);
//     }
//   }

//   const canSubmit = otp.length === 6 && !verifying;
//   const resendDisabled = countdown.active || resending;

//   return (
//     <SafeAreaView style={styles.safe}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.flex}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >

//           {/* ── Logo ──────────────────────────────────────────────── */}
//           <View style={styles.logoArea}>
//             <Logo />
//           </View>

//           {/* ── Heading & subtitle ────────────────────────────────── */}
//           <View style={styles.headingArea}>
//             <Text style={styles.heading}>Enter Your Code</Text>
//             <Text style={styles.subtitle}>
//               {`A 6 digit code has been sent to\n${countryCode} ${phone}.`}
//             </Text>
//           </View>

//           {/* ── OTP boxes ─────────────────────────────────────────── */}
//           <View style={styles.otpArea}>
//             <OtpInput
//               autoFocus
//               error={toast?.type === "error" && !!toast.message}
//               onChange={setOtp}
//               value={otp}
//             />
//           </View>

//           {/* ── Resend row ────────────────────────────────────────── */}
//           <View style={styles.resendRow}>
//             <Text style={styles.resendBase}>
//               {"Didn't receive the code? "}
//               <Text
//                 onPress={resendDisabled ? undefined : handleResend}
//                 style={[
//                   styles.resendLink,
//                   resendDisabled && styles.resendLinkMuted,
//                 ]}
//               >
//                 {countdown.active
//                   ? `Resend in ${countdown.seconds}s`
//                   : resending
//                     ? "Sending…"
//                     : "Resend"}
//               </Text>
//             </Text>
//           </View>

//           {/* ── Flexible spacer keeps the button near the bottom ──── */}
//           <View style={styles.spacer} />

//           <View style={styles.buttonWrapper}>
//             <AppButton framed disabled={!canSubmit} loading={verifying} onPress={handleSubmit} title="Submit" />
//           </View>

//           {/* Back link */}
//           <Pressable
//             accessibilityRole="button"
//             onPress={() => router.back()}
//             style={styles.backLink}
//           >
//             <Text style={styles.backLinkText}>← Change phone number</Text>
//           </Pressable>

//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Toast — rendered outside ScrollView so it overlays everything */}
//       {toast ? (
//         <AppToast
//           key={toast.message}
//           message={toast.message}
//           type={toast.type}
//           visible
//         />
//       ) : null}
//     </SafeAreaView>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Styles
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: {
//     backgroundColor: theme.colors.background,
//     flex: 1,
//   },
//   flex: { flex: 1 },
//   scroll: {
//     flexGrow: 1,
//     paddingBottom: 24,
//     paddingHorizontal: 24,
//   },

//   // Logo
//   logoArea: {
//     alignItems: "center",
//     marginBottom: 36,
//     marginTop: 52,
//   },

//   // Heading
//   headingArea: {
//     alignItems: "center",
//     marginBottom: 32,
//   },
//   heading: {
//     color: theme.colors.text,
//     fontFamily: theme.fonts.bold,
//     fontSize: 28,
//     fontWeight: "700",
//     letterSpacing: -0.3,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   subtitle: {
//     color: theme.colors.textSecondary,
//     fontFamily: theme.fonts.regular,
//     fontSize: 15,
//     lineHeight: 23,
//     textAlign: "center",
//   },

//   // OTP boxes
//   otpArea: {
//     marginBottom: 18,
//   },

//   // Resend
//   resendRow: {
//     alignItems: "center",
//   },
//   resendBase: {
//     color: theme.colors.textSecondary,
//     fontFamily: theme.fonts.regular,
//     fontSize: 14,
//     textAlign: "center",
//   },
//   resendLink: {
//     color: theme.colors.primary,
//     fontFamily: theme.fonts.bold,
//     fontWeight: "700",
//   },
//   resendLinkMuted: {
//     color: theme.colors.textSecondary,
//   },

//   // Spacer
//   spacer: {
//     flex: 1,
//     minHeight: 56,
//   },

//   // Submit button — closely matches screenshot: full-width, green, minimal radius
//   buttonWrapper: {
//     marginTop: 16,
//   },
//   button: {
//     alignItems: "center",
//     backgroundColor: theme.colors.primary,
//     borderRadius: theme.radius.xs,
//     height: 52,
//     justifyContent: "center",
//   },
//   buttonDisabled: {
//     backgroundColor: "#B0B0B0",
//   },
//   buttonPressed: {
//     backgroundColor: theme.colors.primaryPressed,
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontFamily: theme.fonts.medium,
//     fontSize: 16,
//     fontWeight: "600",
//     letterSpacing: 0.2,
//   },

//   // Back link
//   backLink: {
//     alignItems: "center",
//     marginTop: 16,
//     paddingVertical: 4,
//   },
//   backLinkText: {
//     color: theme.colors.textSecondary,
//     fontFamily: theme.fonts.regular,
//     fontSize: 13,
//   },
// });




import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppToast } from "../../components/AppToast";
import { AppButton } from "../../components/AppButton";
import { Logo } from "../../components/Logo";
import { OtpInput } from "../../components/OtpInput";
import { requestOtp, verifyOtp } from "../../src/api";
import { useCountdown } from "../../hooks/useCountdown";
import { theme } from "../../constants/theme";

type Toast = { message: string; type: "error" | "success" };

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{
    phone: string;
    countryCode?: string;
    mockOtp?: string;
  }>();

  const phone = Array.isArray(params.phone)
    ? params.phone[0]
    : (params.phone ?? "");

  const countryCode = Array.isArray(params.countryCode)
    ? params.countryCode[0]
    : (params.countryCode ?? "+91");

  const mockOtp = Array.isArray(params.mockOtp)
    ? params.mockOtp[0]
    : (params.mockOtp ?? "");

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const countdown = useCountdown();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "error") => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      setToast({ message, type });

      toastTimer.current = setTimeout(() => {
        setToast(null);
        toastTimer.current = null;
      }, 10000);
    },
    [],
  );

  useEffect(() => {
    if (mockOtp) {
      showToast(`Development OTP: ${mockOtp}`, "success");
    }
  }, [mockOtp, showToast]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  async function handleSubmit() {
    if (otp.length !== 6 || verifying) return;

    setVerifying(true);

    try {
      await verifyOtp(phone, otp, countryCode);
      router.replace("/(app)/dashboard");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Invalid OTP. Please try again.",
      );
      setOtp("");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (countdown.active || resending) return;

    setResending(true);

    try {
      const result = await requestOtp(phone, countryCode);

      countdown.start(30);
      setOtp("");

      showToast(
        result.mockOtp
          ? `Development OTP: ${result.mockOtp}`
          : "A new code has been sent.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Could not resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  }

  const canSubmit = otp.length === 6 && !verifying;
  const resendDisabled = countdown.active || resending;

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
          <View style={styles.logoArea}>
            <Logo />
          </View>

          <View style={styles.headingArea}>
            <Text style={styles.heading}>Enter Your Code</Text>
            <Text style={styles.subtitle}>
              {`A 6 digit code has been sent to\n${countryCode} ${phone}.`}
            </Text>
          </View>

          <View style={styles.otpArea}>
            <OtpInput
              autoFocus
              error={toast?.type === "error" && !!toast.message}
              onChange={setOtp}
              value={otp}
            />
          </View>

          <View style={styles.resendRow}>
            <Text style={styles.resendBase}>
              {"Didn't receive the code? "}
              <Text
                onPress={resendDisabled ? undefined : handleResend}
                style={[
                  styles.resendLink,
                  resendDisabled && styles.resendLinkMuted,
                ]}
              >
                {countdown.active
                  ? `Resend in ${countdown.seconds}s`
                  : resending
                    ? "Sending…"
                    : "Resend"}
              </Text>
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonWrapper}>
            <AppButton
              framed
              disabled={!canSubmit}
              loading={verifying}
              onPress={handleSubmit}
              title="Submit"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>← Change phone number</Text>
          </Pressable>
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
    marginBottom: 32,
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
  otpArea: {
    marginBottom: 18,
  },
  resendRow: {
    alignItems: "center",
  },
  resendBase: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    textAlign: "center",
  },
  resendLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
  },
  resendLinkMuted: {
    color: theme.colors.textSecondary,
  },
  spacer: {
    flex: 1,
    minHeight: 56,
  },
  buttonWrapper: {
    marginTop: 16,
  },
  backLink: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 4,
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
  },
});
