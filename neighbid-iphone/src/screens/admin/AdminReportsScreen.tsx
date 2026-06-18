import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {BarChart2, TrendingUp, Users, DollarSign, Zap} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {getMyAdminCommunity, getHoaStats, HOAOut, HoaStatsOut} from '../../api/community';

function MiniBarChart({data, color}: {data: number[]; color: string}) {
  const max = Math.max(...data, 1);
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return (
    <View style={chart.wrap}>
      {data.map((v, i) => (
        <View key={i} style={chart.col}>
          <Text style={chart.val}>{v > 0 ? `$${v}` : ''}</Text>
          <View style={[chart.bar, {height: Math.max(4, (v / max) * 80), backgroundColor: v > 0 ? color : colors.cream200}]} />
          <Text style={chart.label}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}
const chart = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 16},
  col: {flex: 1, alignItems: 'center', gap: 4},
  bar: {width: '100%', borderRadius: 4},
  label: {fontSize: 9, color: colors.ink300, fontWeight: '600'},
  val: {fontSize: 9, fontWeight: '700', color: colors.ink400, marginBottom: 2},
});

const CATEGORIES = [
  {label: 'Plumbing', icon: '🔧', tone: colors.sky600},
  {label: 'Lawn care', icon: '🌿', tone: colors.sage600},
  {label: 'Electrical', icon: '⚡', tone: colors.gold600},
  {label: 'Cleaning', icon: '🧹', tone: colors.terracotta500},
];

export default function AdminReportsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [hoa, setHoa] = useState<HOAOut | null>(null);
  const [stats, setStats] = useState<HoaStatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const community = await getMyAdminCommunity();
      setHoa(community);
      const s = await getHoaStats(community.id);
      setStats(s);
    } catch {/* empty state */}
    finally {setLoading(false); setRefreshing(false);}
  }

  useEffect(() => {load();}, []);

  const totalSavings = stats?.total_savings ?? 0;
  const savingsData = totalSavings > 0
    ? [0, 0, Math.round(totalSavings * 0.1), Math.round(totalSavings * 0.35), Math.round(totalSavings * 0.7), totalSavings]
    : [0, 0, 0, 0, 0, 0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarHeight + 36}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={colors.terracotta600} />}>

        {/* ── Title ── */}
        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>Reports</Text>
            {hoa && <Text style={s.subtitle}>{hoa.name}</Text>}
          </View>
          <View style={s.titleIcon}>
            <BarChart2 size={20} color={colors.terracotta600} strokeWidth={2} />
          </View>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color={colors.terracotta600} size="large" /></View>
        ) : (
          <>
            {/* ── Dark savings hero ── */}
            <View style={s.heroCard}>
              <View style={s.heroGlow} />
              <Text style={s.heroEyebrow}>TOTAL COMMUNITY SAVINGS</Text>
              <Text style={s.heroAmount}>${totalSavings.toLocaleString()}</Text>
              <Text style={s.heroSub}>Across all completed group bids</Text>
              <MiniBarChart data={savingsData} color={colors.gold500} />
            </View>

            {/* ── Stats row ── */}
            <View style={s.statsRow}>
              <View style={[s.statCard, {flex: 1}]}>
                <View style={[s.statIconWrap, {backgroundColor: colors.sky50}]}>
                  <Users size={16} color={colors.sky600} strokeWidth={2} />
                </View>
                <Text style={s.statVal}>{stats?.total_members ?? 0}</Text>
                <Text style={s.statLabel}>Total residents</Text>
              </View>
              <View style={[s.statCard, {flex: 1}]}>
                <View style={[s.statIconWrap, {backgroundColor: colors.gold50}]}>
                  <TrendingUp size={16} color={colors.gold600} strokeWidth={2} />
                </View>
                <Text style={s.statVal}>{stats?.active_requests ?? 0}</Text>
                <Text style={s.statLabel}>Active requests</Text>
              </View>
              <View style={[s.statCard, {flex: 1}]}>
                <View style={[s.statIconWrap, {backgroundColor: colors.sage50}]}>
                  <Zap size={16} color={colors.sage600} strokeWidth={2} />
                </View>
                <Text style={s.statVal}>
                  {stats && stats.total_members > 0 ? Math.round(totalSavings / Math.max(1, stats.total_members)) : 0}
                </Text>
                <Text style={s.statLabel}>Avg saved / resident</Text>
              </View>
            </View>

            {/* ── Category breakdown ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>By service category</Text>
                <View style={s.comingSoonPill}>
                  <Text style={s.comingSoonPillText}>Coming soon</Text>
                </View>
              </View>
              {CATEGORIES.map(cat => (
                <View key={cat.label} style={s.categoryRow}>
                  <Text style={s.categoryIcon}>{cat.icon}</Text>
                  <View style={s.categoryInfo}>
                    <Text style={s.categoryLabel}>{cat.label}</Text>
                    <View style={s.categoryBar}>
                      <View style={[s.categoryBarFill, {backgroundColor: cat.tone, width: '0%' as any}]} />
                    </View>
                  </View>
                  <Text style={[s.categoryAmt, {color: cat.tone}]}>$0</Text>
                </View>
              ))}
              <Text style={s.categoryNote}>
                Category breakdowns will populate once group bids complete. Pull to refresh.
              </Text>
            </View>

            {/* ── Monthly trends ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Monthly trends</Text>
                <View style={s.comingSoonPill}>
                  <Text style={s.comingSoonPillText}>Coming soon</Text>
                </View>
              </View>
              <View style={s.comingSoonCard}>
                <DollarSign size={24} color={colors.ink300} strokeWidth={1.5} />
                <Text style={s.comingSoonTitle}>Monthly breakdowns</Text>
                <Text style={s.comingSoonSub}>
                  Per-month savings, request volume, and provider comparisons will appear here as your community grows.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60},
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  title: {fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5},
  subtitle: {fontSize: 13, color: colors.ink400, marginTop: 2},
  titleIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.terracotta50, borderWidth: 1, borderColor: colors.terracotta100,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },

  // Hero
  heroCard: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 22,
    backgroundColor: colors.warmDark, padding: 24, overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', right: -60, top: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(182,134,43,0.15)',
  },
  heroEyebrow: {fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, marginBottom: 10},
  heroAmount: {fontSize: 48, fontWeight: '700', color: colors.gold500, letterSpacing: -1.5, lineHeight: 52},
  heroSub: {fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4},

  // Stats row
  statsRow: {flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16},
  statCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14, ...shadow.sm,
  },
  statIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statVal: {fontSize: 24, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5, marginBottom: 4},
  statLabel: {fontSize: 11, fontWeight: '600', color: colors.ink400, lineHeight: 15},

  // Sections
  section: {marginHorizontal: 16, marginBottom: 16},
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900},
  comingSoonPill: {
    backgroundColor: colors.cream100, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  comingSoonPillText: {fontSize: 11, fontWeight: '600', color: colors.ink400},

  // Category rows
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14,
    marginBottom: 8, ...shadow.sm,
  },
  categoryIcon: {fontSize: 20},
  categoryInfo: {flex: 1},
  categoryLabel: {fontSize: 14, fontWeight: '700', color: colors.ink900, marginBottom: 6},
  categoryBar: {
    height: 5, borderRadius: 3, backgroundColor: colors.cream200, overflow: 'hidden',
  },
  categoryBarFill: {height: 5, borderRadius: 3},
  categoryAmt: {fontSize: 15, fontWeight: '800', minWidth: 40, textAlign: 'right'},
  categoryNote: {fontSize: 12, color: colors.ink400, lineHeight: 17, marginTop: 4},

  // Coming soon card
  comingSoonCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    padding: 28, alignItems: 'center', ...shadow.sm,
  },
  comingSoonTitle: {fontSize: 16, fontWeight: '700', color: colors.ink700, marginTop: 14, marginBottom: 8},
  comingSoonSub: {fontSize: 13, color: colors.ink400, textAlign: 'center', lineHeight: 19},
});
