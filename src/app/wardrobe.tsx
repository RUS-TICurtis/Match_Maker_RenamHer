import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { WardrobeCategory, WardrobeItem } from '@/types/wardrobe';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 44) / 2;

type FilterCategory = 'all' | WardrobeCategory;

export default function WardrobeScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [items, setItems] = useState<WardrobeItem[]>(INITIAL_WARDROBE_ITEMS);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { label: string; value: FilterCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'All', value: 'all', icon: 'grid-outline' },
    { label: 'Hair', value: 'hair', icon: 'person-outline' },
    { label: 'Tops', value: 'top', icon: 'shirt-outline' },
    { label: 'Bottoms', value: 'bottom', icon: 'cut-outline' },
    { label: 'Shoes', value: 'shoes', icon: 'footsteps-outline' },
  ];

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
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  const handleAddItem = () => {
    Alert.alert(
      'Add New Wardrobe Piece',
      'Choose a method to add your clothing piece:',
      [
        {
          text: 'Snap Mirror Selfie',
          onPress: () =>
            Alert.alert(
              'Camera Guide Ready',
              'The camera will display a ghost silhouette overlay to guide your alignment.'
            ),
        },
        {
          text: 'Upload from Photos',
          onPress: () =>
            Alert.alert(
              'Photo Library',
              'Select an existing mirror selfie or photo to crop and tag.'
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>MY CLOSET</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {filteredItems.length} pieces cataloged
          </Text>
        </View>

        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={handleAddItem}>
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
          <Pressable onPress={() => setSearchQuery('')}>
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
                onPress={() => setActiveCategory(item.value)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
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

      {/* Grid of Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
                transition={200}
              />
              <Pressable
                style={styles.favoriteBadge}
                onPress={() => toggleFavorite(item.id)}>
                <Ionicons
                  name={item.isFavorite ? 'heart' : 'heart-outline'}
                  size={16}
                  color={item.isFavorite ? '#EF4444' : '#FFFFFF'}
                />
              </Pressable>
              <View style={[styles.categoryTag, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text style={styles.categoryTagText}>{item.category.toUpperCase()}</Text>
              </View>
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
          </View>
        )}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
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
    width: COLUMN_WIDTH,
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
});
