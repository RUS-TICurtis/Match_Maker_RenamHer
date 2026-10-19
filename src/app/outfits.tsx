import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { SavedOutfit, WardrobeItem } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

const INITIAL_SAVED_OUTFITS: SavedOutfit[] = [
  {
    id: 'outfit-1',
    name: 'Monday Fresh Clean Fit',
    hairId: 'hair-1',
    topId: 'top-1',
    bottomId: 'bottom-1',
    shoesId: 'shoes-1',
    dayTag: 'Monday',
    createdAt: '2026-10-12',
    lastWornDate: '2026-10-12',
    isFavorite: true,
  },
  {
    id: 'outfit-2',
    name: 'Wednesday Olive & Sage',
    hairId: 'hair-2',
    topId: 'top-3',
    bottomId: 'bottom-4',
    shoesId: 'shoes-1',
    dayTag: 'Wednesday',
    createdAt: '2026-10-14',
    lastWornDate: '2026-10-14',
    isFavorite: true,
  },
  {
    id: 'outfit-3',
    name: 'Friday Casual Linen',
    hairId: 'hair-1',
    topId: 'top-4',
    bottomId: 'bottom-2',
    shoesId: 'shoes-1',
    dayTag: 'Friday',
    createdAt: '2026-10-16',
    isFavorite: false,
  },
];

export default function OutfitsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [outfits, setOutfits] = useState<SavedOutfit[]>(INITIAL_SAVED_OUTFITS);

  const getItem = (id?: string): WardrobeItem | undefined => {
    return INITIAL_WARDROBE_ITEMS.find((i) => i.id === id);
  };

  const toggleFavorite = (id: string) => {
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isFavorite: !o.isFavorite } : o))
    );
  };

  const handleWearToday = (outfit: SavedOutfit) => {
    Alert.alert(
      'Logged as Worn!',
      `Logged "${outfit.name}" for today! Keep rocking your style.`,
      [{ text: 'Awesome' }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>LOOKBOOK</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {outfits.length} saved outfits
          </Text>
        </View>

        <Pressable
          style={[styles.newBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/')}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New Match</Text>
        </Pressable>
      </View>

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const hair = getItem(item.hairId);
          const top = getItem(item.topId);
          const bottom = getItem(item.bottomId);
          const shoes = getItem(item.shoesId);

          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.outfitName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  {item.dayTag && (
                    <View
                      style={[
                        styles.dayTagBadge,
                        { backgroundColor: theme.backgroundElement },
                      ]}>
                      <Text style={[styles.dayTagText, { color: theme.primary }]}>
                        {item.dayTag}
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => toggleFavorite(item.id)}
                  hitSlop={8}>
                  <Ionicons
                    name={item.isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={item.isFavorite ? '#EF4444' : theme.textSecondary}
                  />
                </Pressable>
              </View>

              {/* Stacked Preview Slices */}
              <View style={styles.slicesRow}>
                {hair && (
                  <View style={styles.sliceBox}>
                    <Image
                      source={{ uri: hair.imageUrl }}
                      style={styles.sliceImg}
                      contentFit="cover"
                    />
                    <Text style={styles.sliceLabel}>HAIR</Text>
                  </View>
                )}
                {top && (
                  <View style={styles.sliceBox}>
                    <Image
                      source={{ uri: top.imageUrl }}
                      style={styles.sliceImg}
                      contentFit="cover"
                    />
                    <Text style={styles.sliceLabel}>TOP</Text>
                  </View>
                )}
                {bottom && (
                  <View style={styles.sliceBox}>
                    <Image
                      source={{ uri: bottom.imageUrl }}
                      style={styles.sliceImg}
                      contentFit="cover"
                    />
                    <Text style={styles.sliceLabel}>BOTTOM</Text>
                  </View>
                )}
                {shoes && (
                  <View style={styles.sliceBox}>
                    <Image
                      source={{ uri: shoes.imageUrl }}
                      style={styles.sliceImg}
                      contentFit="cover"
                    />
                    <Text style={styles.sliceLabel}>SHOES</Text>
                  </View>
                )}
              </View>

              {/* Bottom Actions */}
              <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.wornText, { color: theme.textSecondary }]}>
                  {item.lastWornDate ? `Last worn: ${item.lastWornDate}` : 'Not worn yet'}
                </Text>

                <Pressable
                  style={[styles.wearBtn, { backgroundColor: theme.primary }]}
                  onPress={() => handleWearToday(item)}>
                  <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                  <Text style={styles.wearBtnText}>Wear Today</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  outfitName: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  slicesRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 14,
  },
  sliceBox: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  sliceImg: {
    width: '100%',
    height: '100%',
  },
  sliceLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  wornText: {
    fontSize: 11,
  },
  wearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  wearBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
