import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  /** Renders a ghost/outline variant instead of the filled primary style. */
  secondary?: boolean;
  disabled?: boolean;
  framed?: boolean;
};

/**
 * components/AppButton.tsx
 *
 * Primary button: deep-green fill, white Satoshi text.
 * Secondary button: white fill, green border and text.
 * Disabled and loading states are visually distinct.
 */
export function AppButton({
  title,
  onPress,
  loading = false,
  secondary = false,
  disabled = false,
  framed = false,
}: Props) {
  const isDisabled = disabled || loading;

  const button = (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        framed && styles.framedInner,
        secondary ? styles.secondary : styles.primary,
        isDisabled && (secondary ? styles.secondaryDisabled : styles.primaryDisabled),
        pressed && !isDisabled && (secondary ? styles.secondaryPressed : styles.primaryPressed),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? theme.colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={[styles.label, secondary && styles.labelSecondary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );

  return framed ? <View style={styles.frame}>{button}</View> : button;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.radius.xs,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  frame: {
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
    borderWidth: 1.5,
    padding: 3,
  },
  framedInner: {
    borderRadius: 2,
  },

  // Primary (filled green)
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  primaryDisabled: {
    backgroundColor: "#B0B0B0",
  },

  // Secondary (ghost)
  secondary: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  secondaryPressed: {
    backgroundColor: "#F0F7F1",
  },
  secondaryDisabled: {
    borderColor: "#B0B0B0",
  },

  // Labels
  label: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  labelSecondary: {
    color: theme.colors.primary,
  },
});
