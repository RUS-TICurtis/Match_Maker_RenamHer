import AsyncStorage from '@react-native-async-storage/async-storage';
import { WardrobeItem, SavedOutfit, PlannedOutfit } from '@/types/wardrobe';
import { INITIAL_WARDROBE_ITEMS } from '@/constants/mock-data';

// ─── Storage Keys ───────────────────────────────────────
const KEYS = {
  WARDROBE_ITEMS: '@matchmaker_wardrobe_items',
  SAVED_OUTFITS: '@matchmaker_saved_outfits',
  PLANNED_OUTFITS: '@matchmaker_planned_outfits',
  APP_SETTINGS: '@matchmaker_app_settings',
  HAS_INITIALIZED: '@matchmaker_has_initialized',
} as const;

// ─── App Settings Type ──────────────────────────────────
export interface AppSettings {
  /** Show day-of-week color rule banner on Match screen */
  showDayColorBanner: boolean;
  /** Enable haptic feedback throughout the app */
  hapticsEnabled: boolean;
  /** Auto-shuffle on app open */
  autoShuffleOnOpen: boolean;
  /** Image quality for captures (0.0 - 1.0) */
  imageQuality: number;
  /** Max image dimension for wardrobe photos */
  maxImageDimension: number;
  /** Show category tags on wardrobe cards */
  showCategoryTags: boolean;
  /** Enable background removal API */
  backgroundRemovalEnabled: boolean;
  /** Remove.bg API key */
  removeBgApiKey: string;
  /** Grid columns in wardrobe (2 or 3) */
  wardrobeColumns: 2 | 3;
  /** Confirm before deleting items */
  confirmBeforeDelete: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  showDayColorBanner: true,
  hapticsEnabled: true,
  autoShuffleOnOpen: false,
  imageQuality: 0.85,
  maxImageDimension: 1080,
  showCategoryTags: true,
  backgroundRemovalEnabled: false,
  removeBgApiKey: '',
  wardrobeColumns: 2,
  confirmBeforeDelete: true,
};

// ─── Wardrobe Items ─────────────────────────────────────

/**
 * Loads wardrobe items from local storage.
 * On first launch, seeds with INITIAL_WARDROBE_ITEMS.
 */
export async function loadWardrobeItems(): Promise<WardrobeItem[]> {
  try {
    const hasInit = await AsyncStorage.getItem(KEYS.HAS_INITIALIZED);
    if (!hasInit) {
      // Seed initial data on first launch
      await AsyncStorage.setItem(
        KEYS.WARDROBE_ITEMS,
        JSON.stringify(INITIAL_WARDROBE_ITEMS)
      );
      await AsyncStorage.setItem(KEYS.HAS_INITIALIZED, 'true');
      return INITIAL_WARDROBE_ITEMS;
    }

    const raw = await AsyncStorage.getItem(KEYS.WARDROBE_ITEMS);
    if (raw) {
      return JSON.parse(raw) as WardrobeItem[];
    }
    return INITIAL_WARDROBE_ITEMS;
  } catch (error) {
    console.warn('[Storage] Failed to load wardrobe items:', error);
    return INITIAL_WARDROBE_ITEMS;
  }
}

/**
 * Saves the full wardrobe items array to local storage.
 */
export async function saveWardrobeItems(items: WardrobeItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WARDROBE_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.warn('[Storage] Failed to save wardrobe items:', error);
  }
}

/**
 * Adds a single wardrobe item and persists.
 */
export async function addWardrobeItem(item: WardrobeItem): Promise<WardrobeItem[]> {
  const items = await loadWardrobeItems();
  const updated = [item, ...items];
  await saveWardrobeItems(updated);
  return updated;
}

/**
 * Removes a wardrobe item by ID and persists.
 */
export async function removeWardrobeItem(id: string): Promise<WardrobeItem[]> {
  const items = await loadWardrobeItems();
  const updated = items.filter((i) => i.id !== id);
  await saveWardrobeItems(updated);
  return updated;
}

/**
 * Updates a wardrobe item and persists.
 */
export async function updateWardrobeItem(
  id: string,
  updates: Partial<WardrobeItem>
): Promise<WardrobeItem[]> {
  const items = await loadWardrobeItems();
  const updated = items.map((i) => (i.id === id ? { ...i, ...updates } : i));
  await saveWardrobeItems(updated);
  return updated;
}

// ─── Saved Outfits ──────────────────────────────────────

export async function loadSavedOutfits(): Promise<SavedOutfit[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SAVED_OUTFITS);
    if (raw) {
      return JSON.parse(raw) as SavedOutfit[];
    }
    return [];
  } catch (error) {
    console.warn('[Storage] Failed to load saved outfits:', error);
    return [];
  }
}

export async function saveSavedOutfits(outfits: SavedOutfit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SAVED_OUTFITS, JSON.stringify(outfits));
  } catch (error) {
    console.warn('[Storage] Failed to save outfits:', error);
  }
}

export async function addSavedOutfit(outfit: SavedOutfit): Promise<SavedOutfit[]> {
  const outfits = await loadSavedOutfits();
  const updated = [outfit, ...outfits];
  await saveSavedOutfits(updated);
  return updated;
}

export async function removeSavedOutfit(id: string): Promise<SavedOutfit[]> {
  const outfits = await loadSavedOutfits();
  const updated = outfits.filter((o) => o.id !== id);
  await saveSavedOutfits(updated);
  return updated;
}

// ─── Planned Outfits & Calendar Events ──────────────────

export async function loadPlannedOutfits(): Promise<PlannedOutfit[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PLANNED_OUTFITS);
    if (raw) {
      return JSON.parse(raw) as PlannedOutfit[];
    }
    return [];
  } catch (error) {
    console.warn('[Storage] Failed to load planned outfits:', error);
    return [];
  }
}

export async function savePlannedOutfits(plans: PlannedOutfit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PLANNED_OUTFITS, JSON.stringify(plans));
  } catch (error) {
    console.warn('[Storage] Failed to save planned outfits:', error);
  }
}

export async function addPlannedOutfit(plan: PlannedOutfit): Promise<PlannedOutfit[]> {
  const plans = await loadPlannedOutfits();
  const updated = [plan, ...plans];
  await savePlannedOutfits(updated);
  return updated;
}

export async function updatePlannedOutfit(
  id: string,
  updates: Partial<PlannedOutfit>
): Promise<PlannedOutfit[]> {
  const plans = await loadPlannedOutfits();
  const updated = plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
  await savePlannedOutfits(updated);
  return updated;
}

export async function removePlannedOutfit(id: string): Promise<PlannedOutfit[]> {
  const plans = await loadPlannedOutfits();
  const updated = plans.filter((p) => p.id !== id);
  await savePlannedOutfits(updated);
  return updated;
}

// ─── App Settings ───────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('[Storage] Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('[Storage] Failed to save settings:', error);
  }
}

/**
 * Clears all app data — wardrobe, outfits, settings. Use with caution.
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.WARDROBE_ITEMS,
      KEYS.SAVED_OUTFITS,
      KEYS.PLANNED_OUTFITS,
      KEYS.APP_SETTINGS,
      KEYS.HAS_INITIALIZED,
    ]);
  } catch (error) {
    console.warn('[Storage] Failed to clear all data:', error);
  }
}
