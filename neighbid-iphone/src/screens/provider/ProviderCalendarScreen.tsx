import React, {useCallback, useMemo, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {MapPin, Sparkles} from 'lucide-react-native';
import {providerApi, ScheduleItem, SmartScheduleResult} from '../../api/provider';
import {colors, radius, shadow} from '../../theme';
import {Chip} from '../../components/Chip';
import {formatScheduleDuration, groupScheduleItems, ScheduleSummary} from './scheduleUtils';

function nextDays(count: number) {
  const result: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    result.push(date.toISOString().slice(0, 10));
  }
  return result;
}

function todayIso() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today.toISOString().slice(0, 10);
}

function sectionLabel(iso: string, index: number) {
  if (index === 0) {return 'Today';}
  if (index === 1) {return 'Tomorrow';}
  return new Date(`${iso}T12:00:00`).toLocaleDateString([], {
    weekday: 'long',
  });
}

function sectionDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function eventTimeLabel(item: ScheduleSummary, day: string) {
  if (item.dates.length > 1) {
    return `${sectionDate(day)} · ${formatScheduleDuration(item.totalMinutes / item.dates.length)}`;
  }
  if (item.status === 'blocked') {
    return `Blocked hold · ${formatScheduleDuration(item.totalMinutes)}`;
  }
  return formatScheduleDuration(item.totalMinutes);
}

export default function ProviderCalendarScreen() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [plannerDate, setPlannerDate] = useState(todayIso());
  const [planner, setPlanner] = useState<SmartScheduleResult | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const items = await providerApi.getSchedule();
      setSchedule(items.filter(item => new Date(item.scheduled_at) >= new Date()));
    } catch (error: any) {
      console.warn('Provider calendar error:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadPlanner = useCallback(async (date: string) => {
    setPlannerDate(date);
    setPlannerLoading(true);
    setPlannerError(null);
    try {
      const result = await providerApi.getSmartSchedule(date);
      setPlanner(result);
    } catch (error: any) {
      console.warn('Provider smart schedule error:', error.message);
      setPlanner(null);
      setPlannerError('Unable to build an AI day plan right now.');
    } finally {
      setPlannerLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      loadPlanner(todayIso());
    }, [load, loadPlanner])
  );

  const grouped = groupScheduleItems(schedule);
  const blockedCount = grouped.filter(item => item.status === 'blocked').length;
  const plannerDays = useMemo(() => nextDays(5), []);
  const sections = useMemo(() => {
    return nextDays(14)
      .map((day, index) => ({
        day,
        label: sectionLabel(day, index),
        events: grouped.filter(item => item.dates.includes(day)),
      }))
      .filter(section => section.events.length > 0);
  }, [grouped]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.terracotta600}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.sub}>Your upcoming holds and booked jobs, grouped by day.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, {backgroundColor: colors.gold50, borderColor: colors.gold100}]}>
            <Text style={styles.summaryEyebrow}>BLOCKED</Text>
            <Text style={[styles.summaryValue, {color: colors.gold600}]}>{blockedCount}</Text>
            <Text style={styles.summaryLabel}>holds on your calendar</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>UPCOMING</Text>
            <Text style={styles.summaryValue}>{grouped.length}</Text>
            <Text style={styles.summaryLabel}>grouped schedule items</Text>
          </View>
        </View>

        <View style={styles.plannerCard}>
          <View style={styles.plannerTop}>
            <View style={styles.plannerTitleRow}>
              <View style={styles.plannerIcon}>
                <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.plannerTitle}>AI day planner</Text>
                <Text style={styles.plannerSub}>Optimize accepted jobs around your blocked holds.</Text>
              </View>
            </View>
            <Chip label={sectionDate(plannerDate)} tone="terracotta" style={{height: 22}} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plannerDaysRow}>
            {plannerDays.map(day => {
              const active = day === plannerDate;
              return (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.85}
                  onPress={() => loadPlanner(day)}
                  style={[styles.plannerDayChip, active && styles.plannerDayChipActive]}>
                  <Text style={[styles.plannerDayLabel, active && styles.plannerDayLabelActive]}>
                    {new Date(`${day}T12:00:00`).toLocaleDateString([], {weekday: 'short'})}
                  </Text>
                  <Text style={[styles.plannerDayValue, active && styles.plannerDayValueActive]}>
                    {new Date(`${day}T12:00:00`).toLocaleDateString([], {day: 'numeric'})}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {plannerLoading ? (
            <View style={styles.plannerState}>
              <Text style={styles.plannerStateTitle}>Building your best route…</Text>
              <Text style={styles.plannerStateSub}>The AI is ordering jobs to reduce travel and fill the day.</Text>
            </View>
          ) : plannerError ? (
            <View style={styles.plannerState}>
              <Text style={styles.plannerStateTitle}>{plannerError}</Text>
              <Text style={styles.plannerStateSub}>Try another day or refresh the schedule.</Text>
            </View>
          ) : planner && planner.items.length > 0 ? (
            <View style={styles.plannerResults}>
              <View style={styles.plannerStats}>
                <View style={styles.plannerStatPill}>
                  <Text style={styles.plannerStatValue}>{planner.total_hours.toFixed(1)}h</Text>
                  <Text style={styles.plannerStatLabel}>planned</Text>
                </View>
                <View style={styles.plannerStatPill}>
                  <Text style={styles.plannerStatValue}>${Math.round(planner.estimated_revenue_cents / 100)}</Text>
                  <Text style={styles.plannerStatLabel}>revenue</Text>
                </View>
                <View style={styles.plannerStatPill}>
                  <Text style={styles.plannerStatValue}>{planner.conflicts.length}</Text>
                  <Text style={styles.plannerStatLabel}>conflicts</Text>
                </View>
              </View>

              <View style={styles.plannerList}>
                {planner.items.map((item, index) => (
                  <View key={`${item.request_id ?? item.title}-${item.suggested_start}`} style={[styles.plannerRow, index > 0 && styles.plannerRowBorder]}>
                    <View style={styles.plannerTimeWrap}>
                      <Text style={styles.plannerTime}>{item.suggested_start}</Text>
                      <Text style={styles.plannerDuration}>{formatScheduleDuration(item.duration_minutes)}</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.plannerJobTitle}>{item.title}</Text>
                      <Text style={styles.plannerReason}>{item.reason}</Text>
                      <Text style={styles.plannerLocation}>{item.address ?? item.neighborhood}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {planner.conflicts.length > 0 && (
                <View style={styles.conflictBox}>
                  <Text style={styles.conflictTitle}>Watch-outs</Text>
                  {planner.conflicts.map(conflict => (
                    <Text key={conflict} style={styles.conflictText}>• {conflict}</Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.plannerState}>
              <Text style={styles.plannerStateTitle}>No accepted jobs to optimize yet</Text>
              <Text style={styles.plannerStateSub}>Once you win jobs, the AI will build a day plan here.</Text>
            </View>
          )}
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No blocked or booked time yet</Text>
            <Text style={styles.emptySub}>Once you submit bids or win jobs, your schedule will show up here as daily agenda sections.</Text>
          </View>
        ) : (
          sections.map(section => (
            <View key={section.day} style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{section.label}</Text>
                <Text style={styles.sectionDate}>{sectionDate(section.day)}</Text>
              </View>
              <View style={styles.sectionCard}>
                {section.events.map((item, index) => (
                  <View
                    key={`${section.day}-${item.key}`}
                    style={[styles.eventRow, index > 0 && styles.eventRowBorder]}>
                    <View style={styles.eventAccentWrap}>
                      <View style={[styles.eventAccent, {backgroundColor: item.status === 'blocked' ? colors.gold500 : colors.terracotta600}]} />
                    </View>
                    <View style={styles.eventBody}>
                      <View style={styles.eventTop}>
                        <View style={{flex: 1}}>
                          <Text style={styles.eventTitle}>{item.title}</Text>
                          <Text style={styles.eventTime}>{eventTimeLabel(item, section.day)}</Text>
                        </View>
                        <Chip label={item.status} tone={item.status === 'blocked' ? 'gold' : 'terracotta'} style={{height: 24}} />
                      </View>
                      <View style={styles.locationRow}>
                        <MapPin size={12} color={colors.ink300} strokeWidth={2} />
                        <Text style={styles.locationText}>{item.address ?? 'Address TBC'}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120},
  header: {marginBottom: 18},
  title: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
  sub: {fontSize: 14, color: colors.ink400, marginTop: 4, lineHeight: 20},
  summaryRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  summaryCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow.sm,
  },
  summaryEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.9},
  summaryValue: {fontSize: 30, fontWeight: '700', color: colors.ink900, marginTop: 8},
  summaryLabel: {fontSize: 12, color: colors.ink500, marginTop: 4},
  plannerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
    ...shadow.sm,
  },
  plannerTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10},
  plannerTitleRow: {flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1},
  plannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta50,
  },
  plannerTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  plannerSub: {fontSize: 13, color: colors.ink400, marginTop: 2},
  plannerDaysRow: {paddingTop: 14, gap: 8},
  plannerDayChip: {
    minWidth: 62,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream50,
    alignItems: 'center',
  },
  plannerDayChipActive: {
    backgroundColor: colors.terracotta600,
    borderColor: colors.terracotta600,
  },
  plannerDayLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, textTransform: 'uppercase'},
  plannerDayLabelActive: {color: '#FDEDE4'},
  plannerDayValue: {fontSize: 18, fontWeight: '700', color: colors.ink900, marginTop: 2},
  plannerDayValueActive: {color: '#fff'},
  plannerState: {
    paddingTop: 18,
    paddingBottom: 4,
  },
  plannerStateTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900},
  plannerStateSub: {fontSize: 13, color: colors.ink400, marginTop: 6, lineHeight: 19},
  plannerResults: {paddingTop: 14},
  plannerStats: {flexDirection: 'row', gap: 8},
  plannerStatPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  plannerStatValue: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  plannerStatLabel: {fontSize: 11, color: colors.ink400, marginTop: 2, textTransform: 'uppercase'},
  plannerList: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  plannerRow: {flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.bgCard},
  plannerRowBorder: {borderTopWidth: 1, borderTopColor: colors.border},
  plannerTimeWrap: {
    width: 68,
    borderRadius: 14,
    backgroundColor: colors.terracotta50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  plannerTime: {fontSize: 16, fontWeight: '700', color: colors.terracotta600},
  plannerDuration: {fontSize: 11, color: colors.terracotta600, marginTop: 3},
  plannerJobTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, lineHeight: 22},
  plannerReason: {fontSize: 13, color: colors.ink500, marginTop: 4, lineHeight: 19},
  plannerLocation: {fontSize: 12, color: colors.ink300, marginTop: 6},
  conflictBox: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.gold50,
    borderWidth: 1,
    borderColor: colors.gold100,
    padding: 12,
  },
  conflictTitle: {fontSize: 13, fontWeight: '700', color: colors.gold600, marginBottom: 4},
  conflictText: {fontSize: 12, color: colors.gold600, lineHeight: 18},
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...shadow.sm,
  },
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 14, color: colors.ink400, marginTop: 8, lineHeight: 20},
  sectionWrap: {marginBottom: 18},
  sectionHeader: {
    backgroundColor: colors.cream100,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {fontSize: 12, fontWeight: '700', color: colors.ink500, textTransform: 'uppercase'},
  sectionDate: {fontSize: 12, fontWeight: '600', color: colors.ink400},
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  eventRow: {flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 14},
  eventRowBorder: {borderTopWidth: 1, borderTopColor: colors.border},
  eventAccentWrap: {paddingTop: 3},
  eventAccent: {width: 3, minHeight: 46, borderRadius: 999},
  eventBody: {flex: 1},
  eventTop: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
  eventTitle: {fontSize: 18, fontWeight: '600', color: colors.ink700, lineHeight: 24},
  eventTime: {fontSize: 13, color: colors.ink400, marginTop: 2},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8},
  locationText: {fontSize: 12, color: colors.ink300},
});
