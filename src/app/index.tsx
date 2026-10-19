import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SlotMachineTier } from '@/components/SlotMachineTier';
import { DayThemeBanner } from '@/components/DayThemeBanner';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';
import { getDayColorRule, getTodayDayOfWeek } from '@/constants/day-rules';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchMakerScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const today = getTodayDayOfWeek();
  const todayRule = getDayColorRule(today);

  const [filterTodayColor, setFilterTodayColor] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>MATCH MAKER</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Personal Paper-Doll Wardrobe
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.headerIconBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setZoomModalVisible(true)}
            accessibilityLabel="Full Outfit Zoom">
            <Ionicons name="expand-outline" size={18} color={theme.text} />
          </Pressable>
          <Pressable
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveOutfit}>
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Day-of-Week Theme Rules Banner */}
        <DayThemeBanner
          rule={todayRule}
          filterActive={filterTodayColor}
          onToggleFilter={() => setFilterTodayColor((prev) => !prev)}
        />

        {/* 4-Tier Slot Machine Carousel */}
        <View style={styles.carouselStack}>
          {/* Tier 1: Hair / Head */}
          <SlotMachineTier
            category="hair"
            title="Hair & Grooming"
            items={hairItems}
            selectedIndex={selectedHairIdx}
            onSelectIndex={setSelectedHairIdx}
            isLocked={lockedHair}
            onToggleLock={() => setLockedHair((prev) => !prev)}
            height={110}
          />

          {/* Tier 2: Top */}
          <SlotMachineTier
            category="top"
            title="Shirt / Top"
            items={topItems}
            selectedIndex={selectedTopIdx}
            onSelectIndex={setSelectedTopIdx}
            isLocked={lockedTop}
            onToggleLock={() => setLockedTop((prev) => !prev)}
            height={145}
          />

          {/* Tier 3: Bottom */}
          <SlotMachineTier
            category="bottom"
            title="Pants / Bottom"
            items={bottomItems}
            selectedIndex={selectedBottomIdx}
            onSelectIndex={setSelectedBottomIdx}
            isLocked={lockedBottom}
            onToggleLock={() => setLockedBottom((prev) => !prev)}
            height={145}
          />

          {/* Tier 4: Footwear */}
          <SlotMachineTier
            category="shoes"
            title="Footwear"
            items={shoeItems}
            selectedIndex={selectedShoeIdx}
            onSelectIndex={setSelectedShoeIdx}
            isLocked={lockedShoe}
            onToggleLock={() => setLockedShoe((prev) => !prev)}
            height={105}
          />
        </View>

        {/* Quick Dock Controls */}
        <View style={[styles.controlDock, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable
            style={[styles.dockBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={handleToggleLockAll}>
            <Ionicons
              name={
                lockedHair && lockedTop && lockedBottom && lockedShoe
                  ? 'lock-closed'
                  : 'lock-open-outline'
              }
              size={18}
              color={theme.text}
            />
            <Text style={[styles.dockBtnText, { color: theme.text }]}>
              {lockedHair && lockedTop && lockedBottom && lockedShoe ? 'Unlock All' : 'Lock All'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.shuffleBtn, { backgroundColor: theme.primary }]}
            onPress={handleShuffle}>
            <Ionicons name="dice-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shuffleBtnText}>Shuffle Match</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Full Look Zoom Modal */}
      <Modal
        visible={zoomModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setZoomModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Unified Full Look</Text>
              <Pressable
                onPress={() => setZoomModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            {/* Seamless Stacked Silhouette Preview */}
            <ScrollView
              contentContainerStyle={styles.zoomStackContainer}
              showsVerticalScrollIndicator={false}>
              <View style={styles.zoomImageWrapper}>
                <Image
                  source={{ uri: currentHair.imageUrl }}
                  style={[styles.zoomSlice, { height: 130 }]}
                  contentFit="cover"
                />
                <Image
                  source={{ uri: currentTop.imageUrl }}
                  style={[styles.zoomSlice, { height: 180 }]}
                  contentFit="cover"
                />
                <Image
                  source={{ uri: currentBottom.imageUrl }}
                  style={[styles.zoomSlice, { height: 180 }]}
                  contentFit="cover"
                />
                <Image
                  source={{ uri: currentShoe.imageUrl }}
                  style={[styles.zoomSlice, { height: 120 }]}
                  contentFit="cover"
                />
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Outfit Breakdown</Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>
                  • Hair: {currentHair.name} ({currentHair.colorName})
                </Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>
                  • Top: {currentTop.name} ({currentTop.colorName})
                </Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>
                  • Bottom: {currentBottom.name} ({currentBottom.colorName})
                </Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>
                  • Shoes: {currentShoe.name} ({currentShoe.colorName})
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carouselStack: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  controlDock: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  dockBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  shuffleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  zoomStackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  zoomImageWrapper: {
    width: Math.min(SCREEN_WIDTH - 40, 360),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  zoomSlice: {
    width: '100%',
  },
  summaryCard: {
    width: '100%',
    maxWidth: 360,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 13,
    marginVertical: 2,
  },
});
