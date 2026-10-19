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
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = Math.min(SCREEN_WIDTH - 32, 420);

export function SlotMachineTier({
  category,
  title,
  items,
  selectedIndex,
  onSelectIndex,
  isLocked,
  onToggleLock,
  height = 145,
}: SlotMachineTierProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const flatListRef = useRef<FlatList<WardrobeItem>>(null);

  const currentItem = items[selectedIndex] || items[0];

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / ITEM_WIDTH);
    if (newIndex >= 0 && newIndex < items.length && newIndex !== selectedIndex) {
      onSelectIndex(newIndex);
    }
  };

  const handlePrev = () => {
    if (isLocked || selectedIndex <= 0) return;
    const nextIdx = selectedIndex - 1;
    flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    if (isLocked || selectedIndex >= items.length - 1) return;
    const nextIdx = selectedIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    onSelectIndex(nextIdx);
  };

  return (
    <View style={[styles.container, { height, borderColor: isLocked ? theme.gold : theme.border }]}>
      {/* Tier Header Bar */}
      <View style={[styles.headerOverlay, { backgroundColor: isLocked ? 'rgba(217, 119, 6, 0.15)' : 'rgba(0,0,0,0.35)' }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.categoryBadge, { color: isLocked ? theme.gold : '#FFFFFF' }]}>
            {title.toUpperCase()}
          </Text>
          {currentItem && (
            <View style={styles.itemMeta}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: currentItem.primaryColor, borderColor: '#FFFFFF' },
                ]}
              />
              <Text style={styles.itemName} numberOfLines={1}>
                {currentItem.name}
              </Text>
            </View>
          )}
        </View>

        {/* Lock / Unlock Button */}
        <Pressable
          onPress={onToggleLock}
          style={[
            styles.lockButton,
            { backgroundColor: isLocked ? theme.gold : 'rgba(255,255,255,0.2)' },
          ]}
          hitSlop={8}
          accessibilityLabel={isLocked ? `Unlock ${title}` : `Lock ${title}`}>
          <Ionicons
            name={isLocked ? 'lock-closed' : 'lock-open-outline'}
            size={14}
            color={isLocked ? '#000000' : '#FFFFFF'}
          />
          <Text style={[styles.lockText, { color: isLocked ? '#000000' : '#FFFFFF' }]}>
            {isLocked ? 'LOCKED' : 'LOCK'}
          </Text>
        </Pressable>
      </View>

      {/* Swipeable / Draggable Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isLocked}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        initialScrollIndex={selectedIndex < items.length ? selectedIndex : 0}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.imageContainer, { width: ITEM_WIDTH, height }]}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            {isLocked && <View style={styles.lockedDimOverlay} />}
          </View>
        )}
      />

      {/* Manual Step Arrows for ease of use */}
      {!isLocked && selectedIndex > 0 && (
        <Pressable
          style={[styles.arrowButton, styles.leftArrow]}
          onPress={handlePrev}
          hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
      )}

      {!isLocked && selectedIndex < items.length - 1 && (
        <Pressable
          style={[styles.arrowButton, styles.rightArrow]}
          onPress={handleNext}
          hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: ITEM_WIDTH,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginVertical: 4,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  lockText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lockedDimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
