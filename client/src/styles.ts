import { StyleSheet } from "react-native";

export const colors = {
  ink: "#17202A",
  muted: "#667085",
  primary: "#176B87",
  primaryDark: "#0E4D63",
  background: "#F6F8FA",
  card: "#FFFFFF",
  border: "#DDE4EA",
  danger: "#B42318",
  dangerBackground: "#FEF3F2",
  success: "#027A48",
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  label: { color: colors.ink, fontSize: 14, fontWeight: "600", marginBottom: 7 },
  error: { color: colors.danger, fontSize: 13, marginTop: 5 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
});
