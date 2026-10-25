import { useState, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import { SavedOutfit, WardrobeItem } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import {
  loadSavedOutfits,
  saveSavedOutfits,
  loadWardrobeItems,
  loadSettings,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@/services/storage';

export default function OutfitsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadSavedOutfits(), loadWardrobeItems(), loadSettings()]).then(
      ([loadedOutfits, loadedWardrobe, s]) => {
        setOutfits(loadedOutfits);
        setWardrobe(loadedWardrobe);
        setSettings(s);
        setIsLoading(false);
      }
    );
  }, []);

  const getItem = (id?: string): WardrobeItem | undefined => {
    return wardrobe.find((i) => i.id === id);
  };

  const toggleFavorite = (id: string) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const updated = outfits.map((o) =>
      o.id === id ? { ...o, isFavorite: !o.isFavorite } : o
    );
    setOutfits(updated);
    saveSavedOutfits(updated);
  };

  const handleDeleteOutfit = (outfit: SavedOutfit) => {
    const performDelete = () => {
      const updated = outfits.filter((o) => o.id !== outfit.id);
      setOutfits(updated);
      saveSavedOutfits(updated);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    };

    if (settings.confirmBeforeDelete) {
      Alert.alert(
        'Delete Outfit',
        `Are you sure you want to delete "${outfit.name}" from your Lookbook?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    } else {
      performDelete();
    }
  };

  const handleWearToday = (outfit: SavedOutfit) => {
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    const today = new Date().toISOString().split('T')[0];
    const updated = outfits.map((o) =>
      o.id === outfit.id ? { ...o, lastWornDate: today } : o
    );
    setOutfits(updated);
    saveSavedOutfits(updated);

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
            {isLoading ? 'Loading...' : `${outfits.length} saved outfits`}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.newBtn,
            {
              backgroundColor: theme.primary,
              transform: [{ scale: pressed ? 0.94 : 1.0 }],
            },
          ]}
          onPress={() => {
            if (settings.hapticsEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            router.push('/');
          }}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Match Maker</Text>
        </Pressable>
      </View>

      {/* Outfit Cards List */}
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="bookmark-outline" size={32} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Saved Outfits Yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Spin the Match Maker reels and tap "Save Outfit" to build your curated personal lookbook!
            </Text>
            <Pressable
              style={[styles.createFirstBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/')}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              <Text style={styles.createFirstBtnText}>Create Your First Look</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const hair = getItem(item.hairId);
          const top = getItem(item.topId);
          const bottom = getItem(item.bottomId);
          const shoes = getItem(item.shoesId);

          return (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.dayTagRow}>
                    {item.dayTag && (
                      <View style={[styles.dayPill, { backgroundColor: theme.primary }]}>
                        <Text style={styles.dayPillText}>{item.dayTag}</Text>
                      </View>
                    )}
                    <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                      Saved {item.createdAt ? item.createdAt.split('T')[0] : 'recently'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardHeaderActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      { transform: [{ scale: pressed ? 0.85 : 1.0 }] },
                    ]}
                    onPress={() => toggleFavorite(item.id)}>
                    <Ionicons
                      name={item.isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={item.isFavorite ? '#EF4444' : theme.textSecondary}
                    />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.iconBtn,
                      { transform: [{ scale: pressed ? 0.85 : 1.0 }] },
                    ]}
                    onPress={() => handleDeleteOutfit(item)}>
                    <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
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
                  style={({ pressed }) => [
                    styles.wearBtn,
                    {
                      backgroundColor: theme.primary,
                      transform: [{ scale: pressed ? 0.94 : 1.0 }],
                    },
                  ]}
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
    fontSize: 12,
    marginTop: 2,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  createFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dayPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
  },
  iconBtn: {
    padding: 6,
  },
  slicesRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  sliceBox: {
    flex: 1,
    height: 90,
    borderRadius: 12,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  wearBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
