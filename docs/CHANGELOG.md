# Changelog

## 2026-10-25 - Added Camera & Image Picker Feature

### Added
- Installed `expo-image-picker` compatible with Expo SDK 58.
- Configured camera and photo library permissions in `app.json` config plugin.
- Added interactive Camera capture (`ImagePicker.launchCameraAsync`) and Photo Gallery picker (`ImagePicker.launchImageLibraryAsync`) with square aspect cropping (1:1) in `src/app/wardrobe.tsx`.
- Added item creation modal enabling users to preview photos taken or selected, set piece name, select clothing category (`hair`, `top`, `bottom`, `shoes`), color label, and tags before adding directly to their closet.

## 2026-10-25 - Micro UI/UX & Controls Upgrade

### Added
- Installed `expo-haptics` and wired tactile haptic feedback across slot machine reel snaps, lock toggles, shuffle spins, favorite toggles, and wear logs.
- Added reel position count indicators (`1/5`, `2/8`) in [SlotMachineTier.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/components/SlotMachineTier.tsx) floating info pills.
- Added styled chevron touch controls (`chevron-back`, `chevron-forward`) with glass-morphic pills and press scaling on every tier reel.
- Added hamburger menu button and bottom sheet context menu in [index.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/index.tsx) with quick actions: Lock/Unlock All Tiers, Daily Color Filter, Reset to Starting Pieces, and Full Look Inspection.
- Added press-scale micro-physics (`transform: [{ scale: pressed ? 0.95 : 1.0 }]`) across all buttons, pills, and touch targets.
- Added empty search state with clear/reset button in the Closet screen.
- Adjusted bottom navigation bar in [_layout.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/_layout.tsx) with dynamic `useSafeAreaInsets().bottom` padding and height (`56 + bottomInset`) to prevent overlap with Android 3-button/gesture navigation bars and iOS home indicators.
- Synchronized canvas viewport heights in [index.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/index.tsx) with the adjusted bottom tab bar.

## 2026-10-25 - Local Storage, Full-Screen Preview, Item Removal & In-App Settings

### Added
- Installed `@react-native-async-storage/async-storage` for local persistence.
- Created [src/services/storage.ts](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/services/storage.ts) with full CRUD operations for:
  - Wardrobe items (`loadWardrobeItems`, `saveWardrobeItems`, `addWardrobeItem`, `removeWardrobeItem`, `updateWardrobeItem`)
  - Saved lookbook outfits (`loadSavedOutfits`, `saveSavedOutfits`, `addSavedOutfit`, `removeSavedOutfit`)
  - App settings (`loadSettings`, `saveSettings`, `clearAllData`)
- Added comprehensive **In-App Settings Screen** at [src/app/settings.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/settings.tsx) and registered in [_layout.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/_layout.tsx) bottom navigation tab bar and hamburger quick menu:
  - Day-of-week color banner toggle
  - Auto-shuffle upon app open toggle
  - Global tactile haptics toggle
  - Wardrobe grid column selection (2 vs 3 columns)
  - Image compression quality selector (50%, 70%, 85%, 100%)
  - Category tags badge toggle
  - AI background removal toggle & API key input
  - Delete item confirmation dialog toggle
  - Danger Zone: Reset settings to default or wipe all saved items & lookbooks.
- Added **Full-Screen Item Preview & Zoom** in [src/app/wardrobe.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/wardrobe.tsx):
  - Tap any piece card to open full-screen high-res preview modal
  - Shows color badge, category pill, style tags, and instant favorite/unfavorite toggle
  - Dedicated "Remove from Closet" button with optional confirmation alert.
- Added **Long-Press Context Menu & Deletion**:
  - iOS ActionSheet / Android custom modal on long-press to view full screen, favorite, or delete.
- Wired [src/app/index.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/index.tsx) and [src/app/outfits.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/outfits.tsx) to persist and sync outfits and wardrobe pieces directly via local storage.

## 2026-10-25 - Style Planner, Calendar, DateTime Pickers, Events & Accessories

### Added
- Added `accessory` category to wardrobe system with curated starter items (chronograph watches, sunglasses, leather bags, chains) in [mock-data.ts](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/constants/mock-data.ts).
- Integrated `accessory` category filter pill and creation option in [wardrobe.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/wardrobe.tsx).
- Created `PlannedOutfit` schema in [wardrobe.ts](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/types/wardrobe.ts) and AsyncStorage CRUD functions (`loadPlannedOutfits`, `savePlannedOutfits`, `addPlannedOutfit`, `updatePlannedOutfit`, `removePlannedOutfit`) in [storage.ts](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/services/storage.ts).
- Built full-featured **Style Planner Screen** ([planner.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/planner.tsx)) and registered in navigation tabs ([_layout.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/_layout.tsx)):
  - **Weekly 7-Day View**: Smooth week-by-week pagination with today's indicator, event dots, and date selector.
  - **Monthly Calendar Grid**: Full month matrix with previous/next month navigation and event dots.
  - **Daily Focus & Day Color Rule**: Automatically displays the selected day's color recommendation and psychological meaning.
  - **Event & DateTime Picker Modal**:
    - Occasion/Event title input (e.g. Work presentation, Dinner date, Casual brunch).
    - Event time picker with quick presets (07:00 AM, 08:30 AM, 12:30 PM, 07:00 PM, etc.).
    - Location and notes fields.
    - Two outfit selection modes: pick from existing saved Lookbook outfits or compose directly from closet pieces with an interactive **Accessories selector**.
  - **Scheduled Occasions List**: Displays scheduled events with time/location chips, outfit slices, accessories gallery, completion checkboxes, and delete controls.
- Added Style Planner shortcut directly inside the Match Maker hamburger menu in [index.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/index.tsx).

## 2026-10-25 - Architectural Roadmap & TODO Documentation

### Documented
- Created [docs/TODO.md](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/docs/TODO.md) detailing the upcoming feature: **Puzzle-Style Match Screen Expansion (6-Slot Carousel with Accessories)**.
  - Documented transition from 4 tiers (Hair, Tops, Bottoms, Shoes) to 6 slots (adding 2 accessory slots: Eyewear/Jewelry and Bags/Belts/Watches).
  - Documented puzzle-style interaction model: arrow keys, snap scroll reels, interlocking visual alignment, and tactile lock mechanics.



