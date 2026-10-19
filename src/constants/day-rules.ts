import { DayColorRule, DayOfWeek } from '@/types/wardrobe';

export const DEFAULT_DAY_COLOR_RULES: DayColorRule[] = [
  {
    day: 'Monday',
    colorName: 'White & Silver',
    hexColors: ['#FFFFFF', '#E2E8F0', '#CBD5E1', '#F8FAFC'],
    meaning: 'Purity, Clarity & Fresh Beginnings',
  },
  {
    day: 'Tuesday',
    colorName: 'Pink & Rose',
    hexColors: ['#F43F5E', '#FB7185', '#FDA4AF', '#BE185D'],
    meaning: 'Energy, Confidence & Passion',
  },
  {
    day: 'Wednesday',
    colorName: 'Green & Emerald',
    hexColors: ['#10B981', '#34D399', '#059669', '#065F46'],
    meaning: 'Growth, Balance & Communication',
  },
  {
    day: 'Thursday',
    colorName: 'Orange & Warm Yellow',
    hexColors: ['#F59E0B', '#F97316', '#FBBF24', '#D97706'],
    meaning: 'Wisdom, Optimism & Creativity',
  },
  {
    day: 'Friday',
    colorName: 'Light Blue & Cyan',
    hexColors: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#0284C7'],
    meaning: 'Harmony, Elegance & Social Connection',
  },
  {
    day: 'Saturday',
    colorName: 'Purple & Deep Charcoal',
    hexColors: ['#8B5CF6', '#A855F7', '#334155', '#1E293B'],
    meaning: 'Rest, Mystery & Individual Expression',
  },
  {
    day: 'Sunday',
    colorName: 'Red & Gold',
    hexColors: ['#EF4444', '#DC2626', '#EAB308', '#B91C1C'],
    meaning: 'Vitality, Leadership & Celebration',
  },
];

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[new Date().getDay()];
}

export function getDayColorRule(day: DayOfWeek): DayColorRule {
  const found = DEFAULT_DAY_COLOR_RULES.find((r) => r.day === day);
  return found || DEFAULT_DAY_COLOR_RULES[0];
}
