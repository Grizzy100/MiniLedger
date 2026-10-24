/**
 * constants/theme.ts
 * Single source of truth for all design tokens used across the OTP flow
 * and new screens. Legacy screens continue to use src/styles.ts.
 */

export const theme = {
  colors: {
    background: "#FFFFFF",
    primary: "#10551F",
    primaryPressed: "#0B4218",
    text: "#171C19",
    textSecondary: "#777D79",
    inputBorder: "#DADFDB",
    inputFilled: "#171C19",      // dark box background for entered digits
    inputFilledText: "#FFFFFF",  // white digit on dark box
    error: "#C62828",
  },

  fonts: {
    regular: "Satoshi-Regular" as const,
    medium: "Satoshi-Medium" as const,
    bold: "Satoshi-Bold" as const,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
  },
} as const;
