import React, { useState } from 'react';
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
import { SlotMachineTier } from '@/components/SlotMachineTier';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { getDayColorRule, getTodayDayOfWeek } from '@/constants/day-rules';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchMakerScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const today = getTodayDayOfWeek();
  const todayRule = getDayColorRule(today);

  const [filterTodayColor, setFilterTodayColor] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [hideHUD, setHideHUD] = useState(false);

  // Categorized items
  const allHair = INITIAL_WARDROBE_ITEMS.filter((i) => i.category === 'hair');
  const allTops = INITIAL_WARDROBE_ITEMS.filter((i) => i.category === 'top');
  const allBottoms = INITIAL_WARDROBE_ITEMS.filter((i) => i.category === 'bottom');
  const allShoes = INITIAL_WARDROBE_ITEMS.filter((i) => i.category === 'shoes');

  // Filtered lists if day filter is active
  const hairItems = filterTodayColor
    ? allHair.filter((i) => i.recommendedDays?.includes(today)) || allHair
    : allHair;
  const topItems = filterTodayColor
    ? allTops.filter((i) => i.recommendedDays?.includes(today)) || allTops
    : allTops;
  const bottomItems = filterTodayColor
    ? allBottoms.filter((i) => i.recommendedDays?.includes(today)) || allBottoms
    : allBottoms;
  const shoeItems = filterTodayColor
    ? allShoes.filter((i) => i.recommendedDays?.includes(today)) || allShoes
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

  // Selected Item References
  const currentHair = hairItems[selectedHairIdx] || allHair[0];
  const currentTop = topItems[selectedTopIdx] || allTops[0];
  const currentBottom = bottomItems[selectedBottomIdx] || allBottoms[0];
  const currentShoe = shoeItems[selectedShoeIdx] || allShoes[0];

  // Dynamic Height Distribution across the full viewport
  // Deduct insets and the 60px bottom tab bar
  const canvasHeight = windowHeight - insets.top - insets.bottom - 60;
  const hairHeight = Math.round(canvasHeight * 0.18);
  const topHeight = Math.round(canvasHeight * 0.32);
  const bottomHeight = Math.round(canvasHeight * 0.36);
  const shoeHeight = canvasHeight - hairHeight - topHeight - bottomHeight;

  // Random Shuffle / Spin Slot Machine
  const handleShuffle = () => {
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
    setLockedHair(!allLocked);
    setLockedTop(!allLocked);
    setLockedBottom(!allLocked);
    setLockedShoe(!allLocked);
  };

  const handleSaveOutfit = () => {
    Alert.alert(
      'Outfit Saved!',
      `Saved: ${currentTop.name} with ${currentBottom.name} and ${currentShoe.name}.`,
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
            <Pressable
              onPress={() => setFilterTodayColor((prev) => !prev)}
              style={[
                styles.dayFocusPill,
                {
                  backgroundColor: filterTodayColor ? theme.primary : 'rgba(15, 23, 42, 0.75)',
                  borderColor: filterTodayColor ? theme.primary : 'rgba(255,255,255,0.15)',
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

            {/* Quick Action Icons */}
            <View style={styles.topRightActions}>
              <Pressable
                style={[
                  styles.topIconBtn,
                  {
                    backgroundColor:
                      lockedHair && lockedTop && lockedBottom && lockedShoe
                        ? theme.gold
                        : 'rgba(15, 23, 42, 0.75)',
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
                style={[styles.topIconBtn, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}
                onPress={() => setZoomModalVisible(true)}
                accessibilityLabel="Full Screen Inspect">
                <Ionicons name="expand-outline" size={15} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Floating Bottom Control Bar */}
          <View style={[styles.floatingBottomDock, { bottom: 12 }]}>
            <Pressable
              style={[styles.hideBtn, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}
              onPress={() => setHideHUD(true)}
              accessibilityLabel="Hide Controls">
              <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={[styles.floatingShuffleBtn, { backgroundColor: theme.primary }]}
              onPress={handleShuffle}>
              <Ionicons name="dice-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shuffleText}>Shuffle Match</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}
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
});
