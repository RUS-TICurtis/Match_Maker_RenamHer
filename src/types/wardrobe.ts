export type WardrobeCategory = 'hair' | 'top' | 'bottom' | 'shoes' | 'accessory';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  primaryColor: string;
  colorName: string;
  secondaryColors?: string[];
  imageUrl: string;
  tags: string[];
  recommendedDays?: DayOfWeek[];
  isFavorite?: boolean;
  isTransparentCutout?: boolean;
  notes?: string;
  createdAt: string;
}

export interface DayColorRule {
  day: DayOfWeek;
  colorName: string;
  hexColors: string[];
  meaning: string;
}

export interface SavedOutfit {
  id: string;
  name: string;
  hairId?: string;
  topId: string;
  bottomId: string;
  shoesId: string;
  accessoryIds?: string[];
  createdAt: string;
  lastWornDate?: string;
  dayTag?: DayOfWeek;
  isFavorite?: boolean;
}

export interface PlannedOutfit {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "09:00" or "19:30"
  eventTitle?: string; // e.g. "Board Meeting", "Dinner Date", "Sunday Brunch"
  location?: string;
  notes?: string;
  outfitId?: string; // Reference to a SavedOutfit if linked
  hairId?: string;
  topId?: string;
  bottomId?: string;
  shoesId?: string;
  accessoryIds?: string[];
  createdAt: string;
  isCompleted?: boolean;
}

