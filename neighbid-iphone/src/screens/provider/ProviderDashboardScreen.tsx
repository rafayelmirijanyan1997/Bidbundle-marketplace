import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  MapPin, Briefcase, Star, MessageCircle, ChevronRight, Zap, ClipboardList, CalendarDays, Sparkles, TrendingUp, Bell, X,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {providerApi, ProviderDashboard, JobFeedItem, ScheduleItem, ProviderProfile, DemandForecastResult, Notification} from '../../api/provider';
import {useAuth} from '../../hooks/useAuth';
import {Chip} from '../../components/Chip';
import {formatScheduleDates, formatScheduleDuration, groupScheduleItems} from './scheduleUtils';
import {getLosAngelesGreeting} from '../../utils/time';

const DISMISSED_KEY = 'dismissed_notification_ids';

const brandMark = require('../../assets/bidbundle-mark.png');

function categoryColor(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes('lawn') || c.includes('garden')) {return colors.sage500;}
  if (c.includes('plumb') || c.includes('hvac') || c.includes('elect')) {return '#6F8DB8';}
  if (c.includes('clean')) {return '#B07AA0';}
  if (c.includes('gutter') || c.includes('roof')) {return colors.gold500;}
  return colors.terracotta500;
}

function neighbourLabel(memberCount: number | null | undefined) {
  const neighbours = Math.max((memberCount ?? 1) - 1, 0);
  if (neighbours <= 0) {return '1 home';}
  return `+${neighbours} neighbour${neighbours === 1 ? '' : 's'}`;
}

function cleanJobTitle(title: string) {
  return title
    .replace(/\s+#\d+\b/g, '')
    .replace(/\s*\(\+\d+\s+neighbours?\)\s*/gi, '')
    .trim();
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, letter => letter.toUpperCase());
}

// Mini bar chart
function RevenueChart({color}: {color: string}) {
  const bars = [0, 0, 30, 60, 45, 80];
  const max = Math.max(...bars, 1);
  const months = ['J','F','M','A','M','J'];
  return (
    <View style={rc.wrap}>
      {bars.map((v, i) => (
        <View key={i} style={rc.col}>
          <View style={[rc.bar, {height: Math.max(4, (v / max) * 60), backgroundColor: v > 0 ? color : colors.cream200}]} />
          <Text style={rc.label}>{months[i]}</Text>
        </View>
      ))}
    </View>
  );
}
const rc = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 74},
  col: {flex: 1, alignItems: 'center', gap: 4},
  bar: {width: '100%', borderRadius: 3},
  label: {fontSize: 9, color: colors.ink300, fontWeight: '600'},
});

export default function ProviderDashboardScreen({
  onGoToJobs,
  onGoToBids,
  onGoToMessages,
  onGoToCalendar,
}: {
  onGoToJobs?: () => void;
  onGoToBids?: () => void;
  onGoToMessages?: () => void;
  onGoToCalendar?: () => void;
}) {
  const {user} = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then(raw => {
      if (raw) setDismissedIds(new Set(JSON.parse(raw)));
    });
  }, []);

  const load = useCallback(async () => {
    try {
      const [dash, prof, feed, sched, notifs] = await Promise.all([
        providerApi.getDashboard(),
        providerApi.getProfile(),
        providerApi.getJobFeed(),
        providerApi.getSchedule(),
        providerApi.getNotifications().catch(() => []),
      ]);
      setDashboard(dash);
      setProfile(prof);
      setJobs(feed.slice(0, 3));
      setSchedule(sched.filter(s => new Date(s.scheduled_at) >= new Date()));
      setNotifications(notifs);
      const forecastNeighborhood = prof.neighborhood ?? user?.neighborhood;
      if (forecastNeighborhood) {
        try {
          setForecast(await providerApi.getDemandForecast(forecastNeighborhood));
        } catch (forecastError: any) {
          console.warn('Provider forecast error:', forecastError.message);
          setForecast(null);
        }
      } else {
        setForecast(null);
      }
    } catch (e: any) {console.warn('Provider dash error:', e.message);}
    finally {setLoading(false); setRefreshing(false);}
  }, [user?.neighborhood]);

  useEffect(() => {load();}, [load]);

  async function dismissNotification(id: number) {
    const next = new Set([...dismissedIds, id]);
    setDismissedIds(next);
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
  }

  const companyName = profile?.company_name ?? user?.full_name ?? 'Provider';
  const firstName = companyName.split(' ')[0];
  const totalRevenue = Math.round((dashboard?.revenue_total_cents ?? 0) / 100);
  const groupedSchedule = groupScheduleItems(schedule).slice(0, 3);
  const greeting = getLosAngelesGreeting();
  const topForecast = forecast?.predictions?.[0] ?? null;
  const shortageCount = forecast?.predictions.filter(prediction => prediction.provider_shortage).length ?? 0;
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id)).slice(0, 2);

  if (loading) {
    return <SafeAreaView style={s.safe} edges={['top']}><View style={s.centered}><Text style={s.loadTxt}>Loading…</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarHeight + 40}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={colors.terracotta600} />}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerCard}>
            <View style={s.brandHeaderRow}>
              <View style={s.brandRow}>
                <View style={s.brandMarkWrap}>
                  <Image source={brandMark} style={s.brandMark} resizeMode="contain" />
                </View>
                <Text style={s.brand}>BidBundle</Text>
                <View style={s.brandPillSoft}>
                  <Text style={s.brandSoftText}>Provider</Text>
                </View>
              </View>
            </View>
            <View style={s.headerTopRow}>
              <Text style={s.greeting}>{greeting}, {firstName}</Text>
              <TouchableOpacity style={s.bellBtn} onPress={onGoToMessages}>
                <Bell size={20} color={colors.ink700} strokeWidth={2} />
                {(dashboard?.unread_messages ?? 0) > 0 && (
                  <View style={s.bellBadge}>
                    <Text style={s.bellBadgeText}>{dashboard?.unread_messages}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={s.headerStats}>
              <View style={s.headerStatPill}>
                <MapPin size={12} color={colors.ink400} strokeWidth={2} />
                <Text style={s.headerStatText}>{jobs.length} nearby jobs</Text>
              </View>
              <View style={s.headerStatPill}>
                <Text style={s.headerStatDot}>•</Text>
                <Text style={s.headerStatText}>{dashboard?.unread_messages ?? 0} unread</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Notifications (dismissable) ── */}
        {visibleNotifications.map(n => (
          <View key={n.id} style={s.notifCard}>
            <View style={s.notifLeft}>
              <Bell size={14} color={colors.terracotta600} strokeWidth={2} />
              <View style={s.notifText}>
                <Text style={s.notifTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={s.notifBody} numberOfLines={2}>{n.body}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => dismissNotification(n.id)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <X size={16} color={colors.ink300} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Top job hero */}
        {jobs[0] ? (
          <TouchableOpacity onPress={onGoToJobs} style={s.heroCard}>
            <View style={s.heroTop}>
              <View style={s.heroChips}>
                <View style={[s.categoryDot, {backgroundColor: categoryColor(jobs[0].category)}]} />
                <Text style={s.heroChipText}>Top match</Text>
              </View>
              <Chip label="Open now" tone="sage" style={{height: 20}} />
            </View>
            <View style={s.heroBody}>
              <Text style={s.heroTitle} numberOfLines={2}>{cleanJobTitle(jobs[0].title)}</Text>
              <View style={s.heroMetaRow}>
                <View style={s.heroMetaPill}>
                  <Text style={s.heroMetaText}>{jobs[0].neighborhood}</Text>
                </View>
                {jobs[0].is_group && (
                  <View style={[s.heroMetaPill, s.heroMetaPillAccent]}>
                    <Text style={[s.heroMetaText, s.heroMetaTextAccent]}>{neighbourLabel(jobs[0].member_count)}</Text>
                  </View>
                )}
                <View style={s.heroMetaPill}>
                  <Text style={s.heroMetaText}>{jobs[0].bid_count} bid{jobs[0].bid_count !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              {jobs[0].distance_mi ? (
                <Text style={s.heroSub}>{jobs[0].distance_mi} mi away</Text>
              ) : null}
            </View>
            <View style={s.heroFooter}>
              <View style={s.heroValueCard}>
                <Text style={s.heroEyebrow}>BID RANGE</Text>
                <Text style={s.heroBudget}>
                  ${Math.round(jobs[0].budget_min / 100).toLocaleString()}–${Math.round(jobs[0].budget_max / 100).toLocaleString()}
                </Text>
                <Text style={s.heroRevenue}>
                  Est. ${Math.round(((jobs[0].budget_min + jobs[0].budget_max) / 2) / 100).toLocaleString()} revenue
                </Text>
              </View>
              <TouchableOpacity onPress={onGoToJobs} style={s.heroDraftBtn} activeOpacity={0.85}>
                <Zap size={14} color="#fff" strokeWidth={2.5} />
                <Text style={s.heroDraftText}>Draft bid</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={s.emptyHeroCard}>
            <Text style={s.emptyHeroText}>No group jobs in your feed yet.</Text>
            <Text style={s.emptyHeroSub}>Complete your profile to start receiving nearby group requests.</Text>
          </View>
        )}

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, s.statCardWide]}>
            <Text style={s.statEyebrow}>REVENUE · LAST 30 DAYS</Text>
            <Text style={[s.statBig, {color: colors.terracotta600}]}>${totalRevenue.toLocaleString()}</Text>
            <Chip label="+18% vs last mo" tone="sage" style={{height: 20, marginTop: 4, marginBottom: 8}} />
            <RevenueChart color={colors.terracotta500} />
            <View style={s.statMiniRow}>
              <View style={s.statMini}>
                <Text style={s.statMiniVal}>${Math.round((dashboard?.revenue_total_cents ?? 0) / 100).toLocaleString()}</Text>
                <Text style={s.statMiniLabel}>Total earned</Text>
              </View>
              <View style={s.statMini}>
                <Text style={[s.statMiniVal, {color: colors.terracotta600}]}>
                  {dashboard?.win_rate_pct ? `${dashboard.win_rate_pct}%` : '—'}
                </Text>
                <Text style={s.statMiniLabel}>Win rate</Text>
              </View>
              <View style={[s.statMini, {borderRightWidth: 0}]}>
                <Text style={s.statMiniVal}>{dashboard?.active_bids ?? 0}</Text>
                <Text style={s.statMiniLabel}>Active bids</Text>
              </View>
            </View>
          </View>

          <View style={s.statsCol}>
            <View style={[s.statCard, {flex: 1, backgroundColor: colors.sage50, borderColor: colors.sage100}]}>
              <Briefcase size={16} color={colors.sage700} strokeWidth={2} />
              <Text style={[s.statBig, {color: colors.sage700, fontSize: 28, marginTop: 6}]}>
                {dashboard?.jobs_completed ?? 0}
              </Text>
              <Text style={s.statEyebrow}>JOBS DONE</Text>
            </View>
            <View style={[s.statCard, {flex: 1, backgroundColor: colors.gold50, borderColor: colors.gold100}]}>
              <Star size={16} color={colors.gold600} strokeWidth={2} />
              <Text style={[s.statBig, {color: colors.gold600, fontSize: 28, marginTop: 6}]}>
                {dashboard?.avg_rating ? dashboard.avg_rating.toFixed(1) : '—'}
              </Text>
              <Text style={s.statEyebrow}>AVG RATING</Text>
            </View>
          </View>
        </View>

        <View style={s.quickRow}>
          <TouchableOpacity onPress={onGoToBids} style={s.quickCard} activeOpacity={0.85}>
            <View style={[s.quickIcon, {backgroundColor: colors.terracotta50}]}>
              <ClipboardList size={16} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>My bids</Text>
            <Text style={s.quickSub}>Review live and won offers.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoToMessages} style={s.quickCard} activeOpacity={0.85}>
            <View style={[s.quickIcon, {backgroundColor: colors.sage50}]}>
              <MessageCircle size={16} color={colors.sage700} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Messages</Text>
            <Text style={s.quickSub}>Open homeowner group chats.</Text>
          </TouchableOpacity>
        </View>

        <View style={s.quickRow}>
          <TouchableOpacity onPress={onGoToCalendar} style={s.quickCard} activeOpacity={0.85}>
            <View style={[s.quickIcon, {backgroundColor: colors.sky50}]}>
              <CalendarDays size={16} color={colors.sky600} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Calendar</Text>
            <Text style={s.quickSub}>See blocked holds and booked days.</Text>
          </TouchableOpacity>
          <View style={s.quickCardGhost} />
        </View>

        {forecast && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>AI market outlook</Text>
              <Chip label={forecast.forecast_period} tone="neutral" style={{height: 20}} />
            </View>
            <View style={s.forecastCard}>
              <View style={s.forecastHero}>
                <View style={s.forecastTop}>
                  <View style={s.forecastTopLeft}>
                    <View style={s.forecastIcon}>
                      <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
                    </View>
                    <Text style={s.forecastEyebrow}>Best opening this month</Text>
                  </View>
                  {shortageCount > 0 ? (
                    <View style={s.forecastBadge}>
                      <TrendingUp size={12} color={colors.terracotta600} strokeWidth={2.2} />
                      <Text style={s.forecastBadgeText}>{shortageCount} shortage{shortageCount === 1 ? '' : 's'}</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                </View>
                <View style={s.forecastIntroCard}>
                  <Text style={s.forecastLead}>
                    {topForecast ? `${titleCase(topForecast.category)} demand is rising` : 'Demand is rising nearby'}
                  </Text>
                  <Text style={s.forecastSub}>{forecast.neighborhood}</Text>
                </View>
                <View style={s.forecastBanner}>
                  <Text style={s.forecastBannerTitle}>
                    {topForecast ? `${topForecast.predicted_requests} expected ${topForecast.category} jobs` : 'AI demand summary'}
                  </Text>
                  <Text style={s.forecastBannerSub} numberOfLines={2}>
                    {topForecast?.provider_shortage
                      ? topForecast.shortage_note || topForecast.reasoning
                      : forecast.top_opportunity}
                  </Text>
                </View>
              </View>
              <View style={s.forecastGrid}>
                {forecast.predictions.slice(0, 3).map(prediction => (
                  <View key={prediction.category} style={s.forecastPill}>
                    <View style={s.forecastPillTop}>
                      <Text style={s.forecastCategory}>{titleCase(prediction.category)}</Text>
                      {prediction.provider_shortage && <TrendingUp size={12} color={colors.terracotta600} strokeWidth={2.2} />}
                    </View>
                    <Text style={s.forecastCount}>{prediction.predicted_requests} jobs</Text>
                    <Text style={s.forecastMeta}>
                      {prediction.confidence} confidence
                    </Text>
                    <Text style={s.forecastReason} numberOfLines={2}>
                      {prediction.provider_shortage ? 'Low provider supply nearby' : prediction.reasoning}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Smart job feed mini */}
        {jobs.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Smart job feed</Text>
              <TouchableOpacity onPress={onGoToJobs} style={s.seeAllBtn}>
                <Text style={s.seeAllText}>See all {jobs.length} →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.jobList}>
              {jobs.slice(0, 3).map((job, i) => (
                <TouchableOpacity
                  key={job.id}
                  onPress={onGoToJobs}
                  style={[s.jobRow, i > 0 && {borderTopWidth: 1, borderTopColor: colors.border}]}>
                  <View style={[s.jobAvatar, {backgroundColor: categoryColor(job.category)}]}>
                    <Text style={s.jobAvatarText}>{job.category.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.jobInfo}>
                    <Text style={s.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={s.jobMeta}>
                      {job.neighborhood}{job.distance_mi ? ` · ${job.distance_mi} mi` : ''} · {job.bid_count} bid{job.bid_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={s.jobRight}>
                    <Text style={s.jobBudget}>${Math.round(job.budget_min / 100)}–${Math.round(job.budget_max / 100)}</Text>
                    {job.is_group && <Chip label={neighbourLabel(job.member_count)} tone="sage" style={{height: 18}} />}
                  </View>
                  <ChevronRight size={14} color={colors.ink300} strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Schedule */}
        {groupedSchedule.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Upcoming schedule</Text>
              <TouchableOpacity onPress={onGoToCalendar} style={s.seeAllBtn}>
                <Text style={s.seeAllText}>Open calendar →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.schedCard}>
              {groupedSchedule.map((item, i) => (
                <View key={item.key} style={[s.schedRow, i > 0 && {borderTopWidth: 1, borderTopColor: colors.border}]}>
                  <View style={s.schedTime}>
                    <Text style={s.schedTimeText}>{formatScheduleDates(item.dates)}</Text>
                    <Text style={s.schedDur}>{formatScheduleDuration(item.totalMinutes)}</Text>
                  </View>
                  <View style={[s.schedBar, {backgroundColor: item.status === 'blocked' ? colors.gold500 : colors.terracotta500}]} />
                  <View style={s.schedInfo}>
                    <Text style={s.schedTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.schedAddr}>{item.address ?? 'Address TBC'}</Text>
                  </View>
                  <Chip label={item.status} tone={item.status === 'blocked' ? 'gold' : 'terracotta'} style={{height: 20}} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadTxt: {color: colors.ink400, fontSize: 14},
  header: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16},
  headerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadow.sm,
  },
  brandHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  headerTopRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10},
  brandMarkWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMark: {width: 24, height: 24},
  brandPillSoft: {
    height: 26,
    marginLeft: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {fontSize: 18, fontWeight: '800', color: colors.terracotta600, letterSpacing: -0.3},
  brandSoftText: {fontSize: 11, fontWeight: '700', color: colors.ink500},
  greeting: {flex: 1, fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.7, lineHeight: 32},
  headerStats: {flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12},
  headerStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
  },
  headerStatText: {fontSize: 12, fontWeight: '600', color: colors.ink500},
  headerStatDot: {fontSize: 12, fontWeight: '700', color: colors.terracotta600, marginTop: -1},
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.terracotta600,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {fontSize: 10, fontWeight: '700', color: '#fff'},

  // Notifications
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.terracotta50,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  notifLeft: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1},
  notifText: {flex: 1},
  notifTitle: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},
  notifBody: {fontSize: 12, color: colors.ink700, marginTop: 1, lineHeight: 16},

  // Hero
  heroCard: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 22,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, ...shadow.md,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, paddingBottom: 12,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  heroChips: {flexDirection: 'row', alignItems: 'center', gap: 6},
  categoryDot: {width: 8, height: 8, borderRadius: 4},
  heroChipText: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},
  heroDot: {color: colors.ink300},
  groupChipText: {fontSize: 12, fontWeight: '700', color: colors.sage700},
  heroBody: {paddingHorizontal: 18, paddingTop: 12},
  heroTitle: {fontSize: 20, fontWeight: '700', color: colors.ink900, letterSpacing: -0.4, lineHeight: 24},
  heroMetaRow: {flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap'},
  heroMetaPill: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaPillAccent: {
    backgroundColor: colors.sage50,
    borderColor: colors.sage100,
  },
  heroMetaText: {fontSize: 12, color: colors.ink500, fontWeight: '600'},
  heroMetaTextAccent: {color: colors.sage700},
  heroSub: {fontSize: 12, color: colors.ink400, marginTop: 8},
  heroFooter: {
    flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between',
    padding: 18, paddingTop: 14, gap: 12,
  },
  heroValueCard: {
    flex: 1,
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8},
  heroBudget: {fontSize: 26, fontWeight: '700', color: colors.terracotta600, letterSpacing: -0.6},
  heroRevenue: {fontSize: 12, color: colors.sage600, fontWeight: '600', marginTop: 2},
  heroDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.terracotta600,
    paddingHorizontal: 16,
    height: 52,
    minWidth: 118,
    borderRadius: 18,
  },
  heroDraftText: {color: '#fff', fontSize: 13, fontWeight: '700'},
  emptyHeroCard: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center',
    backgroundColor: colors.bgCard, ...shadow.sm,
  },
  emptyHeroText: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginBottom: 6},
  emptyHeroSub: {fontSize: 13, color: colors.ink400, textAlign: 'center', lineHeight: 18},

  // Stats
  statsRow: {flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16},
  statCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow.sm,
  },
  statCardWide: {flex: 1.6},
  statsCol: {flex: 1, gap: 10},
  statEyebrow: {fontSize: 9, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8, marginBottom: 2},
  statBig: {fontSize: 32, fontWeight: '700', color: colors.ink900, letterSpacing: -0.8, lineHeight: 36},
  statMiniRow: {flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10},
  statMini: {flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingRight: 8},
  statMiniVal: {fontSize: 16, fontWeight: '700', color: colors.ink900},
  statMiniLabel: {fontSize: 10, color: colors.ink400, marginTop: 2},
  quickRow: {flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16},
  quickCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.sm,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  quickSub: {fontSize: 12, color: colors.ink400, marginTop: 4, lineHeight: 17},
  quickCardGhost: {flex: 1, opacity: 0},

  // Section
  section: {marginHorizontal: 16, marginBottom: 16},
  sectionRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900},
  seeAllBtn: {},
  seeAllText: {fontSize: 13, fontWeight: '600', color: colors.terracotta600},
  forecastCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    ...shadow.sm,
  },
  forecastHero: {
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  forecastTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  forecastTopLeft: {flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1},
  forecastIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.terracotta50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastIntroCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  forecastEyebrow: {fontSize: 10, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.8, textTransform: 'uppercase'},
  forecastLead: {fontSize: 20, fontWeight: '700', color: colors.ink900, lineHeight: 25, letterSpacing: -0.4, marginTop: 4},
  forecastSub: {fontSize: 13, color: colors.ink400, marginTop: 6},
  forecastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.terracotta50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forecastBadgeText: {fontSize: 11, fontWeight: '700', color: colors.terracotta600},
  forecastBanner: {
    marginTop: 12,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forecastBannerTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900, lineHeight: 24},
  forecastBannerSub: {fontSize: 12, color: colors.ink500, marginTop: 5, lineHeight: 18},
  forecastGrid: {flexDirection: 'row', gap: 8, marginTop: 10},
  forecastPill: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 128,
  },
  forecastPillTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6},
  forecastCategory: {fontSize: 12, fontWeight: '700', color: colors.ink700, textTransform: 'capitalize'},
  forecastCount: {fontSize: 26, fontWeight: '700', color: colors.terracotta600, marginTop: 8, letterSpacing: -0.5},
  forecastMeta: {fontSize: 10, fontWeight: '700', color: colors.ink300, marginTop: 3, textTransform: 'uppercase'},
  forecastReason: {fontSize: 11, color: colors.ink500, lineHeight: 16, marginTop: 6},

  // Jobs
  jobList: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.sm,
  },
  jobRow: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14},
  jobAvatar: {width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  jobAvatarText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  jobInfo: {flex: 1},
  jobTitle: {fontSize: 14, fontWeight: '600', color: colors.ink900},
  jobMeta: {fontSize: 12, color: colors.ink400, marginTop: 2},
  jobRight: {alignItems: 'flex-end', gap: 4},
  jobBudget: {fontSize: 13, fontWeight: '600', color: colors.ink700},

  // Schedule
  schedCard: {
    backgroundColor: colors.cream50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.sm,
  },
  schedRow: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14},
  schedTime: {width: 58},
  schedTimeText: {fontSize: 13, fontWeight: '700', color: colors.ink900},
  schedDur: {fontSize: 11, color: colors.ink400, marginTop: 2},
  schedBar: {width: 4, height: 36, borderRadius: 2},
  schedInfo: {flex: 1},
  schedTitle: {fontSize: 14, fontWeight: '600', color: colors.ink900},
  schedAddr: {fontSize: 12, color: colors.ink400, marginTop: 2},
});
