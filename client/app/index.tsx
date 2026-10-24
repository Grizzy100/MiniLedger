
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { hasSession } from "../src/api";
import { theme } from "../constants/theme";

export default function Index() {
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;

    Promise.all([
      hasSession().catch(() => false),
      new Promise<void>((resolve) => setTimeout(resolve, 2300)),
    ])
      .then(([result]) => {
        if (!active) return;

        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(splashScale, {
            toValue: 0.94,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (active) {
            router.replace(result ? "/(app)/dashboard" : "/(auth)/phone");
          }
        });
      })

    return () => {
      active = false;
    };
  }, [splashOpacity, splashScale]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: splashOpacity, transform: [{ scale: splashScale }] },
      ]}
    >
      <Animated.View style={styles.brand}>
        <Image
          accessibilityLabel="MiniLedger logo"
          resizeMode="contain"
          source={require("../assets/Removed Background.png")}
          style={styles.logo}
        />

        <Text accessibilityRole="header" style={styles.brandName}>
          MiniLedger
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 64,
    width: 64,
  },
  brandName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 12,
    textAlign: "center",
  },
});
