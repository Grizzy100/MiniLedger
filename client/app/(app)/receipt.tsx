import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL, getAuthToken } from "../../src/api";
import { theme } from "../../constants/theme";

export default function ReceiptScreen() {
  const { id, friendName } = useLocalSearchParams<{ id: string; friendName?: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void getAuthToken().then(setToken);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close receipt" onPress={() => router.back()}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
        <Text style={styles.title}>{friendName ? `${friendName}'s receipt` : "Receipt"}</Text>
        <View style={styles.headerSpace} />
      </View>
      {!token ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : failed ? (
        <Text style={styles.error}>Could not load this receipt.</Text>
      ) : (
        <Image
          accessibilityLabel="Loan receipt"
          onError={(e) => {
  console.warn("[receipt] load failed", `${API_URL}/loans/${id}/receipt`, e.nativeEvent.error);
  setFailed(true);
}}
          resizeMode="contain"
          source={{
            uri: `${API_URL}/loans/${id}/receipt`,
            headers: { Authorization: `Bearer ${token}` },
          }}
          style={styles.image}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: theme.colors.background, flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 20 },
  close: { color: theme.colors.primary, fontFamily: theme.fonts.medium, fontSize: 15 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.bold, fontSize: 17 },
  headerSpace: { width: 45 },
  image: { flex: 1, width: "100%" },
  error: { color: theme.colors.error, fontFamily: theme.fonts.regular, padding: 24, textAlign: "center" },
});
