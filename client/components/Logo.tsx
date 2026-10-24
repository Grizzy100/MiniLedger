import { Image, Text } from "react-native";
import { theme } from "../constants/theme";

type Props = {
  /** Override the rendered size. Defaults to 28. */
  size?: number;
};

// Attempt to load the project icon as the logo.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoAsset = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../assets/Removed Background.png") as number;
  } catch {
    return null;
  }
})();

/**
 * components/Logo.tsx
 *
 * Displays the MiniLedger brand mark.
 * Falls back to a styled text element if the image asset is unavailable,
 * so the screen always shows something meaningful.
 */
export function Logo({ size = 28 }: Props) {
  if (logoAsset !== null) {
    return (
      <Image
        accessibilityLabel="MiniLedger"
        accessibilityRole="image"
        resizeMode="contain"
        source={logoAsset}
        style={{ height: 64, width: 64 }}
      />
    );
  }

  // Text fallback — used if the asset is missing.
  return (
    <Text
      accessibilityLabel="MiniLedger"
      accessibilityRole="header"
      style={{
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
        fontSize: size,
        fontWeight: "800",
        letterSpacing: -0.5,
        textAlign: "center",
      }}
    >
      MiniLedger
    </Text>
  );
}
