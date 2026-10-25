import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  useColorScheme,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import {
  WardrobeItem,
  SavedOutfit,
  PlannedOutfit,
  DayOfWeek,
} from '@/types/wardrobe';
import {
  loadWardrobeItems,
  loadSavedOutfits,
  loadPlannedOutfits,
  savePlannedOutfits,
  addPlannedOutfit,
  removePlannedOutfit,
  updatePlannedOutfit,
  loadSettings,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@/services/storage';
import { getDayColorRule } from '@/constants/day-rules';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PRESET_HOURS = [
  '07:00 AM',
  '08:30 AM',
  '09:00 AM',
  '12:30 PM',
  '02:00 PM',
  '05:30 PM',
  '07:00 PM',
  '08:30 PM',
];

export default function PlannerScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [plans, setPlans] = useState<PlannedOutfit[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Active view: 'week' or 'month'
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Currently selected date (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Anchor date for weekly navigation (defaults to today's week)
  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(new Date());

  // Anchor month for monthly view (year and month 0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  // Modal State for Schedule Event / Outfit Picker
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00 AM');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [selectedPieces, setSelectedPieces] = useState<{
    hairId?: string;
    topId?: string;
    bottomId?: string;
    shoesId?: string;
    accessoryIds: string[];
  }>({ accessoryIds: [] });
  const [pickerTab, setPickerTab] = useState<'saved' | 'pieces'>('saved');

  // Load Initial Data
  const refreshData = useCallback(async () => {
    const [w, o, p, s] = await Promise.all([
      loadWardrobeItems(),
      loadSavedOutfits(),
      loadPlannedOutfits(),
      loadSettings(),
    ]);
    setWardrobe(w);
    setSavedOutfits(o);
    setPlans(p);
    setSettings(s);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compute 7 Days of the current week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const curr = new Date(weekAnchorDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const days: { dateStr: string; dayName: DayOfWeek; dayNum: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: DAYS_OF_WEEK[d.getDay()],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [weekAnchorDate, todayStr]);

  // Navigation handlers for week
  const handlePrevWeek = () => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    const d = new Date(weekAnchorDate);
    d.setDate(d.getDate() - 7);
    setWeekAnchorDate(d);
  };

  const handleNextWeek = () => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    const d = new Date(weekAnchorDate);
    d.setDate(d.getDate() + 7);
    setWeekAnchorDate(d);
  };

  const handleGoToToday = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const now = new Date();
    setWeekAnchorDate(now);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Monthly Grid Data
  const monthCalendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: { dateStr?: string; dayNum?: number; isCurrentMonth: boolean; hasPlans: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      cells.push({ isCurrentMonth: false, hasPlans: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      const hasPlans = plans.some((p) => p.date === dateStr);
      cells.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
        hasPlans,
      });
    }
    return cells;
  }, [currentYear, currentMonth, plans]);

  const handlePrevMonth = () => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Plans for the currently selected date
  const selectedDatePlans = useMemo(() => {
    return plans.filter((p) => p.date === selectedDate);
  }, [plans, selectedDate]);

  // Selected date Day Name and Rule
  const selectedDayInfo = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];
    const rule = getDayColorRule(dayName);
    return { dayName, rule, dateObj };
  }, [selectedDate]);

  // Open Schedule Modal
  const handleOpenScheduleModal = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEventTitle('');
    setEventLocation('');
    setEventNotes('');
    setEventTime('09:00 AM');
    setSelectedOutfitId(savedOutfits[0]?.id || null);
    setSelectedPieces({
      hairId: wardrobe.find((i) => i.category === 'hair')?.id,
      topId: wardrobe.find((i) => i.category === 'top')?.id,
      bottomId: wardrobe.find((i) => i.category === 'bottom')?.id,
      shoesId: wardrobe.find((i) => i.category === 'shoes')?.id,
      accessoryIds: [],
    });
    setPickerTab(savedOutfits.length > 0 ? 'saved' : 'pieces');
    setIsScheduleModalVisible(true);
  };

  // Save Scheduled Outfit / Event
  const handleSavePlan = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Missing Event Title', 'Please give this occasion or plan a title (e.g. Work, Dinner Date).');
      return;
    }

    let hairId: string | undefined;
    let topId: string | undefined;
    let bottomId: string | undefined;
    let shoesId: string | undefined;
    let accessoryIds: string[] = [];

    if (pickerTab === 'saved' && selectedOutfitId) {
      const linked = savedOutfits.find((o) => o.id === selectedOutfitId);
      if (linked) {
        hairId = linked.hairId;
        topId = linked.topId;
        bottomId = linked.bottomId;
        shoesId = linked.shoesId;
        accessoryIds = linked.accessoryIds || [];
      }
    } else {
      hairId = selectedPieces.hairId;
      topId = selectedPieces.topId;
      bottomId = selectedPieces.bottomId;
      shoesId = selectedPieces.shoesId;
      accessoryIds = selectedPieces.accessoryIds;
    }

    const newPlan: PlannedOutfit = {
      id: `plan_${Date.now()}`,
      date: selectedDate,
      time: eventTime,
      eventTitle: eventTitle.trim(),
      location: eventLocation.trim() || undefined,
      notes: eventNotes.trim() || undefined,
      outfitId: pickerTab === 'saved' ? selectedOutfitId || undefined : undefined,
      hairId,
      topId,
      bottomId,
      shoesId,
      accessoryIds,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    const updated = await addPlannedOutfit(newPlan);
    setPlans(updated);
    setIsScheduleModalVisible(false);

    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  // Delete Plan
  const handleDeletePlan = (plan: PlannedOutfit) => {
    Alert.alert(
      'Remove Scheduled Outfit',
      `Delete "${plan.eventTitle || 'Planned Outfit'}" from ${plan.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await removePlannedOutfit(plan.id);
            setPlans(updated);
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
          },
        },
      ]
    );
  };

  // Toggle Plan Completion
  const handleToggleComplete = async (plan: PlannedOutfit) => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const updated = await updatePlannedOutfit(plan.id, { isCompleted: !plan.isCompleted });
    setPlans(updated);
  };

  // Helper to get WardrobeItem
  const getItem = (id?: string) => wardrobe.find((i) => i.id === id);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ─── Top Header & Controls ─────────────────────── */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>STYLE PLANNER</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {plans.length} outfits scheduled across the calendar
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={[styles.todayChip, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleGoToToday}>
            <Text style={[styles.todayChipText, { color: theme.primary }]}>Today</Text>
          </Pressable>

          {/* View Mode Toggle */}
          <View style={[styles.modeToggle, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Pressable
              style={[
                styles.modeBtn,
                viewMode === 'week' && { backgroundColor: theme.primary },
              ]}
              onPress={() => {
                if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                setViewMode('week');
              }}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={viewMode === 'week' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  { color: viewMode === 'week' ? '#FFFFFF' : theme.textSecondary },
                ]}>
                Week
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeBtn,
                viewMode === 'month' && { backgroundColor: theme.primary },
              ]}
              onPress={() => {
                if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                setViewMode('month');
              }}>
              <Ionicons
                name="grid-outline"
                size={14}
                color={viewMode === 'month' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  { color: viewMode === 'month' ? '#FFFFFF' : theme.textSecondary },
                ]}>
                Month
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Week Navigation View ─────────────────────── */}
        {viewMode === 'week' ? (
          <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.calendarNavHeader}>
              <Pressable style={styles.navArrow} onPress={handlePrevWeek}>
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </Pressable>

              <Text style={[styles.weekNavTitle, { color: theme.text }]}>
                {weekDays[0].dateStr.slice(5)} — {weekDays[6].dateStr.slice(5)}
              </Text>

              <Pressable style={styles.navArrow} onPress={handleNextWeek}>
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </Pressable>
            </View>

            {/* 7-Day Pill Row */}
            <View style={styles.weekPillsRow}>
              {weekDays.map((d) => {
                const isSelected = d.dateStr === selectedDate;
                const dayPlans = plans.filter((p) => p.date === d.dateStr);
                const hasPlans = dayPlans.length > 0;

                return (
                  <Pressable
                    key={d.dateStr}
                    style={({ pressed }) => [
                      styles.dayPillBtn,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : d.isToday
                          ? theme.backgroundSelected
                          : 'transparent',
                        borderColor: isSelected
                          ? theme.primary
                          : d.isToday
                          ? theme.tint
                          : 'transparent',
                        transform: [{ scale: pressed ? 0.94 : 1.0 }],
                      },
                    ]}
                    onPress={() => {
                      if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                      setSelectedDate(d.dateStr);
                    }}>
                    <Text
                      style={[
                        styles.dayPillLetter,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                      ]}>
                      {d.dayName.slice(0, 3).toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.dayPillNum,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : d.isToday
                            ? theme.primary
                            : theme.text,
                        },
                      ]}>
                      {d.dayNum}
                    </Text>

                    {/* Has Planned Outfit indicator dot */}
                    {hasPlans && (
                      <View
                        style={[
                          styles.planDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : theme.accent },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          /* ─── Monthly Calendar Grid View ───────────────── */
          <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.calendarNavHeader}>
              <Pressable style={styles.navArrow} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </Pressable>

              <Text style={[styles.weekNavTitle, { color: theme.text }]}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>

              <Pressable style={styles.navArrow} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </Pressable>
            </View>

            {/* Day of Week Headers */}
            <View style={styles.monthHeaderRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((abbr) => (
                <Text key={abbr} style={[styles.monthHeaderCell, { color: theme.textSecondary }]}>
                  {abbr}
                </Text>
              ))}
            </View>

            {/* Calendar Days Matrix */}
            <View style={styles.monthGrid}>
              {monthCalendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <View key={idx} style={styles.monthEmptyCell} />;
                }
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayStr;

                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.monthCell,
                      isSelected && { backgroundColor: theme.primary, borderRadius: 10 },
                      isToday && !isSelected && { borderColor: theme.primary, borderWidth: 1, borderRadius: 10 },
                      { transform: [{ scale: pressed ? 0.92 : 1.0 }] },
                    ]}
                    onPress={() => {
                      if (cell.dateStr) {
                        if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                        setSelectedDate(cell.dateStr);
                      }
                    }}>
                    <Text
                      style={[
                        styles.monthCellText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isToday
                            ? theme.primary
                            : theme.text,
                        },
                      ]}>
                      {cell.dayNum}
                    </Text>
                    {cell.hasPlans && (
                      <View
                        style={[
                          styles.monthPlanDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : theme.accent },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Selected Day Focus & Color Rule Banner ───── */}
        <View
          style={[
            styles.dayFocusBanner,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <View style={styles.dayFocusHeader}>
            <View>
              <Text style={[styles.dayFocusDate, { color: theme.text }]}>
                {selectedDayInfo.dayName}, {selectedDate}
              </Text>
              <Text style={[styles.dayRuleMeaning, { color: theme.textSecondary }]}>
                {selectedDayInfo.rule.meaning}
              </Text>
            </View>

            {/* Color Swatches for Day */}
            <View style={styles.dayRuleColors}>
              {selectedDayInfo.rule.hexColors.slice(0, 3).map((hex, i) => (
                <View key={i} style={[styles.ruleColorDot, { backgroundColor: hex }]} />
              ))}
              <Text style={[styles.ruleColorName, { color: theme.textSecondary }]}>
                {selectedDayInfo.rule.colorName}
              </Text>
            </View>
          </View>

          {/* Quick Schedule Button for This Day */}
          <Pressable
            style={({ pressed }) => [
              styles.scheduleBtn,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: pressed ? 0.96 : 1.0 }],
              },
            ]}
            onPress={handleOpenScheduleModal}>
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.scheduleBtnText}>Schedule Outfit for {selectedDayInfo.dayName}</Text>
          </Pressable>
        </View>

        {/* ─── Planned Outfits for This Day ─────────────── */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SCHEDULED OCCASIONS ({selectedDatePlans.length})
          </Text>

          {selectedDatePlans.length === 0 ? (
            <View style={[styles.noPlansCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="shirt-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.noPlansTitle, { color: theme.text }]}>
                No Outfit Planned Yet
              </Text>
              <Text style={[styles.noPlansDesc, { color: theme.textSecondary }]}>
                Plan your clothing ahead for work, dinner, or social events on {selectedDayInfo.dayName}.
              </Text>
            </View>
          ) : (
            selectedDatePlans.map((plan) => {
              const hair = getItem(plan.hairId);
              const top = getItem(plan.topId);
              const bottom = getItem(plan.bottomId);
              const shoes = getItem(plan.shoesId);
              const accessories = (plan.accessoryIds || []).map((id) => getItem(id)).filter(Boolean);

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    plan.isCompleted && { opacity: 0.75 },
                  ]}>
                  {/* Event Top Bar */}
                  <View style={styles.planCardTop}>
                    <Pressable
                      style={styles.checkboxTouch}
                      onPress={() => handleToggleComplete(plan)}>
                      <Ionicons
                        name={plan.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={plan.isCompleted ? '#10B981' : theme.textSecondary}
                      />
                    </Pressable>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.planEventTitle,
                          { color: theme.text },
                          plan.isCompleted && styles.completedText,
                        ]}>
                        {plan.eventTitle}
                      </Text>
                      <View style={styles.planMetaRow}>
                        {plan.time && (
                          <View style={styles.planMetaItem}>
                            <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.planMetaText, { color: theme.textSecondary }]}>
                              {plan.time}
                            </Text>
                          </View>
                        )}
                        {plan.location && (
                          <View style={styles.planMetaItem}>
                            <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.planMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
                              {plan.location}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Pressable
                      style={styles.deletePlanBtn}
                      onPress={() => handleDeletePlan(plan)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>

                  {/* Slices of Clothing Pieces */}
                  <View style={styles.planSlicesRow}>
                    {hair && (
                      <View style={styles.planSlice}>
                        <Image source={{ uri: hair.imageUrl }} style={styles.sliceImg} contentFit="cover" />
                        <Text style={styles.sliceBadge}>HAIR</Text>
                      </View>
                    )}
                    {top && (
                      <View style={styles.planSlice}>
                        <Image source={{ uri: top.imageUrl }} style={styles.sliceImg} contentFit="cover" />
                        <Text style={styles.sliceBadge}>TOP</Text>
                      </View>
                    )}
                    {bottom && (
                      <View style={styles.planSlice}>
                        <Image source={{ uri: bottom.imageUrl }} style={styles.sliceImg} contentFit="cover" />
                        <Text style={styles.sliceBadge}>BOTTOM</Text>
                      </View>
                    )}
                    {shoes && (
                      <View style={styles.planSlice}>
                        <Image source={{ uri: shoes.imageUrl }} style={styles.sliceImg} contentFit="cover" />
                        <Text style={styles.sliceBadge}>SHOES</Text>
                      </View>
                    )}
                  </View>

                  {/* Accessories Mini-Gallery if any */}
                  {accessories.length > 0 && (
                    <View style={styles.accessoriesSection}>
                      <Text style={[styles.accHeading, { color: theme.textSecondary }]}>
                        ACCESSORIES ({accessories.length})
                      </Text>
                      <View style={styles.accRow}>
                        {accessories.map((acc) => (
                          <View
                            key={acc!.id}
                            style={[styles.accPill, { backgroundColor: theme.backgroundElement }]}>
                            <Image source={{ uri: acc!.imageUrl }} style={styles.accThumb} contentFit="cover" />
                            <Text style={[styles.accName, { color: theme.text }]} numberOfLines={1}>
                              {acc!.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {plan.notes && (
                    <View style={[styles.notesBox, { backgroundColor: theme.backgroundElement }]}>
                      <Ionicons name="document-text-outline" size={12} color={theme.textSecondary} />
                      <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                        {plan.notes}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ─── Schedule Outfit Modal with DateTime Pickers ─ */}
      <Modal
        visible={isScheduleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsScheduleModalVisible(false)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setIsScheduleModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Schedule Outfit</Text>
            <Pressable onPress={handleSavePlan}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Occasion / Event Title */}
            <View style={styles.modalGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>EVENT / OCCASION TITLE *</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="e.g. Client Presentation, Dinner Date, Gym"
                placeholderTextColor={theme.textSecondary}
                value={eventTitle}
                onChangeText={setEventTitle}
              />
            </View>

            {/* Date Target */}
            <View style={styles.modalGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>TARGET DATE (YYYY-MM-DD)</Text>
              <View
                style={[
                  styles.datePillDisplay,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Ionicons name="calendar" size={16} color={theme.primary} />
                <Text style={[styles.dateDisplayText, { color: theme.text }]}>
                  {selectedDayInfo.dayName}, {selectedDate}
                </Text>
              </View>
            </View>

            {/* Time Picker / Presets */}
            <View style={styles.modalGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>EVENT TIME</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text, marginBottom: 8 },
                ]}
                placeholder="09:00 AM"
                placeholderTextColor={theme.textSecondary}
                value={eventTime}
                onChangeText={setEventTime}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timePresetsRow}>
                {PRESET_HOURS.map((h) => (
                  <Pressable
                    key={h}
                    style={[
                      styles.timePresetChip,
                      {
                        backgroundColor: eventTime === h ? theme.primary : theme.card,
                        borderColor: eventTime === h ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                      setEventTime(h);
                    }}>
                    <Text
                      style={[
                        styles.timePresetText,
                        { color: eventTime === h ? '#FFFFFF' : theme.text },
                      ]}>
                      {h}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Location & Notes */}
            <View style={styles.modalGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>LOCATION (OPTIONAL)</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="e.g. Soho House, Main Office, Central Park"
                placeholderTextColor={theme.textSecondary}
                value={eventLocation}
                onChangeText={setEventLocation}
              />
            </View>

            {/* Tab: Saved Look vs Manual Pieces */}
            <View style={styles.modalGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>SELECT OUTFIT TO WEAR</Text>
              <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Pressable
                  style={[
                    styles.tabItem,
                    pickerTab === 'saved' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setPickerTab('saved')}>
                  <Text
                    style={[
                      styles.tabItemText,
                      { color: pickerTab === 'saved' ? '#FFFFFF' : theme.textSecondary },
                    ]}>
                    From Lookbook ({savedOutfits.length})
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.tabItem,
                    pickerTab === 'pieces' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setPickerTab('pieces')}>
                  <Text
                    style={[
                      styles.tabItemText,
                      { color: pickerTab === 'pieces' ? '#FFFFFF' : theme.textSecondary },
                    ]}>
                    Pick Closet Pieces
                  </Text>
                </Pressable>
              </View>

              {/* Lookbook Outfits List */}
              {pickerTab === 'saved' ? (
                <View style={styles.savedOutfitsPicker}>
                  {savedOutfits.length === 0 ? (
                    <Text style={[styles.emptyNote, { color: theme.textSecondary }]}>
                      No saved outfits in Lookbook. Switch to "Pick Closet Pieces" to select directly.
                    </Text>
                  ) : (
                    savedOutfits.map((outfit) => {
                      const isSelected = selectedOutfitId === outfit.id;
                      const top = getItem(outfit.topId);
                      const bottom = getItem(outfit.bottomId);
                      const shoes = getItem(outfit.shoesId);

                      return (
                        <Pressable
                          key={outfit.id}
                          style={[
                            styles.outfitPickRow,
                            {
                              backgroundColor: theme.card,
                              borderColor: isSelected ? theme.primary : theme.border,
                            },
                          ]}
                          onPress={() => {
                            if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                            setSelectedOutfitId(outfit.id);
                          }}>
                          <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isSelected ? theme.primary : theme.textSecondary}
                          />

                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.outfitPickName, { color: theme.text }]}>
                              {outfit.name}
                            </Text>
                            <Text style={[styles.outfitPickSub, { color: theme.textSecondary }]}>
                              {top?.name || 'Top'} • {bottom?.name || 'Bottom'}
                            </Text>
                          </View>

                          <View style={styles.miniThumbRow}>
                            {top && <Image source={{ uri: top.imageUrl }} style={styles.miniThumb} />}
                            {bottom && <Image source={{ uri: bottom.imageUrl }} style={styles.miniThumb} />}
                            {shoes && <Image source={{ uri: shoes.imageUrl }} style={styles.miniThumb} />}
                          </View>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              ) : (
                /* Closet Individual Pieces Selector */
                <View style={styles.piecePickersSection}>
                  {/* Accessories Picker */}
                  <Text style={[styles.subPickLabel, { color: theme.textSecondary }]}>ACCESSORIES</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pieceRow}>
                    {wardrobe
                      .filter((i) => i.category === 'accessory')
                      .map((acc) => {
                        const isChosen = selectedPieces.accessoryIds.includes(acc.id);
                        return (
                          <Pressable
                            key={acc.id}
                            style={[
                              styles.pieceChip,
                              {
                                backgroundColor: isChosen ? theme.primary : theme.card,
                                borderColor: isChosen ? theme.primary : theme.border,
                              },
                            ]}
                            onPress={() => {
                              if (settings.hapticsEnabled) Haptics.selectionAsync().catch(() => {});
                              setSelectedPieces((prev) => ({
                                ...prev,
                                accessoryIds: isChosen
                                  ? prev.accessoryIds.filter((id) => id !== acc.id)
                                  : [...prev.accessoryIds, acc.id],
                              }));
                            }}>
                            <Image source={{ uri: acc.imageUrl }} style={styles.pieceChipImg} />
                            <Text
                              style={[
                                styles.pieceChipText,
                                { color: isChosen ? '#FFFFFF' : theme.text },
                              ]}
                              numberOfLines={1}>
                              {acc.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>

                  {/* Tops Picker */}
                  <Text style={[styles.subPickLabel, { color: theme.textSecondary, marginTop: 12 }]}>TOPS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pieceRow}>
                    {wardrobe
                      .filter((i) => i.category === 'top')
                      .map((top) => {
                        const isChosen = selectedPieces.topId === top.id;
                        return (
                          <Pressable
                            key={top.id}
                            style={[
                              styles.pieceChip,
                              {
                                backgroundColor: isChosen ? theme.primary : theme.card,
                                borderColor: isChosen ? theme.primary : theme.border,
                              },
                            ]}
                            onPress={() => setSelectedPieces((prev) => ({ ...prev, topId: top.id }))}>
                            <Image source={{ uri: top.imageUrl }} style={styles.pieceChipImg} />
                            <Text
                              style={[
                                styles.pieceChipText,
                                { color: isChosen ? '#FFFFFF' : theme.text },
                              ]}
                              numberOfLines={1}>
                              {top.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>

                  {/* Bottoms Picker */}
                  <Text style={[styles.subPickLabel, { color: theme.textSecondary, marginTop: 12 }]}>BOTTOMS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pieceRow}>
                    {wardrobe
                      .filter((i) => i.category === 'bottom')
                      .map((bottom) => {
                        const isChosen = selectedPieces.bottomId === bottom.id;
                        return (
                          <Pressable
                            key={bottom.id}
                            style={[
                              styles.pieceChip,
                              {
                                backgroundColor: isChosen ? theme.primary : theme.card,
                                borderColor: isChosen ? theme.primary : theme.border,
                              },
                            ]}
                            onPress={() => setSelectedPieces((prev) => ({ ...prev, bottomId: bottom.id }))}>
                            <Image source={{ uri: bottom.imageUrl }} style={styles.pieceChipImg} />
                            <Text
                              style={[
                                styles.pieceChipText,
                                { color: isChosen ? '#FFFFFF' : theme.text },
                              ]}
                              numberOfLines={1}>
                              {bottom.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>

                  {/* Footwear Picker */}
                  <Text style={[styles.subPickLabel, { color: theme.textSecondary, marginTop: 12 }]}>SHOES</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pieceRow}>
                    {wardrobe
                      .filter((i) => i.category === 'shoes')
                      .map((shoe) => {
                        const isChosen = selectedPieces.shoesId === shoe.id;
                        return (
                          <Pressable
                            key={shoe.id}
                            style={[
                              styles.pieceChip,
                              {
                                backgroundColor: isChosen ? theme.primary : theme.card,
                                borderColor: isChosen ? theme.primary : theme.border,
                              },
                            ]}
                            onPress={() => setSelectedPieces((prev) => ({ ...prev, shoesId: shoe.id }))}>
                            <Image source={{ uri: shoe.imageUrl }} style={styles.pieceChipImg} />
                            <Text
                              style={[
                                styles.pieceChipText,
                                { color: isChosen ? '#FFFFFF' : theme.text },
                              ]}
                              numberOfLines={1}>
                              {shoe.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.savePlanFullBtn, { backgroundColor: theme.primary }]}
              onPress={handleSavePlan}>
              <Ionicons name="calendar" size={18} color="#FFFFFF" />
              <Text style={styles.savePlanFullBtnText}>Confirm & Add to Schedule</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  todayChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 2,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  calendarNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: {
    padding: 6,
  },
  weekNavTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weekPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPillBtn: {
    width: (SCREEN_WIDTH - 64) / 7,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
  },
  dayPillLetter: {
    fontSize: 9,
    fontWeight: '800',
  },
  dayPillNum: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  planDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  monthHeaderCell: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthEmptyCell: {
    width: (SCREEN_WIDTH - 60) / 7,
    height: 38,
  },
  monthCell: {
    width: (SCREEN_WIDTH - 60) / 7,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthCellText: {
    fontSize: 13,
    fontWeight: '700',
  },
  monthPlanDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayFocusBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  dayFocusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayFocusDate: {
    fontSize: 16,
    fontWeight: '800',
  },
  dayRuleMeaning: {
    fontSize: 12,
    marginTop: 2,
  },
  dayRuleColors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ruleColorName: {
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  scheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  plansSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  noPlansCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noPlansTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  noPlansDesc: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxTouch: {
    paddingTop: 2,
  },
  planEventTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  planMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planMetaText: {
    fontSize: 11,
  },
  deletePlanBtn: {
    padding: 4,
  },
  planSlicesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  planSlice: {
    flex: 1,
    height: 75,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  sliceImg: {
    width: '100%',
    height: '100%',
  },
  sliceBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  accessoriesSection: {
    gap: 6,
  },
  accHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  accPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accThumb: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  accName: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 120,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 11,
    flex: 1,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCancel: {
    fontSize: 14,
  },
  modalSave: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 20,
    gap: 16,
  },
  modalGroup: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  datePillDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timePresetsRow: {
    gap: 6,
  },
  timePresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  timePresetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '700',
  },
  savedOutfitsPicker: {
    gap: 8,
    marginTop: 8,
  },
  outfitPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  outfitPickName: {
    fontSize: 13,
    fontWeight: '700',
  },
  outfitPickSub: {
    fontSize: 11,
    marginTop: 2,
  },
  miniThumbRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  emptyNote: {
    fontSize: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  piecePickersSection: {
    marginTop: 10,
  },
  subPickLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pieceRow: {
    gap: 8,
  },
  pieceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  pieceChipImg: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  pieceChipText: {
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 100,
  },
  savePlanFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  savePlanFullBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
