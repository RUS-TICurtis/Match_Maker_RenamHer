import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WardrobeCategory, WardrobeItem } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';

interface SlotMachineTierProps {
  category: WardrobeCategory;
  title: string;
  items: WardrobeItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  height: number;
  showDivider?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SlotMachineTier({
  category,
  title,
  items,
  selectedIndex,
  onSelectIndex,
  isLocked,
  onToggleLock,
  height,
  showDivider = true,
}: SlotMachineTierProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const flatListRef = useRef<FlatList<WardrobeItem>>(null);

  const currentItem = items[selectedIndex] || items[0];

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < items.length && newIndex !== selectedIndex) {
      Haptics.selectionAsync().catch(() => {});
      onSelectIndex(newIndex);
    }
  };

  const handlePrev = () => {
    if (isLocked || selectedIndex <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextIdx = selectedIndex - 1;
    flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    if (isLocked || selectedIndex >= items.length - 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextIdx = selectedIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    onSelectIndex(nextIdx);
  };

  const handleLockPress = () => {
    Haptics.impactAsync(
      isLocked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
    onToggleLock();
  };

  return (
    <View style={[styles.tierContainer, { height }]}>
      {/* Swipeable Section Carousel */}
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isLocked}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialScrollIndex={selectedIndex < items.length ? selectedIndex : 0}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.imageSlot, { width: SCREEN_WIDTH, height }]}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="contain"
              transition={150}
            />
            {isLocked && <View style={styles.lockedTint} />}
          </View>
        )}
      />

      {/* Subtle Floating Info Pill (Top-Left) with position indicator */}
      {currentItem && (
        <View style={styles.floatingInfoPill}>
          <Text style={styles.categoryLabel}>{title.toUpperCase()}</Text>
          <View style={styles.pillDivider} />
          <View
            style={[styles.colorDot, { backgroundColor: currentItem.primaryColor }]}
          />
          <Text style={styles.itemName} numberOfLines={1}>
            {currentItem.name}
          </Text>
          {items.length > 1 && (
            <>
              <View style={styles.pillDivider} />
              <Text style={styles.itemCounter}>
                {selectedIndex + 1}/{items.length}
              </Text>
            </>
          )}
        </View>
      )}

      {/* Minimal Floating Lock Icon (Top-Right) */}
      <Pressable
        onPress={handleLockPress}
        style={({ pressed }) => [
          styles.floatingLockBtn,
          {
            backgroundColor: isLocked ? theme.gold : 'rgba(15, 23, 42, 0.5)',
            transform: [{ scale: pressed ? 0.9 : 1.0 }],
          },
        ]}
        hitSlop={12}
        accessibilityLabel={isLocked ? `Unlock ${title}` : `Lock ${title}`}>
        <Ionicons
          name={isLocked ? 'lock-closed' : 'lock-open-outline'}
          size={13}
          color={isLocked ? '#000000' : '#FFFFFF'}
        />
      </Pressable>

      {/* Faint Horizontal Seam / Divider Guide */}
      {showDivider && (
        <View
          style={[
            styles.seamGuide,
            { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
          ]}
        />
      )}

      {/* Refined Chevron Navigation Indicators */}
      {!isLocked && selectedIndex > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.arrowBtn,
            styles.leftArrow,
            { transform: [{ scale: pressed ? 0.88 : 1.0 }] },
          ]}
          onPress={handlePrev}
          hitSlop={14}>
          <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
        </Pressable>
      )}

      {!isLocked && selectedIndex < items.length - 1 && (
        <Pressable
          style={({ pressed }) => [
            styles.arrowBtn,
            styles.rightArrow,
            { transform: [{ scale: pressed ? 0.88 : 1.0 }] },
          ]}
          onPress={handleNext}
          hitSlop={14}>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tierContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  imageSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '90%',
    height: '100%',
  },
  lockedTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
  },
  floatingInfoPill: {
    position: 'absolute',
    top: 6,
    left: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  categoryLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pillDivider: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  itemCounter: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  floatingLockBtn: {
    position: 'absolute',
    top: 6,
    right: 12,
    zIndex: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seamGuide: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 5,
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  leftArrow: {
    left: 8,
  },
  rightArrow: {
    right: 8,
  },
});
