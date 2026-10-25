import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  clearAllData,
} from '@/services/storage';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      saveSettings(updated);
      if (settings.hapticsEnabled) {
        Haptics.selectionAsync().catch(() => {});
      }
    },
    [settings]
  );

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to their defaults. Your wardrobe items and saved outfits will NOT be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings(DEFAULT_SETTINGS);
            saveSettings(DEFAULT_SETTINGS);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL your wardrobe items, saved outfits, and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            clearAllData().then(() => {
              setSettings(DEFAULT_SETTINGS);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
              Alert.alert('Done', 'All data has been cleared. Restart the app to see changes.');
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading settings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>SETTINGS</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Customize your experience
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.resetBtn,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              transform: [{ scale: pressed ? 0.94 : 1.0 }],
            },
          ]}
          onPress={handleResetSettings}>
          <Ionicons name="refresh-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─── General Section ───────────────────────── */}
        <SectionHeader title="General" icon="settings-outline" theme={theme} />

        <SettingRow
          icon="color-palette-outline"
          iconBg="rgba(79, 70, 229, 0.12)"
          iconColor={theme.primary}
          title="Day Color Banner"
          description="Show today's color rule on the Match screen"
          theme={theme}>
          <Switch
            value={settings.showDayColorBanner}
            onValueChange={(v) => updateSetting('showDayColorBanner', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        <SettingRow
          icon="phone-portrait-outline"
          iconBg="rgba(234, 88, 12, 0.12)"
          iconColor="#EA580C"
          title="Haptic Feedback"
          description="Tactile vibration on button presses and selections"
          theme={theme}>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSetting('hapticsEnabled', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        <SettingRow
          icon="dice-outline"
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#10B981"
          title="Auto-Shuffle on Open"
          description="Randomize the outfit when launching the Match screen"
          theme={theme}>
          <Switch
            value={settings.autoShuffleOnOpen}
            onValueChange={(v) => updateSetting('autoShuffleOnOpen', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        <SettingRow
          icon="trash-outline"
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="#EF4444"
          title="Confirm Before Deleting"
          description="Ask for confirmation when removing wardrobe items"
          theme={theme}>
          <Switch
            value={settings.confirmBeforeDelete}
            onValueChange={(v) => updateSetting('confirmBeforeDelete', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        {/* ─── Wardrobe Section ──────────────────────── */}
        <SectionHeader title="Wardrobe" icon="shirt-outline" theme={theme} />

        <SettingRow
          icon="grid-outline"
          iconBg="rgba(99, 102, 241, 0.12)"
          iconColor="#6366F1"
          title="Grid Columns"
          description="Number of columns in the closet grid"
          theme={theme}>
          <View style={styles.segmentedRow}>
            {([2, 3] as const).map((cols) => (
              <Pressable
                key={cols}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor:
                      settings.wardrobeColumns === cols ? theme.primary : theme.backgroundElement,
                    borderColor:
                      settings.wardrobeColumns === cols ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => updateSetting('wardrobeColumns', cols)}>
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: settings.wardrobeColumns === cols ? '#FFFFFF' : theme.text,
                    },
                  ]}>
                  {cols}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>

        <SettingRow
          icon="pricetag-outline"
          iconBg="rgba(245, 158, 11, 0.12)"
          iconColor="#F59E0B"
          title="Category Tags"
          description="Display category labels on closet cards"
          theme={theme}>
          <Switch
            value={settings.showCategoryTags}
            onValueChange={(v) => updateSetting('showCategoryTags', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        {/* ─── Camera & Image Section ────────────────── */}
        <SectionHeader title="Camera & Images" icon="camera-outline" theme={theme} />

        <SettingRow
          icon="image-outline"
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="#3B82F6"
          title="Image Quality"
          description={`${Math.round(settings.imageQuality * 100)}% compression quality`}
          theme={theme}>
          <View style={styles.qualityRow}>
            {[0.5, 0.7, 0.85, 1.0].map((q) => (
              <Pressable
                key={q}
                style={[
                  styles.qualityChip,
                  {
                    backgroundColor:
                      settings.imageQuality === q ? theme.primary : theme.backgroundElement,
                    borderColor:
                      settings.imageQuality === q ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => updateSetting('imageQuality', q)}>
                <Text
                  style={[
                    styles.qualityChipText,
                    {
                      color: settings.imageQuality === q ? '#FFFFFF' : theme.text,
                    },
                  ]}>
                  {Math.round(q * 100)}%
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>

        <SettingRow
          icon="resize-outline"
          iconBg="rgba(139, 92, 246, 0.12)"
          iconColor="#8B5CF6"
          title="Max Image Size"
          description={`Images resized to max ${settings.maxImageDimension}px wide`}
          theme={theme}>
          <View style={styles.qualityRow}>
            {[720, 1080, 1440].map((dim) => (
              <Pressable
                key={dim}
                style={[
                  styles.qualityChip,
                  {
                    backgroundColor:
                      settings.maxImageDimension === dim ? theme.primary : theme.backgroundElement,
                    borderColor:
                      settings.maxImageDimension === dim ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => updateSetting('maxImageDimension', dim)}>
                <Text
                  style={[
                    styles.qualityChipText,
                    {
                      color: settings.maxImageDimension === dim ? '#FFFFFF' : theme.text,
                    },
                  ]}>
                  {dim}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>

        {/* ─── Background Removal (Advanced) ─────────── */}
        <SectionHeader title="Advanced" icon="flask-outline" theme={theme} />

        <SettingRow
          icon="cut-outline"
          iconBg="rgba(236, 72, 153, 0.12)"
          iconColor="#EC4899"
          title="Background Removal"
          description="Use Remove.bg API to auto-crop clothing photos"
          theme={theme}>
          <Switch
            value={settings.backgroundRemovalEnabled}
            onValueChange={(v) => updateSetting('backgroundRemovalEnabled', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </SettingRow>

        {settings.backgroundRemovalEnabled && (
          <View style={[styles.apiKeyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.apiKeyLabel, { color: theme.textSecondary }]}>
              REMOVE.BG API KEY
            </Text>
            <TextInput
              style={[
                styles.apiKeyInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Paste your API key here"
              placeholderTextColor={theme.textSecondary}
              value={settings.removeBgApiKey}
              onChangeText={(v) => updateSetting('removeBgApiKey', v)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.apiKeyHint, { color: theme.textSecondary }]}>
              Get a free key at remove.bg/api
            </Text>
          </View>
        )}

        {/* ─── Danger Zone ───────────────────────────── */}
        <SectionHeader title="Danger Zone" icon="warning-outline" theme={theme} />

        <Pressable
          style={({ pressed }) => [
            styles.dangerBtn,
            {
              backgroundColor: pressed ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              borderColor: '#EF4444',
            },
          ]}
          onPress={handleClearAllData}>
          <Ionicons name="nuclear-outline" size={18} color="#EF4444" />
          <View style={styles.dangerTextCol}>
            <Text style={styles.dangerTitle}>Clear All App Data</Text>
            <Text style={styles.dangerDesc}>
              Permanently delete wardrobe, outfits, and settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Match Maker RenamHer v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
            Your personal style companion
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ─────────────────────────────────────

type AppTheme = (typeof Colors)[keyof typeof Colors];

function SectionHeader({
  title,
  icon,
  theme,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: AppTheme;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={14} color={theme.textSecondary} />
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  theme,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  theme: AppTheme;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingTextCol}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 60,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  qualityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  qualityChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  apiKeyContainer: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginLeft: 48,
  },
  apiKeyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  apiKeyInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  apiKeyHint: {
    fontSize: 10,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerDesc: {
    color: '#F87171',
    fontSize: 11,
    marginTop: 2,
  },
  dangerTextCol: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerSubtext: {
    fontSize: 10,
  },
});
