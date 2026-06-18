import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Clipboard, Image, RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {
  Bell, Users, UserPlus, BarChart2, Copy, ChevronRight,
  Building2, TrendingUp, Key,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {useAuth} from '../../hooks/useAuth';
import {getMyAdminCommunity, getHoaStats, HOAOut, HoaStatsOut} from '../../api/community';

const brandMark = require('../../assets/bidbundle-mark.png');

function MiniBarChart({data, color}: {data: number[]; color: string}) {
  const max = Math.max(...data, 1);
  const labels = ['J', 'F', 'M', 'A', 'M', 'J'];
  return (
    <View style={chart.wrap}>
      {data.map((v, i) => (
        <View key={i} style={chart.col}>
          <View style={[chart.bar, {height: Math.max(4, (v / max) * 48), backgroundColor: v > 0 ? color : colors.cream200}]} />
          <Text style={chart.label}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}
const chart = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 62},
  col: {flex: 1, alignItems: 'center', gap: 4},
  bar: {width: '100%', borderRadius: 3},
  label: {fontSize: 9, color: colors.ink300, fontWeight: '600'},
});

export default function AdminDashboardScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const [hoa, setHoa] = useState<HOAOut | null>(null);
  const [stats, setStats] = useState<HoaStatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const community = await getMyAdminCommunity();
      setHoa(community);
      const s = await getHoaStats(community.id);
      setStats(s);
    } catch {
      // silently ignore — empty state handles it
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);

  const onRefresh = () => {setRefreshing(true); load();};

  function copyCode() {
    const code = hoa?.master_invite_code ?? stats?.master_invite_code;
    if (code) {
      Clipboard.setString(code);
      Alert.alert('Copied', 'Invite code copied to clipboard');
    }
  }

  const communityTypeLabel = hoa?.type
    ? hoa.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Community';

  const totalSavings = stats?.total_savings ?? 0;
  const savingsData = [0, 0, totalSavings > 0 ? Math.round(totalSavings * 0.2) : 0, totalSavings > 0 ? Math.round(totalSavings * 0.5) : 0, totalSavings > 0 ? Math.round(totalSavings * 0.8) : 0, totalSavings];
  const inviteCode = hoa?.master_invite_code ?? stats?.master_invite_code;

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.centered}><ActivityIndicator color={colors.terracotta600} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarHeight + 36}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}>

        {/* ── Header card ── */}
        <View style={s.headerWrap}>
          <View style={s.headerCard}>
            <View style={s.brandRow}>
              <View style={s.brandMarkWrap}>
                <Image source={brandMark} style={s.brandMark} resizeMode="contain" />
              </View>
              <Text style={s.brand}>BidBundle</Text>
              <View style={s.rolePill}><Text style={s.rolePillText}>HOA Manager</Text></View>
            </View>
            <View style={s.greetingRow}>
              <Text style={s.greeting} numberOfLines={1}>
                {hoa?.name ?? user?.full_name?.split(' ')[0] ?? 'Your Community'}
              </Text>
              <TouchableOpacity style={s.bellBtn}>
                <Bell size={20} color={colors.ink700} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={s.statPills}>
              <View style={s.statPill}>
                <Users size={11} color={colors.ink400} strokeWidth={2} />
                <Text style={s.statPillText}>{stats?.total_members ?? 0} residents</Text>
              </View>
              <View style={s.statPill}>
                <Building2 size={11} color={colors.ink400} strokeWidth={2} />
                <Text style={s.statPillText}>{communityTypeLabel}</Text>
              </View>
              <View style={s.statPill}>
                <TrendingUp size={11} color={colors.ink400} strokeWidth={2} />
                <Text style={s.statPillText}>{stats?.active_requests ?? 0} active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Savings hero card ── */}
        <View style={s.heroCard}>
          <View style={s.heroGlow} />
          <View style={s.heroTop}>
            <Text style={s.heroEyebrow}>COMMUNITY SAVINGS</Text>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{communityTypeLabel}</Text>
            </View>
          </View>
          <Text style={s.heroSavings}>${totalSavings.toLocaleString()}</Text>
          <Text style={s.heroSub}>Total saved across all group bids</Text>
          <View style={s.heroFooter}>
            <View style={s.heroStatRow}>
              <Text style={s.heroStatVal}>{stats?.active_requests ?? 0}</Text>
              <Text style={s.heroStatLabel}> active requests</Text>
            </View>
            <TouchableOpacity style={s.heroBtn} onPress={() => navigation.navigate('Reports')}>
              <Text style={s.heroBtnText}>View reports</Text>
              <ChevronRight size={14} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, {flex: 1.4}]}>
            <Text style={s.statEyebrow}>RESIDENTS</Text>
            <Text style={[s.statBig, {color: colors.terracotta600}]}>{stats?.total_members ?? 0}</Text>
            <View style={s.statSubRow}>
              <Users size={11} color={colors.ink400} strokeWidth={2} />
              <Text style={s.statSub}>joined your community</Text>
            </View>
            <MiniBarChart data={savingsData} color={colors.terracotta500} />
          </View>
          <View style={s.statsRight}>
            <View style={[s.statCard, s.statCardSm]}>
              <Text style={s.statEyebrow}>ACTIVE REQUESTS</Text>
              <Text style={s.statBig}>{stats?.active_requests ?? 0}</Text>
              <View style={s.statSubRow}>
                <TrendingUp size={11} color={colors.sage600} strokeWidth={2} />
                <Text style={[s.statSub, {color: colors.sage600}]}>in progress</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.statCard, s.statCardSm, s.inviteCodeCard]} onPress={copyCode} activeOpacity={0.7}>
              <Text style={s.statEyebrow}>INVITE CODE</Text>
              <Text style={[s.statBig, {color: colors.terracotta600, fontSize: 18, letterSpacing: 1}]} numberOfLines={1}>
                {inviteCode ?? '—'}
              </Text>
              <View style={s.statSubRow}>
                <Copy size={11} color={colors.terracotta600} strokeWidth={2} />
                <Text style={[s.statSub, {color: colors.terracotta600}]}>tap to copy</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Residents')}>
            <View style={[s.quickIcon, {backgroundColor: colors.terracotta50}]}>
              <UserPlus size={16} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Invite resident</Text>
            <Text style={s.quickSub}>Send a personal invite to a new resident.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Residents')}>
            <View style={[s.quickIcon, {backgroundColor: colors.sky50}]}>
              <Users size={16} color={colors.sky600} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Residents</Text>
            <Text style={s.quickSub}>View and manage all community members.</Text>
          </TouchableOpacity>
        </View>
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Reports')}>
            <View style={[s.quickIcon, {backgroundColor: colors.gold50}]}>
              <BarChart2 size={16} color={colors.gold600} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Reports</Text>
            <Text style={s.quickSub}>Track savings, activity and trends.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={copyCode}>
            <View style={[s.quickIcon, {backgroundColor: colors.sage50}]}>
              <Key size={16} color={colors.sage700} strokeWidth={2} />
            </View>
            <Text style={s.quickTitle}>Share code</Text>
            <Text style={s.quickSub}>Copy the master invite code for residents.</Text>
          </TouchableOpacity>
        </View>

        {/* ── Community info ── */}
        {hoa && (
          <View style={s.communitySection}>
            <Text style={s.sectionTitle}>Community details</Text>
            <View style={s.communityCard}>
              {[
                {label: 'Address', value: hoa.neighborhood},
                {label: 'Type', value: communityTypeLabel},
                ...(hoa.unit_count ? [{label: 'Units', value: hoa.unit_count.toString()}] : []),
              ].map((row, i, arr) => (
                <View key={row.label} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={s.infoValue} numberOfLines={1}>{row.value}</Text>
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

  // Header
  headerWrap: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16},
  headerCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 14, ...shadow.sm,
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
  brandMarkWrap: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  brandMark: {width: 22, height: 22},
  brand: {fontSize: 15, fontWeight: '800', color: colors.terracotta600, letterSpacing: -0.2},
  rolePill: {
    height: 24, marginLeft: 6, paddingHorizontal: 10,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.cream100, justifyContent: 'center',
  },
  rolePillText: {fontSize: 11, fontWeight: '700', color: colors.ink500},
  greetingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  greeting: {flex: 1, fontSize: 24, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  statPills: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12},
  statPill: {
    height: 26, paddingHorizontal: 10, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream50,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  statPillText: {fontSize: 12, color: colors.ink500, fontWeight: '600'},

  // Hero card
  heroCard: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 22,
    backgroundColor: colors.bgCard, padding: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  heroGlow: {
    position: 'absolute', right: -40, top: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(194,85,43,0.07)',
  },
  heroTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14},
  heroEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 1.2},
  heroBadge: {
    paddingHorizontal: 10, height: 26, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  heroBadgeText: {fontSize: 11, color: colors.ink500, fontWeight: '600'},
  heroSavings: {fontSize: 44, fontWeight: '700', color: colors.terracotta600, letterSpacing: -1, lineHeight: 48},
  heroSub: {fontSize: 13, color: colors.ink400, marginTop: 4, marginBottom: 18},
  heroFooter: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  heroStatRow: {flexDirection: 'row', alignItems: 'baseline'},
  heroStatVal: {fontSize: 22, fontWeight: '700', color: colors.ink900},
  heroStatLabel: {fontSize: 13, color: colors.ink400},
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.terracotta600,
    paddingHorizontal: 16, height: 40, borderRadius: radius.pill,
  },
  heroBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},

  // Stats
  statsRow: {flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16},
  statCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow.sm,
  },
  statsRight: {gap: 10, flex: 1},
  statCardSm: {flex: 1, padding: 14},
  inviteCodeCard: {borderColor: colors.terracotta100, backgroundColor: colors.terracotta50},
  statEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8, marginBottom: 6},
  statBig: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6, lineHeight: 32},
  statSubRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  statSub: {fontSize: 11, color: colors.ink400},

  // Quick actions
  quickRow: {flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 10},
  quickCard: {
    flex: 1, backgroundColor: colors.bgCard, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.lg, padding: 14, ...shadow.sm,
  },
  quickIcon: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  quickTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  quickSub: {fontSize: 12, color: colors.ink400, marginTop: 4, lineHeight: 17},

  // Community info
  communitySection: {marginHorizontal: 16, marginTop: 6},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900, marginBottom: 10},
  communityCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.sm,
  },
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14},
  infoRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  infoLabel: {fontSize: 13, fontWeight: '600', color: colors.ink500},
  infoValue: {fontSize: 13, fontWeight: '700', color: colors.ink900, maxWidth: '55%', textAlign: 'right'},
});
