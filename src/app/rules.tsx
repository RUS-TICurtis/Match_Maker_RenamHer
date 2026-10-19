import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_DAY_COLOR_RULES, getTodayDayOfWeek } from '@/constants/day-rules';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { DayColorRule } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';

export default function RulesScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const today = getTodayDayOfWeek();
  const [rules] = useState<DayColorRule[]>(DEFAULT_DAY_COLOR_RULES);

  const handleEditRule = (rule: DayColorRule) => {
    Alert.alert(
      `Customize ${rule.day}`,
      `Currently set to: ${rule.colorName}.\nMeaning: ${rule.meaning}\n\nYou can set your own custom personal palette for this day in future updates.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>COLOR RULES</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Weekday Astrological & Traditional Style Guide
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.infoBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Dressing according to the daily color frequency aligns your wardrobe with natural cycles, enhances confidence, and simplifies your morning decision-making.
          </Text>
        </View>

        {/* 7-Day Color Schedule */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Color Schedule</Text>

        <View style={styles.rulesList}>
          {rules.map((rule) => {
            const isToday = rule.day === today;
            const matchingPieces = INITIAL_WARDROBE_ITEMS.filter((item) =>
              item.recommendedDays?.includes(rule.day)
            ).length;

            return (
              <Pressable
                key={rule.day}
                onPress={() => handleEditRule(rule)}
                style={[
                  styles.ruleCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isToday ? theme.primary : theme.border,
                    borderWidth: isToday ? 2 : 1,
                  },
                ]}>
                <View style={styles.ruleCardHeader}>
                  <View style={styles.dayLabelRow}>
                    <Text style={[styles.ruleDay, { color: theme.text }]}>
                      {rule.day}
                    </Text>
                    {isToday && (
                      <View style={[styles.todayPill, { backgroundColor: theme.primary }]}>
                        <Text style={styles.todayPillText}>TODAY</Text>
                      </View>
                    )}
                  </View>

                  {/* Swatches */}
                  <View style={styles.swatchGroup}>
                    {rule.hexColors.map((hex, i) => (
                      <View
                        key={i}
                        style={[
                          styles.swatchDot,
                          { backgroundColor: hex, borderColor: theme.border },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.ruleCardBody}>
                  <Text style={[styles.colorTitle, { color: theme.primary }]}>
                    {rule.colorName}
                  </Text>
                  <Text style={[styles.meaning, { color: theme.textSecondary }]}>
                    {rule.meaning}
                  </Text>
                </View>

                <View style={[styles.ruleFooter, { borderTopColor: theme.border }]}>
                  <Text style={[styles.pieceCount, { color: theme.textSecondary }]}>
                    {matchingPieces} pieces in closet match
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Style Guidelines */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
          Wardrobe Principles
        </Text>
        <View style={[styles.principlesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.principleRow}>
            <Ionicons name="camera-reverse-outline" size={18} color={theme.primary} />
            <Text style={[styles.principleText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: theme.text }}>Ghost Alignment:</Text> Always stand at mirror distance with eye level centered for consistent slot alignment.
            </Text>
          </View>
          <View style={styles.principleRow}>
            <Ionicons name="color-palette-outline" size={18} color={theme.primary} />
            <Text style={[styles.principleText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: theme.text }}>The 60-30-10 Rule:</Text> 60% dominant color (top/bottom), 30% secondary (layer/pants), 10% accent (shoes/accessories).
            </Text>
          </View>
          <View style={styles.principleRow}>
            <Ionicons name="watch-outline" size={18} color={theme.primary} />
            <Text style={[styles.principleText, { color: theme.textSecondary }]}>
              <Text style={{ fontWeight: '700', color: theme.text }}>Accessories Match:</Text> Match metals (silver watch with silver buckle) and leather tones (brown shoes with brown belt).
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  rulesList: {
    gap: 12,
  },
  ruleCard: {
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
  },
  ruleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDay: {
    fontSize: 16,
    fontWeight: '800',
  },
  todayPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  swatchGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  ruleCardBody: {
    marginVertical: 8,
  },
  colorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  meaning: {
    fontSize: 12,
    marginTop: 2,
  },
  ruleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  pieceCount: {
    fontSize: 11,
  },
  principlesCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  principleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  principleText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
