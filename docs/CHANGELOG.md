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

