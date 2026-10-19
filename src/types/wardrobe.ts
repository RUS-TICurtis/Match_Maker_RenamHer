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
