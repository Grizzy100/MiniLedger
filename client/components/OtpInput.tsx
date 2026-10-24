import type React from "react";
import { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { theme } from "../constants/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Number of digits. Defaults to 6. */
  length?: number;
  /** Highlight boxes in error red when true. */
  error?: boolean;
  autoFocus?: boolean;
};

/**
 * components/OtpInput.tsx
 *
 * Six visually distinct, evenly sized boxes backed by a single hidden
 * TextInput. Tapping anywhere on the row focuses the hidden input so
 * the system keyboard appears. The focused box is identified by index
 * rather than native focus events, keeping focus tracking reliable.
 *
 * Box states (mutually exclusive):
 *   • filled   — digit entered; dark background, white text
 *   • focused  — next empty slot; primary-green border, white bg
 *   • empty    — not yet reached; neutral border, white bg
 *
 * Box width is derived from the device's screen width so the row
 * never overflows on narrow phones.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  autoFocus = false,
}: Props) {
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const { width } = useWindowDimensions();

  // Calculate a box width that fits the screen regardless of device size.
  const SIDE_PADDING = 48;   // total horizontal padding of the parent screen
  const GAP = 10;            // gap between boxes
  const maxBoxWidth = 52;
  const computed = Math.floor(
    (width - SIDE_PADDING - GAP * (length - 1)) / length,
  );
  const boxWidth = Math.min(maxBoxWidth, computed);
  const boxHeight = boxWidth + 10; // slightly taller than wide

  // Pad value array to `length` so map always iterates over all slots.
  const digits = Array.from<string>({ length }).map((_, i) => value[i] ?? "");

  // The focused slot is always the next empty position, capped at last index.
  const focusedIndex = Math.min(value.length, length - 1);

  return (
    <View>
      <View style={styles.inputArea}>
        <View style={[styles.row, { gap: GAP }]}>
          {digits.map((digit, i) => {
            const isFilled = digit !== "";
            const isFocused = !isFilled && i === focusedIndex;

            return (
              <View
                key={i}
                style={[
                  styles.box,
                  {
                    width: boxWidth,
                    height: boxHeight,
                    borderRadius: theme.radius.xs,
                  },
                  isFilled && styles.boxFilled,
                  isFocused && styles.boxFocused,
                  !isFilled && !isFocused && styles.boxEmpty,
                  error && styles.boxError,
                ]}
              >
                <Text
                  style={[styles.digit, isFilled && styles.digitOnDark]}
                  allowFontScaling={false}
                >
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          accessibilityLabel="Enter OTP"
          autoFocus={autoFocus}
          caretHidden
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
          style={styles.keyboardInput}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  // ── Box variants ──────────────────────────────────────────────────
  box: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
  },
  boxEmpty: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.inputBorder,
  },
  boxFocused: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  boxFilled: {
    backgroundColor: theme.colors.inputFilled,
    borderColor: theme.colors.inputFilled,
  },
  boxError: {
    borderColor: theme.colors.error,
  },

  // ── Digit text ────────────────────────────────────────────────────
  digit: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    fontWeight: "700",
  },
  digitOnDark: {
    color: theme.colors.inputFilledText,
  },

  inputArea: {
    minHeight: 62,
    position: "relative",
  },
  keyboardInput: {
    bottom: 0,
    color: "transparent",
    fontSize: 1,
    left: 0,
    opacity: 0.02,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
