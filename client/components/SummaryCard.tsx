import { StyleSheet, Text, View } from "react-native";
import type { Summary } from "../src/api";
import { formatRupees } from "../src/validation";
import { theme } from "../constants/theme";

type Tile = {
  label: string;
  value: number;
  color: string;
};

const SUCCESS_GREEN = "#027A48";

export function SummaryCard({ summary }: { summary: Summary }) {
  const tiles: Tile[] = [
    { label: "Total lent",   value: summary.totalLentPaise,   color: theme.colors.text },
    { label: "Outstanding",  value: summary.outstandingPaise, color: theme.colors.primary },
    { label: "Overdue",      value: summary.overduePaise,     color: theme.colors.error },
    { label: "Repaid",       value: summary.totalRepaidPaise, color: SUCCESS_GREEN },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Your lending summary</Text>

      {/* 2 × 2 grid */}
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            <Text style={styles.tileLabel}>{tile.label}</Text>
            <Text style={[styles.tileValue, { color: tile.color }]}>
              {formatRupees(tile.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 16,
  },
  heading: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  tile: {
    // Each tile takes half the row, minus half the gap
    flexBasis: "45%",
    flexGrow: 1,
  },
  tileLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    marginBottom: 4,
  },
  tileValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    fontWeight: "700",
  },
});
