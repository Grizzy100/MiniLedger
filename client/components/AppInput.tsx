import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../constants/theme";

type Props = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  containerStyle?: React.ComponentProps<typeof View>["style"];
};

/**
 * components/AppInput.tsx
 *
 * Labeled text input with optional inline error text.
 * Uses theme tokens so it stays consistent across auth and main screens.
 */
export function AppInput({ label, error, containerStyle, ...props }: Props) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.inputMultiline : null,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    marginTop: 5,
  },
});
