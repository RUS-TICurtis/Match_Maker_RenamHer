# MatchMaker & RenamHer - Project TODOs & Architecture Roadmap

_Last Modified: 2026-10-25_

This document tracks upcoming features, architectural improvements, and planned UI/UX extensions for the application.

---

## 📌 TODO: Puzzle-Style Match Screen Expansion (6-Slot Carousel with Accessories)

> **Status**: Planned / Documented (Do NOT implement yet)  
> **Target Screen**: [src/app/index.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/app/index.tsx)  
> **Component Reference**: [src/components/SlotMachineTier.tsx](file:///c:/Users/Curtis/Documents/_Github/Match_Maker_RenamHer/src/components/SlotMachineTier.tsx)

### Overview
Expand the **Match Maker** slot machine screen from the current 4-tier layout into a modular, puzzle-like interactive canvas with **6 slots**, integrating dedicated accessory tiers.

### Current Layout (4 Tiers)
1. **Tier 1: Hair & Grooming** (`category: 'hair'`)
2. **Tier 2: Tops / Shirts** (`category: 'top'`)
3. **Tier 3: Bottoms / Pants** (`category: 'bottom'`)
4. **Tier 4: Footwear / Shoes** (`category: 'shoes'`)

### Planned Layout (6 Modular Slots)
Add two dedicated slots/puzzle pieces for accessories:
1. **Tier 1: Hair & Headwear** (`hair`, beanies, caps)
2. **Tier 2: Eyewear / Jewelry / Head Accessories** (`accessory`: sunglasses, earrings, necklaces, chains)
3. **Tier 3: Tops / Layers** (`top`: t-shirts, shirts, jackets, sweaters)
4. **Tier 4: Bags & Wristwear / Belts** (`accessory`: watches, crossbody bags, tote bags, belts)
5. **Tier 5: Bottoms / Trousers** (`bottom`: jeans, chinos, skirts, shorts)
6. **Tier 6: Footwear & Socks** (`shoes`: sneakers, boots, loafers)

### Key Planned Features:
- **Puzzle-Style Interaction**:
  - Arrow keys / chevron buttons (`chevron-back`, `chevron-forward`) to scroll through options independently per tier.
  - Horizontal swipe / snap scroll on reels.
  - Interactive tactile lock/unlock toggle per puzzle slot.
  - Seamless vertical docking where clothing and accessories align visually like interlocking puzzle pieces.
- **Dynamic Viewport Height Calculation**:
  - Dynamically recalculate slot heights across 6 tiers based on available canvas height (`canvasHeight / 6` with visual weighting, e.g. accessories given compact pill heights ~10-12%, tops/bottoms given 22-26%).
- **Outfit Linking**:
  - Store selected accessory IDs (`accessoryIds: string[]`) directly in `SavedOutfit` and `PlannedOutfit` objects upon saving.

---

## 📋 Previously Completed Milestones

- [x] **Local Storage Engine**: AsyncStorage persistence for wardrobe items, outfits, and app settings.
- [x] **In-App Settings Screen**: Column toggles, image quality, haptics, day color banner preferences.
- [x] **Closet Controls**: High-res full-screen preview, favorite toggle, and item removal.
- [x] **Camera & Image Picker**: Camera snapshot, gallery picker, category and color tags.
- [x] **Style Planner & Calendar**: Weekly and monthly views, date-time pickers, scheduled event occasions, and outfit planning.
- [x] **Accessories Cataloging**: Added `accessory` category and mock data in wardrobe system.
