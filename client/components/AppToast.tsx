
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

type Props = {
  message: string;
  visible: boolean;
  type?: "error" | "success";
};

export function AppToast({
  message,
  visible,
  type = "error",
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(10000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [visible, message, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { top: insets.top + 12, opacity },
        type === "success" ? styles.success : styles.error,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.sm,
    left: 20,
    paddingHorizontal: 18,
    paddingVertical: 13,
    position: "absolute",
    right: 20,
    zIndex: 9999,
    elevation: 10,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  success: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
