import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayColorRule } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';

interface DayThemeBannerProps {
  rule: DayColorRule;
  filterActive: boolean;
  onToggleFilter: () => void;
}

export function DayThemeBanner({
  rule,
  filterActive,
  onToggleFilter,
}: DayThemeBannerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.dayBadgeContainer}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={[styles.dayText, { color: theme.text }]}>
            {rule.day} Focus
          </Text>
        </View>

        {/* Color Palette Dots */}
        <View style={styles.paletteRow}>
          {rule.hexColors.map((hex, idx) => (
            <View
              key={idx}
              style={[
                styles.swatch,
                { backgroundColor: hex, borderColor: theme.border },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.middleRow}>
        <Text style={[styles.colorTitle, { color: theme.primary }]}>
          {rule.colorName}
        </Text>
        <Text style={[styles.meaningText, { color: theme.textSecondary }]} numberOfLines={1}>
          {rule.meaning}
        </Text>
      </View>

      <Pressable
        onPress={onToggleFilter}
        style={[
          styles.filterToggle,
          {
            backgroundColor: filterActive ? theme.primary : theme.backgroundElement,
            borderColor: filterActive ? theme.primary : theme.border,
          },
        ]}>
        <Ionicons
          name={filterActive ? 'checkmark-circle' : 'funnel-outline'}
          size={14}
          color={filterActive ? '#FFFFFF' : theme.textSecondary}
        />
        <Text
          style={[
            styles.filterText,
            { color: filterActive ? '#FFFFFF' : theme.textSecondary },
          ]}>
          {filterActive ? "Filtering Today's Palette" : 'Filter by Day Palette'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  middleRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  colorTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  meaningText: {
    fontSize: 12,
    marginTop: 2,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
