import { WardrobeItem } from '@/types/wardrobe';

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  // --- HAIR / HEAD ---
  {
    id: 'hair-1',
    name: 'Textured Crop Fade',
    category: 'hair',
    primaryColor: '#1E293B',
    colorName: 'Jet Black',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['Short', 'Clean', 'Fade', 'Casual'],
    recommendedDays: ['Monday', 'Tuesday', 'Wednesday'],
    isFavorite: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'hair-2',
    name: 'Wavy Middle Part',
    category: 'hair',
    primaryColor: '#334155',
    colorName: 'Dark Brown',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    tags: ['Medium', 'Flow', 'Wavy', 'Smart Casual'],
    recommendedDays: ['Thursday', 'Friday'],
    createdAt: '2026-10-02',
  },
  {
    id: 'hair-3',
    name: 'Beanie / Buzz Look',
    category: 'hair',
    primaryColor: '#64748B',
    colorName: 'Heather Slate',
    imageUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    tags: ['Streetwear', 'Casual', 'Warm'],
    recommendedDays: ['Saturday', 'Sunday'],
    createdAt: '2026-10-05',
  },

  // --- TOPS ---
  {
    id: 'top-1',
    name: 'Crisp Oxford Shirt',
    category: 'top',
    primaryColor: '#FFFFFF',
    colorName: 'Pure White',
    imageUrl:
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    tags: ['Button-down', 'Formal', 'Work', 'Classic'],
    recommendedDays: ['Monday'],
    isFavorite: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'top-2',
    name: 'Heavyweight Boxy Tee',
    category: 'top',
    primaryColor: '#CBD5E1',
    colorName: 'Silver Grey',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    tags: ['Oversized', 'Casual', 'Minimalist'],
    recommendedDays: ['Monday', 'Saturday'],
    createdAt: '2026-10-03',
  },
  {
    id: 'top-3',
    name: 'Sage Knit Overshirt',
    category: 'top',
    primaryColor: '#10B981',
    colorName: 'Sage Green',
    imageUrl:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    tags: ['Layering', 'Earth Tone', 'Smart Casual'],
    recommendedDays: ['Wednesday'],
    isFavorite: true,
    createdAt: '2026-10-04',
  },
  {
    id: 'top-4',
    name: 'Sky Blue Linen Shirt',
    category: 'top',
    primaryColor: '#38BDF8',
    colorName: 'Sky Blue',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    tags: ['Linen', 'Summer', 'Relaxed', 'Friday'],
    recommendedDays: ['Friday'],
    createdAt: '2026-10-06',
  },
  {
    id: 'top-5',
    name: 'Ruby Corduroy Jacket',
    category: 'top',
    primaryColor: '#DC2626',
    colorName: 'Crimson Red',
    imageUrl:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    tags: ['Jacket', 'Bold', 'Evening'],
    recommendedDays: ['Sunday', 'Tuesday'],
    createdAt: '2026-10-08',
  },

  // --- BOTTOMS ---
  {
    id: 'bottom-1',
    name: 'Pleated Tapered Trousers',
    category: 'bottom',
    primaryColor: '#334155',
    colorName: 'Charcoal',
    imageUrl:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    tags: ['Tailored', 'Formal', 'Work', 'Comfort'],
    recommendedDays: ['Monday', 'Thursday'],
    isFavorite: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'bottom-2',
    name: 'Raw Selvedge Denim',
    category: 'bottom',
    primaryColor: '#1E3A8A',
    colorName: 'Dark Indigo',
    imageUrl:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80',
    tags: ['Denim', 'Straight Cut', 'Casual', 'Rugged'],
    recommendedDays: ['Friday', 'Saturday'],
    isFavorite: true,
    createdAt: '2026-10-02',
  },
  {
    id: 'bottom-3',
    name: 'Relaxed Ecru Chinos',
    category: 'bottom',
    primaryColor: '#F8FAFC',
    colorName: 'Off White / Ecru',
    imageUrl:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
    tags: ['Lightweight', 'Minimal', 'Clean', 'Summer'],
    recommendedDays: ['Monday', 'Wednesday'],
    createdAt: '2026-10-05',
  },
  {
    id: 'bottom-4',
    name: 'Olive Cargo Trousers',
    category: 'bottom',
    primaryColor: '#065F46',
    colorName: 'Deep Olive',
    imageUrl:
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80',
    tags: ['Utility', 'Streetwear', 'Loose Fit'],
    recommendedDays: ['Wednesday', 'Saturday'],
    createdAt: '2026-10-07',
  },

  // --- SHOES ---
  {
    id: 'shoes-1',
    name: 'Minimalist White Sneakers',
    category: 'shoes',
    primaryColor: '#FFFFFF',
    colorName: 'Clean White',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    tags: ['Leather', 'Everyday', 'Versatile', 'Low-top'],
    recommendedDays: ['Monday', 'Wednesday', 'Friday'],
    isFavorite: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'shoes-2',
    name: 'Penny Loafers',
    category: 'shoes',
    primaryColor: '#78350F',
    colorName: 'Cognac Brown',
    imageUrl:
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
    tags: ['Leather', 'Smart', 'Office', 'Dress'],
    recommendedDays: ['Monday', 'Thursday'],
    createdAt: '2026-10-03',
  },
  {
    id: 'shoes-3',
    name: 'Suede Chelsea Boots',
    category: 'shoes',
    primaryColor: '#1E293B',
    colorName: 'Black Suede',
    imageUrl:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
    tags: ['Boots', 'Sleek', 'Evening', 'Fall'],
    recommendedDays: ['Tuesday', 'Saturday'],
    isFavorite: true,
    createdAt: '2026-10-04',
  },
];
