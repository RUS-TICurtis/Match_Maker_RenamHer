import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  useColorScheme,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { WardrobeCategory, WardrobeItem } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';
import {
  loadWardrobeItems,
  saveWardrobeItems,
  loadSettings,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@/services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH_2 = (SCREEN_WIDTH - 44) / 2;
const COLUMN_WIDTH_3 = (SCREEN_WIDTH - 52) / 3;

type FilterCategory = 'all' | WardrobeCategory;

export default function WardrobeScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Item Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [pieceName, setPieceName] = useState('');
  const [pieceCategory, setPieceCategory] = useState<WardrobeCategory>('top');
  const [pieceColorName, setPieceColorName] = useState('Neutral');
  const [pieceHex, setPieceHex] = useState('#208AEF');
  const [pieceTags, setPieceTags] = useState('everyday, favorite');

  // Preview & Context Menu Modal State
  const [previewItem, setPreviewItem] = useState<WardrobeItem | null>(null);
  const [contextItem, setContextItem] = useState<WardrobeItem | null>(null);

  useEffect(() => {
    Promise.all([loadWardrobeItems(), loadSettings()]).then(([loadedItems, loadedSettings]) => {
      setItems(loadedItems);
      setSettings(loadedSettings);
      setIsLoading(false);
    });
  }, []);

  const columnWidth = settings.wardrobeColumns === 3 ? COLUMN_WIDTH_3 : COLUMN_WIDTH_2;

  const categories: { label: string; value: FilterCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'All', value: 'all', icon: 'grid-outline' },
    { label: 'Hair', value: 'hair', icon: 'person-outline' },
    { label: 'Tops', value: 'top', icon: 'shirt-outline' },
    { label: 'Bottoms', value: 'bottom', icon: 'cut-outline' },
    { label: 'Shoes', value: 'shoes', icon: 'footsteps-outline' },
    { label: 'Accessories', value: 'accessory', icon: 'watch-outline' },
  ];

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need photo gallery permissions to choose photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: settings.imageQuality,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedImageUri(result.assets[0].uri);
      setIsModalVisible(true);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to snap a photo!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: settings.imageQuality,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedImageUri(result.assets[0].uri);
      setIsModalVisible(true);
    }
  };

  const handleAddItem = () => {
    Alert.alert(
      'Add New Wardrobe Piece',
      'Choose how you want to add your clothing piece:',
      [
        {
          text: 'Snap with Camera',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ? true : item.category === activeCategory;
    const matchesSearch =
      searchQuery === ''
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.colorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
    );
    setItems(updated);
    saveWardrobeItems(updated);
    if (previewItem && previewItem.id === id) {
      setPreviewItem({ ...previewItem, isFavorite: !previewItem.isFavorite });
    }
  };

  const handleDeleteItem = (itemToDelete: WardrobeItem) => {
    const performDelete = () => {
      const updated = items.filter((i) => i.id !== itemToDelete.id);
      setItems(updated);
      saveWardrobeItems(updated);
      setContextItem(null);
      if (previewItem?.id === itemToDelete.id) {
        setPreviewItem(null);
      }
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    };

    if (settings.confirmBeforeDelete) {
      Alert.alert(
        'Delete Piece',
        `Are you sure you want to remove "${itemToDelete.name}" from your closet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    } else {
      performDelete();
    }
  };

  const handleItemLongPress = (item: WardrobeItem) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'View Full Screen', item.isFavorite ? 'Unfavorite' : 'Favorite', 'Delete Item'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: item.name,
          message: `${item.colorName} • ${item.category.toUpperCase()}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setPreviewItem(item);
          } else if (buttonIndex === 2) {
            toggleFavorite(item.id);
          } else if (buttonIndex === 3) {
            handleDeleteItem(item);
          }
        }
      );
    } else {
      setContextItem(item);
    }
  };

  const handleSavePiece = () => {
    if (!pickedImageUri) {
      Alert.alert('Missing Photo', 'Please take or choose a photo first.');
      return;
    }
    if (!pieceName.trim()) {
      Alert.alert('Missing Name', 'Please give this piece a name.');
      return;
    }

    const newItem: WardrobeItem = {
      id: `custom_${Date.now()}`,
      name: pieceName.trim(),
      category: pieceCategory,
      primaryColor: pieceHex,
      colorName: pieceColorName.trim() || 'Color',
      imageUrl: pickedImageUri,
      tags: pieceTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveWardrobeItems(updated);
    setIsModalVisible(false);

    // Reset form
    setPickedImageUri(null);
    setPieceName('');
    setPieceColorName('Neutral');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>MY CLOSET</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {isLoading ? 'Loading...' : `${filteredItems.length} pieces cataloged`}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: theme.primary,
              transform: [{ scale: pressed ? 0.94 : 1.0 }],
            },
          ]}
          onPress={() => {
            if (settings.hapticsEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            handleAddItem();
          }}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Piece</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name, color, style..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => {
              if (settings.hapticsEnabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }
              setSearchQuery('');
            }}>
            <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryPillsContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsList}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = activeCategory === item.value;
            return (
              <Pressable
                onPress={() => {
                  if (settings.hapticsEnabled) {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  setActiveCategory(item.value);
                }}
                style={({ pressed }) => [
                  styles.pill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                    transform: [{ scale: pressed ? 0.94 : 1.0 }],
                  },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : theme.text}
                />
                <Text
                  style={[
                    styles.pillText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Grid of Items with Empty State */}
      <FlatList
        data={filteredItems}
        key={settings.wardrobeColumns}
        keyExtractor={(item) => item.id}
        numColumns={settings.wardrobeColumns}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={filteredItems.length > 0 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={32} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Pieces Found</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              {searchQuery
                ? `No items match "${searchQuery}". Try different keywords or reset filters.`
                : 'No clothing items in this category yet.'}
            </Text>
            {searchQuery.length > 0 && (
              <Pressable
                style={[styles.clearFilterBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (settings.hapticsEnabled) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  setSearchQuery('');
                  setActiveCategory('all');
                }}>
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                <Text style={styles.clearFilterBtnText}>Reset Search & Filters</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                width: columnWidth,
                backgroundColor: theme.card,
                borderColor: theme.border,
                transform: [{ scale: pressed ? 0.98 : 1.0 }],
              },
            ]}
            onPress={() => {
              if (settings.hapticsEnabled) {
                Haptics.selectionAsync().catch(() => {});
              }
              setPreviewItem(item);
            }}
            onLongPress={() => handleItemLongPress(item)}>
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
                transition={200}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.favoriteBadge,
                  { transform: [{ scale: pressed ? 0.85 : 1.0 }] },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (settings.hapticsEnabled) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  toggleFavorite(item.id);
                }}>
                <Ionicons
                  name={item.isFavorite ? 'heart' : 'heart-outline'}
                  size={16}
                  color={item.isFavorite ? '#EF4444' : '#FFFFFF'}
                />
              </Pressable>
              {settings.showCategoryTags && (
                <View style={[styles.categoryTag, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={styles.categoryTagText}>{item.category.toUpperCase()}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardDetails}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.colorRow}>
                <View style={[styles.swatch, { backgroundColor: item.primaryColor }]} />
                <Text style={[styles.colorLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.colorName}
                </Text>
              </View>

              <View style={styles.tagsRow}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <View
                    key={idx}
                    style={[styles.tagBadge, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* ─── Item Detail & Full Screen Preview Modal ─── */}
      <Modal
        visible={!!previewItem}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewItem(null)}>
        {previewItem && (
          <View style={styles.fullPreviewOverlay}>
            <SafeAreaView style={styles.fullPreviewContainer}>
              {/* Top Navigation */}
              <View style={styles.fullPreviewHeader}>
                <Pressable
                  style={styles.previewCloseBtn}
                  onPress={() => setPreviewItem(null)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>

                <View style={styles.previewHeaderRight}>
                  <Pressable
                    style={styles.previewHeaderAction}
                    onPress={() => {
                      if (settings.hapticsEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      }
                      toggleFavorite(previewItem.id);
                    }}>
                    <Ionicons
                      name={previewItem.isFavorite ? 'heart' : 'heart-outline'}
                      size={22}
                      color={previewItem.isFavorite ? '#EF4444' : '#FFFFFF'}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.previewHeaderAction}
                    onPress={() => handleDeleteItem(previewItem)}>
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                  </Pressable>
                </View>
              </View>

              {/* Full Image */}
              <View style={styles.fullImageWrapper}>
                <Image
                  source={{ uri: previewItem.imageUrl }}
                  style={styles.fullImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>

              {/* Bottom Details Card */}
              <View style={[styles.previewDetailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.previewCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.previewName, { color: theme.text }]}>
                      {previewItem.name}
                    </Text>
                    <View style={styles.previewCategoryRow}>
                      <View style={[styles.previewCatBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.previewCatText}>{previewItem.category.toUpperCase()}</Text>
                      </View>
                      <View style={styles.previewColorPill}>
                        <View style={[styles.swatch, { backgroundColor: previewItem.primaryColor }]} />
                        <Text style={[styles.colorLabel, { color: theme.textSecondary }]}>
                          {previewItem.colorName}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Tags */}
                {previewItem.tags.length > 0 && (
                  <View style={styles.previewTagsContainer}>
                    {previewItem.tags.map((tag, idx) => (
                      <View key={idx} style={[styles.previewTagPill, { backgroundColor: theme.backgroundElement }]}>
                        <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  style={[styles.deletePieceBtn, { borderColor: '#EF4444' }]}
                  onPress={() => handleDeleteItem(previewItem)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.deletePieceBtnText}>Remove from Closet</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      {/* ─── Android Context Menu Modal ───────────── */}
      <Modal
        visible={!!contextItem}
        transparent
        animationType="fade"
        onRequestClose={() => setContextItem(null)}>
        {contextItem && (
          <Pressable style={styles.contextOverlay} onPress={() => setContextItem(null)}>
            <View style={[styles.contextMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.contextTitle, { color: theme.text }]} numberOfLines={1}>
                {contextItem.name}
              </Text>
              <Text style={[styles.contextSub, { color: theme.textSecondary }]}>
                {contextItem.colorName} • {contextItem.category.toUpperCase()}
              </Text>

              <View style={[styles.contextDivider, { backgroundColor: theme.border }]} />

              <Pressable
                style={styles.contextRow}
                onPress={() => {
                  const itm = contextItem;
                  setContextItem(null);
                  setPreviewItem(itm);
                }}>
                <Ionicons name="expand-outline" size={18} color={theme.text} />
                <Text style={[styles.contextText, { color: theme.text }]}>View Full Screen</Text>
              </Pressable>

              <Pressable
                style={styles.contextRow}
                onPress={() => {
                  toggleFavorite(contextItem.id);
                  setContextItem(null);
                }}>
                <Ionicons
                  name={contextItem.isFavorite ? 'heart-dislike-outline' : 'heart-outline'}
                  size={18}
                  color={theme.text}
                />
                <Text style={[styles.contextText, { color: theme.text }]}>
                  {contextItem.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.contextRow}
                onPress={() => {
                  handleDeleteItem(contextItem);
                }}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={[styles.contextText, { color: '#EF4444' }]}>Delete Item</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      </Modal>

      {/* ─── Add Piece Modal ──────────────────────── */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setIsModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Wardrobe Piece</Text>
            <Pressable onPress={handleSavePiece}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Image Preview & Change Options */}
            <View style={styles.previewContainer}>
              {pickedImageUri ? (
                <Image source={{ uri: pickedImageUri }} style={styles.previewImage} contentFit="cover" />
              ) : (
                <View style={[styles.emptyPreview, { backgroundColor: theme.card }]}>
                  <Ionicons name="image-outline" size={48} color={theme.textSecondary} />
                </View>
              )}

              <View style={styles.imageActionButtons}>
                <Pressable
                  style={[styles.smallActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={16} color={theme.primary} />
                  <Text style={[styles.smallActionBtnText, { color: theme.text }]}>Retake</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={handlePickImage}>
                  <Ionicons name="images" size={16} color={theme.primary} />
                  <Text style={[styles.smallActionBtnText, { color: theme.text }]}>Library</Text>
                </Pressable>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>PIECE NAME</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Crisp White Poplin Shirt"
                placeholderTextColor={theme.textSecondary}
                value={pieceName}
                onChangeText={setPieceName}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
              <View style={styles.modalCategoryRow}>
                {(['hair', 'top', 'bottom', 'shoes', 'accessory'] as WardrobeCategory[]).map((cat) => {
                  const isSelected = pieceCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[
                        styles.catChoiceBtn,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setPieceCategory(cat)}>
                      <Text style={[styles.catChoiceText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                        {cat.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Color Tag & Hex */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>COLOR NAME & HEX</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="Color Name (e.g. Sage Green, Crisp White)"
                placeholderTextColor={theme.textSecondary}
                value={pieceColorName}
                onChangeText={setPieceColorName}
              />
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text, marginTop: 8 }]}
                placeholder="Hex Color Code (e.g. #8A9A5B)"
                placeholderTextColor={theme.textSecondary}
                value={pieceHex}
                onChangeText={setPieceHex}
              />
            </View>

            {/* Style Tags */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>STYLE TAGS (COMMA SEPARATED)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="casual, weekend, cotton, work"
                placeholderTextColor={theme.textSecondary}
                value={pieceTags}
                onChangeText={setPieceTags}
              />
            </View>

            <Pressable
              style={[styles.saveFullBtn, { backgroundColor: theme.primary }]}
              onPress={handleSavePiece}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveFullBtnText}>Add to My Closet</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoryPillsContainer: {
    marginVertical: 10,
  },
  categoryPillsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDetails: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  colorLabel: {
    fontSize: 11,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCancel: {
    fontSize: 14,
  },
  modalSave: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
    gap: 18,
  },
  previewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 180,
    height: 180,
    borderRadius: 20,
  },
  emptyPreview: {
    width: 180,
    height: 180,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  smallActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  inputField: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  catChoiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  saveFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  saveFullBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    gap: 10,
    width: '100%',
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
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  clearFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Full Screen Preview Styles ─────────────
  fullPreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  fullPreviewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  previewCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderRight: {
    flexDirection: 'row',
    gap: 12,
  },
  previewHeaderAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  previewDetailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  previewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  previewName: {
    fontSize: 18,
    fontWeight: '800',
  },
  previewCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  previewCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewCatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  previewColorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deletePieceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  deletePieceBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── Android Context Menu Styles ────────────
  contextOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  contextMenu: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  contextSub: {
    fontSize: 12,
    marginBottom: 4,
  },
  contextDivider: {
    height: 1,
    marginVertical: 6,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  contextText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
