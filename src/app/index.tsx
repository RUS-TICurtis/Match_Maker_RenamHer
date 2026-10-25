import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  Dimensions,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SlotMachineTier } from '@/components/SlotMachineTier';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { getDayColorRule, getTodayDayOfWeek } from '@/constants/day-rules';
import { Colors } from '@/constants/theme';
import {
  loadWardrobeItems,
  loadSettings,
  addSavedOutfit,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@/services/storage';
import { WardrobeItem, SavedOutfit } from '@/types/wardrobe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchMakerScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const today = getTodayDayOfWeek();
  const todayRule = getDayColorRule(today);

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE_ITEMS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [filterTodayColor, setFilterTodayColor] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [hideHUD, setHideHUD] = useState(false);

  // Categorized items from loaded wardrobe
  const allHair = wardrobe.filter((i) => i.category === 'hair');
  const allTops = wardrobe.filter((i) => i.category === 'top');
  const allBottoms = wardrobe.filter((i) => i.category === 'bottom');
  const allShoes = wardrobe.filter((i) => i.category === 'shoes');

  // Filtered lists if day filter is active
  const hairItems = filterTodayColor
    ? allHair.filter((i) => i.recommendedDays?.includes(today)).length > 0
      ? allHair.filter((i) => i.recommendedDays?.includes(today))
      : allHair
    : allHair;
  const topItems = filterTodayColor
    ? allTops.filter((i) => i.recommendedDays?.includes(today)).length > 0
      ? allTops.filter((i) => i.recommendedDays?.includes(today))
      : allTops
    : allTops;
  const bottomItems = filterTodayColor
    ? allBottoms.filter((i) => i.recommendedDays?.includes(today)).length > 0
      ? allBottoms.filter((i) => i.recommendedDays?.includes(today))
      : allBottoms
    : allBottoms;
  const shoeItems = filterTodayColor
    ? allShoes.filter((i) => i.recommendedDays?.includes(today)).length > 0
      ? allShoes.filter((i) => i.recommendedDays?.includes(today))
      : allShoes
    : allShoes;

  // Selected Indices
  const [selectedHairIdx, setSelectedHairIdx] = useState(0);
  const [selectedTopIdx, setSelectedTopIdx] = useState(0);
  const [selectedBottomIdx, setSelectedBottomIdx] = useState(0);
  const [selectedShoeIdx, setSelectedShoeIdx] = useState(0);

  // Lock States
  const [lockedHair, setLockedHair] = useState(false);
  const [lockedTop, setLockedTop] = useState(false);
  const [lockedBottom, setLockedBottom] = useState(false);
  const [lockedShoe, setLockedShoe] = useState(false);

  // Load Wardrobe & Settings from local storage
  useEffect(() => {
    Promise.all([loadWardrobeItems(), loadSettings()]).then(([items, s]) => {
      setWardrobe(items);
      setSettings(s);

      // Auto-shuffle on open if enabled in settings
      if (s.autoShuffleOnOpen) {
        const hair = items.filter((i) => i.category === 'hair');
        const tops = items.filter((i) => i.category === 'top');
        const bottoms = items.filter((i) => i.category === 'bottom');
        const shoes = items.filter((i) => i.category === 'shoes');
        if (hair.length > 1) setSelectedHairIdx(Math.floor(Math.random() * hair.length));
        if (tops.length > 1) setSelectedTopIdx(Math.floor(Math.random() * tops.length));
        if (bottoms.length > 1) setSelectedBottomIdx(Math.floor(Math.random() * bottoms.length));
        if (shoes.length > 1) setSelectedShoeIdx(Math.floor(Math.random() * shoes.length));
      }
    });
  }, []);

  // Selected Item References
  const currentHair = hairItems[selectedHairIdx] || allHair[0];
  const currentTop = topItems[selectedTopIdx] || allTops[0];
  const currentBottom = bottomItems[selectedBottomIdx] || allBottoms[0];
  const currentShoe = shoeItems[selectedShoeIdx] || allShoes[0];

  // Dynamic Height Distribution across the full viewport
  // Deduct insets and the dynamic bottom tab bar height (56 + bottom inset)
  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;
  const tabHeight = 56 + bottomInset;
  const canvasHeight = windowHeight - insets.top - tabHeight;
  const hairHeight = Math.round(canvasHeight * 0.18);
  const topHeight = Math.round(canvasHeight * 0.32);
  const bottomHeight = Math.round(canvasHeight * 0.36);
  const shoeHeight = canvasHeight - hairHeight - topHeight - bottomHeight;

  // Random Shuffle / Spin Slot Machine
  const handleShuffle = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (!lockedHair && hairItems.length > 1) {
      setSelectedHairIdx(Math.floor(Math.random() * hairItems.length));
    }
    if (!lockedTop && topItems.length > 1) {
      setSelectedTopIdx(Math.floor(Math.random() * topItems.length));
    }
    if (!lockedBottom && bottomItems.length > 1) {
      setSelectedBottomIdx(Math.floor(Math.random() * bottomItems.length));
    }
    if (!lockedShoe && shoeItems.length > 1) {
      setSelectedShoeIdx(Math.floor(Math.random() * shoeItems.length));
    }
  };

  const handleToggleLockAll = () => {
    const allLocked = lockedHair && lockedTop && lockedBottom && lockedShoe;
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(
        allLocked
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    }
    setLockedHair(!allLocked);
    setLockedTop(!allLocked);
    setLockedBottom(!allLocked);
    setLockedShoe(!allLocked);
  };

  const handleResetOutfit = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setSelectedHairIdx(0);
    setSelectedTopIdx(0);
    setSelectedBottomIdx(0);
    setSelectedShoeIdx(0);
    setLockedHair(false);
    setLockedTop(false);
    setLockedBottom(false);
    setLockedShoe(false);
    setMenuModalVisible(false);
  };

  const handleSaveOutfit = async () => {
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}`,
      name: `${currentTop?.name || 'Look'} & ${currentBottom?.name || 'Pants'}`,
      hairId: currentHair?.id,
      topId: currentTop?.id || '',
      bottomId: currentBottom?.id || '',
      shoesId: currentShoe?.id || '',
      dayTag: today,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    await addSavedOutfit(newOutfit);

    Alert.alert(
      'Outfit Saved!',
      `Saved: ${currentTop?.name || 'Top'} with ${currentBottom?.name || 'Bottom'} and ${currentShoe?.name || 'Shoes'}. You can find it in your Lookbook!`,
      [{ text: 'Great' }]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Immersive Seamless Mannequin Canvas */}
      <View style={[styles.canvas, { paddingTop: insets.top, height: canvasHeight + insets.top }]}>
        {/* Tier 1: Hair & Grooming */}
        <SlotMachineTier
          category="hair"
          title="Hair"
          items={hairItems}
          selectedIndex={selectedHairIdx}
          onSelectIndex={setSelectedHairIdx}
          isLocked={lockedHair}
          onToggleLock={() => setLockedHair((prev) => !prev)}
          height={hairHeight}
        />

        {/* Tier 2: Top / Shirt */}
        <SlotMachineTier
          category="top"
          title="Top"
          items={topItems}
          selectedIndex={selectedTopIdx}
          onSelectIndex={setSelectedTopIdx}
          isLocked={lockedTop}
          onToggleLock={() => setLockedTop((prev) => !prev)}
          height={topHeight}
        />

        {/* Tier 3: Bottom / Pants */}
        <SlotMachineTier
          category="bottom"
          title="Bottom"
          items={bottomItems}
          selectedIndex={selectedBottomIdx}
          onSelectIndex={setSelectedBottomIdx}
          isLocked={lockedBottom}
          onToggleLock={() => setLockedBottom((prev) => !prev)}
          height={bottomHeight}
        />

        {/* Tier 4: Footwear */}
        <SlotMachineTier
          category="shoes"
          title="Shoes"
          items={shoeItems}
          selectedIndex={selectedShoeIdx}
          onSelectIndex={setSelectedShoeIdx}
          isLocked={lockedShoe}
          onToggleLock={() => setLockedShoe((prev) => !prev)}
          height={shoeHeight}
          showDivider={false}
        />
      </View>

      {/* Floating HUD Overlays (Can be hidden to inspect raw outfit) */}
      {!hideHUD && (
        <>
          {/* Top Floating Header Bar */}
          <View style={[styles.floatingTopBar, { top: insets.top + 8 }]}>
            {/* Today's Color Focus Pill */}
            {settings.showDayColorBanner ? (
              <Pressable
                onPress={() => {
                  if (settings.hapticsEnabled) {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  setFilterTodayColor((prev) => !prev);
                }}
                style={({ pressed }) => [
                  styles.dayFocusPill,
                  {
                    backgroundColor: filterTodayColor ? theme.primary : 'rgba(15, 23, 42, 0.75)',
                    borderColor: filterTodayColor ? theme.primary : 'rgba(255,255,255,0.15)',
                    transform: [{ scale: pressed ? 0.95 : 1.0 }],
                  },
                ]}>
                <View style={styles.paletteDots}>
                  {todayRule.hexColors.slice(0, 3).map((hex, idx) => (
                    <View
                      key={idx}
                      style={[styles.smallDot, { backgroundColor: hex }]}
                    />
                  ))}
                </View>
                <Text style={styles.dayFocusText}>
                  {today}: {todayRule.colorName}
                </Text>
                {filterTodayColor && (
                  <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                )}
              </Pressable>
            ) : (
              <View />
            )}

            {/* Quick Action Icons & Hamburger */}
            <View style={styles.topRightActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.topIconBtn,
                  {
                    backgroundColor:
                      lockedHair && lockedTop && lockedBottom && lockedShoe
                        ? theme.gold
                        : 'rgba(15, 23, 42, 0.75)',
                    transform: [{ scale: pressed ? 0.9 : 1.0 }],
                  },
                ]}
                onPress={handleToggleLockAll}
                accessibilityLabel="Lock or Unlock All">
                <Ionicons
                  name={
                    lockedHair && lockedTop && lockedBottom && lockedShoe
                      ? 'lock-closed'
                      : 'lock-open-outline'
                  }
                  size={15}
                  color={
                    lockedHair && lockedTop && lockedBottom && lockedShoe
                      ? '#000000'
                      : '#FFFFFF'
                  }
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.topIconBtn,
                  {
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    transform: [{ scale: pressed ? 0.9 : 1.0 }],
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setZoomModalVisible(true);
                }}
                accessibilityLabel="Full Screen Inspect">
                <Ionicons name="expand-outline" size={15} color="#FFFFFF" />
              </Pressable>

              {/* Hamburger Context Menu Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.topIconBtn,
                  {
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    transform: [{ scale: pressed ? 0.9 : 1.0 }],
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setMenuModalVisible(true);
                }}
                accessibilityLabel="Open Menu">
                <Ionicons name="menu" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Floating Bottom Control Bar */}
          <View style={[styles.floatingBottomDock, { bottom: 12 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.hideBtn,
                {
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  transform: [{ scale: pressed ? 0.92 : 1.0 }],
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setHideHUD(true);
              }}
              accessibilityLabel="Hide Controls">
              <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.floatingShuffleBtn,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: pressed ? 0.95 : 1.0 }],
                },
              ]}
              onPress={handleShuffle}>
              <Ionicons name="dice-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shuffleText}>Shuffle Match</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  transform: [{ scale: pressed ? 0.92 : 1.0 }],
                },
              ]}
              onPress={handleSaveOutfit}
              accessibilityLabel="Save Outfit">
              <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </>
      )}

      {/* Tap-to-Restore HUD Button when hidden */}
      {hideHUD && (
        <Pressable
          style={[styles.restoreHUDBtn, { top: insets.top + 12 }]}
          onPress={() => setHideHUD(false)}>
          <Ionicons name="eye-off-outline" size={16} color="#FFFFFF" />
          <Text style={styles.restoreHUDText}>Show Controls</Text>
        </Pressable>
      )}

      {/* Full Look Modal */}
      <Modal
        visible={zoomModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setZoomModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Unified Outfit Preview</Text>
              <Pressable
                onPress={() => setZoomModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalPreviewBody}>
              <View style={styles.modalImageColumn}>
                <Image
                  source={{ uri: currentHair.imageUrl }}
                  style={[styles.modalSlice, { height: 110 }]}
                  contentFit="contain"
                />
                <Image
                  source={{ uri: currentTop.imageUrl }}
                  style={[styles.modalSlice, { height: 180 }]}
                  contentFit="contain"
                />
                <Image
                  source={{ uri: currentBottom.imageUrl }}
                  style={[styles.modalSlice, { height: 180 }]}
                  contentFit="contain"
                />
                <Image
                  source={{ uri: currentShoe.imageUrl }}
                  style={[styles.modalSlice, { height: 95 }]}
                  contentFit="contain"
                />
              </View>

              <View style={[styles.modalSummary, { borderColor: theme.border }]}>
                <Text style={[styles.modalSummaryHeading, { color: theme.text }]}>
                  Pieces Summary
                </Text>
                <Text style={[styles.modalSummaryText, { color: theme.textSecondary }]}>
                  • {currentHair.name}
                </Text>
                <Text style={[styles.modalSummaryText, { color: theme.textSecondary }]}>
                  • {currentTop.name}
                </Text>
                <Text style={[styles.modalSummaryText, { color: theme.textSecondary }]}>
                  • {currentBottom.name}
                </Text>
                <Text style={[styles.modalSummaryText, { color: theme.textSecondary }]}>
                  • {currentShoe.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hamburger / Quick Actions Drawer Modal */}
      <Modal
        visible={menuModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuModalVisible(false)}>
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setMenuModalVisible(false)}>
          <Pressable
            style={[styles.sheetContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Match Maker Controls</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                  Styling shortcuts & slot presets
                </Text>
              </View>
              <Pressable
                onPress={() => setMenuModalVisible(false)}
                hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.sheetMenuList}>
              {/* Option 1: Lock / Unlock All */}
              <Pressable
                style={({ pressed }) => [
                  styles.sheetMenuItem,
                  { backgroundColor: pressed ? theme.backgroundElement : 'transparent' },
                ]}
                onPress={() => {
                  handleToggleLockAll();
                  setMenuModalVisible(false);
                }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(32, 138, 239, 0.15)' }]}>
                  <Ionicons
                    name={
                      lockedHair && lockedTop && lockedBottom && lockedShoe
                        ? 'lock-open-outline'
                        : 'lock-closed-outline'
                    }
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    {lockedHair && lockedTop && lockedBottom && lockedShoe
                      ? 'Unlock All Tiers'
                      : 'Lock Current Outfit Tiers'}
                  </Text>
                  <Text style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                    Freeze or free all hair, top, bottom, and shoe reels
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Option 2: Today's Color Alignment */}
              <Pressable
                style={({ pressed }) => [
                  styles.sheetMenuItem,
                  { backgroundColor: pressed ? theme.backgroundElement : 'transparent' },
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setFilterTodayColor((prev) => !prev);
                  setMenuModalVisible(false);
                }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(234, 88, 12, 0.15)' }]}>
                  <Ionicons name="color-palette-outline" size={20} color="#EA580C" />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    {filterTodayColor ? 'Show All Colors' : `Filter by ${today}'s Rule`}
                  </Text>
                  <Text style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                    Align slots with {todayRule.colorName} ({todayRule.meaning})
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Option 3: Reset Reels */}
              <Pressable
                style={({ pressed }) => [
                  styles.sheetMenuItem,
                  { backgroundColor: pressed ? theme.backgroundElement : 'transparent' },
                ]}
                onPress={handleResetOutfit}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="refresh-outline" size={20} color={theme.textSecondary} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>Reset to First Pieces</Text>
                  <Text style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                    Unlock all tiers and return to starting defaults
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Option 4: Full Screen Inspect */}
              <Pressable
                style={({ pressed }) => [
                  styles.sheetMenuItem,
                  { backgroundColor: pressed ? theme.backgroundElement : 'transparent' },
                ]}
                onPress={() => {
                  setMenuModalVisible(false);
                  setTimeout(() => setZoomModalVisible(true), 150);
                }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="expand-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>Inspect Full Look</Text>
                  <Text style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                    View unified mannequin look & clothing breakdown
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Option 5: In-App Settings */}
              <Pressable
                style={({ pressed }) => [
                  styles.sheetMenuItem,
                  { backgroundColor: pressed ? theme.backgroundElement : 'transparent' },
                ]}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/settings' as any);
                }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="settings-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>App Settings</Text>
                  <Text style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                    Fine-tune slot machine, wardrobe columns & controls
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  floatingTopBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayFocusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  paletteDots: {
    flexDirection: 'row',
    gap: 3,
  },
  smallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
  },
  dayFocusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  floatingBottomDock: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  hideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  floatingShuffleBtn: {
    flex: 1,
    maxWidth: 200,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shuffleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  restoreHUDBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  restoreHUDText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalPreviewBody: {
    alignItems: 'center',
  },
  modalImageColumn: {
    width: '100%',
    alignItems: 'center',
  },
  modalSlice: {
    width: '90%',
  },
  modalSummary: {
    width: '100%',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  modalSummaryHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSummaryText: {
    fontSize: 11,
    marginVertical: 1,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sheetSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetMenuList: {
    paddingTop: 8,
    gap: 4,
  },
  sheetMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 12,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
});
