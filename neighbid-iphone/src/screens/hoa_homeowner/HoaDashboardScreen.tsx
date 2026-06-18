import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image, Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {
  Bell, MapPin, ClipboardList, MessageCircle, Plus,
  Building2, Shield, Clock, XCircle, AlertCircle,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {useAuth} from '../../hooks/useAuth';
import {
  getMyHoaCommunity, getMyMembershipStatus,
  HOAOut, MyStatusOut,
} from '../../api/community';
import NewRequestScreen from '../homeowner/NewRequestScreen';

const brandMark = require('../../assets/bidbundle-mark.png');

export default function HoaDashboardScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const [community, setCommunity] = useState<HOAOut | null>(null);
  const [memberStatus, setMemberStatus] = useState<MyStatusOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);

  const load = useCallback(async () => {
    try {
      const status = await getMyMembershipStatus();
      setMemberStatus(status);
      if (status.status === 'approved') {
        const c = await getMyHoaCommunity();
        setCommunity(c);
      }
    } catch {/* empty state */}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useEffect(() => {load();}, [load]);

  const onRefresh = () => {setRefreshing(true); load();};

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const communityTypeLabel = community?.type
    ? community.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'HOA Community';

  const isApproved = memberStatus?.status === 'approved';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Modal
        visible={showNewRequest}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewRequest(false)}>
        <NewRequestScreen
          onDone={() => {setShowNewRequest(false); load();}}
          onBack={() => setShowNewRequest(false)}
        />
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarHeight + 36}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}>

        {/* ── Header card (always shown) ── */}
        <View style={s.headerWrap}>
          <View style={s.headerCard}>
            <View style={s.brandRow}>
              <View style={s.brandMarkWrap}>
                <Image source={brandMark} style={s.brandMark} resizeMode="contain" />
              </View>
              <Text style={s.brand}>BidBundle</Text>
              <View style={s.rolePill}><Text style={s.rolePillText}>HOA Resident</Text></View>
            </View>
            <View style={s.greetingRow}>
              <Text style={s.greeting}>Hello, {firstName}</Text>
              <TouchableOpacity style={s.bellBtn}>
                <Bell size={20} color={colors.ink700} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={colors.ink300} style={{marginTop: 12}} />
            ) : (
              <View style={s.statPills}>
                <View style={s.statPill}>
                  <Building2 size={11} color={colors.ink400} strokeWidth={2} />
                  <Text style={s.statPillText} numberOfLines={1}>
                    {memberStatus?.hoa_name ?? 'No community'}
                  </Text>
                </View>
                {user?.unit_number ? (
                  <View style={s.statPill}>
                    <MapPin size={11} color={colors.ink400} strokeWidth={2} />
                    <Text style={s.statPillText}>Unit {user.unit_number}</Text>
                  </View>
                ) : null}
                <MemberStatusPill status={memberStatus?.status} />
              </View>
            )}
          </View>
        </View>

        {loading ? null : memberStatus?.status === 'pending' ? (
          <PendingCard hoaName={memberStatus.hoa_name} onRefresh={onRefresh} />
        ) : memberStatus?.status === 'declined' ? (
          <DeclinedCard hoaName={memberStatus.hoa_name} />
        ) : memberStatus?.status === 'revoked' ? (
          <RevokedCard hoaName={memberStatus.hoa_name} />
        ) : isApproved ? (
          <>
            {/* ── Community hero card ── */}
            {community ? (
              <View style={s.communityCard}>
                <View style={s.communityGlow} />
                <View style={s.communityTop}>
                  <View style={s.communityTypeBadge}>
                    <Text style={s.communityTypeBadgeText}>{communityTypeLabel}</Text>
                  </View>
                  {user?.unit_number ? (
                    <View style={s.unitBadge}>
                      <Text style={s.unitBadgeText}>Unit {user.unit_number}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.communityName}>{community.name}</Text>
                <Text style={s.communityAddress}>{community.neighborhood}</Text>
                <Text style={s.communityManagedText}>Area verified by your HOA administrator</Text>
              </View>
            ) : null}

            {/* ── Quick actions ── */}
            <View style={s.quickRow}>
              <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => setShowNewRequest(true)}>
                <View style={[s.quickIcon, {backgroundColor: colors.terracotta50}]}>
                  <Plus size={16} color={colors.terracotta600} strokeWidth={2.5} />
                </View>
                <Text style={s.quickTitle}>New request</Text>
                <Text style={s.quickSub}>Post a job and group-bid with neighbours.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Bids')}>
                <View style={[s.quickIcon, {backgroundColor: colors.sky50}]}>
                  <ClipboardList size={16} color={colors.sky600} strokeWidth={2} />
                </View>
                <Text style={s.quickTitle}>My bids</Text>
                <Text style={s.quickSub}>Review quotes from providers.</Text>
              </TouchableOpacity>
            </View>
            <View style={s.quickRow}>
              <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Chat')}>
                <View style={[s.quickIcon, {backgroundColor: colors.sage50}]}>
                  <MessageCircle size={16} color={colors.sage700} strokeWidth={2} />
                </View>
                <Text style={s.quickTitle}>Community chat</Text>
                <Text style={s.quickSub}>Talk to neighbours and providers.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.quickCard} activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
                <View style={[s.quickIcon, {backgroundColor: colors.gold50}]}>
                  <Shield size={16} color={colors.gold600} strokeWidth={2} />
                </View>
                <Text style={s.quickTitle}>My profile</Text>
                <Text style={s.quickSub}>View your community and account details.</Text>
              </TouchableOpacity>
            </View>

            {/* ── Details ── */}
            <View style={s.infoSection}>
              <Text style={s.sectionTitle}>Your details</Text>
              <View style={s.infoCard}>
                {[
                  {label: 'Community', value: community?.name ?? '—'},
                  {label: 'Unit', value: user?.unit_number ?? 'Not assigned'},
                  {label: 'Address', value: community?.neighborhood ?? '—'},
                  {label: 'Type', value: communityTypeLabel},
                ].map((row, i, arr) => (
                  <View key={row.label} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
                    <Text style={s.infoLabel}>{row.label}</Text>
                    <Text style={s.infoValue} numberOfLines={1}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MemberStatusPill({status}: {status?: string}) {
  if (status === 'approved') {
    return (
      <View style={[pill.wrap, pill.approved]}>
        <Shield size={11} color={colors.sage700} strokeWidth={2} />
        <Text style={[pill.text, {color: colors.sage700}]}>HOA verified</Text>
      </View>
    );
  }
  if (status === 'pending') {
    return (
      <View style={[pill.wrap, pill.pending]}>
        <Clock size={11} color={colors.gold600} strokeWidth={2} />
        <Text style={[pill.text, {color: colors.gold600}]}>Pending approval</Text>
      </View>
    );
  }
  if (status === 'declined' || status === 'revoked') {
    return (
      <View style={[pill.wrap, pill.declined]}>
        <XCircle size={11} color="#DC2626" strokeWidth={2} />
        <Text style={[pill.text, {color: '#DC2626'}]}>{status === 'revoked' ? 'Access revoked' : 'Request declined'}</Text>
      </View>
    );
  }
  return null;
}

function PendingCard({hoaName, onRefresh}: {hoaName: string | null; onRefresh: () => void}) {
  return (
    <View style={state.card}>
      <View style={[state.iconWrap, {backgroundColor: colors.gold50, borderColor: colors.gold500 + '40'}]}>
        <Clock size={28} color={colors.gold600} strokeWidth={1.5} />
      </View>
      <Text style={state.title}>Approval pending</Text>
      <Text style={state.body}>
        Your request to join{hoaName ? ` ${hoaName}` : ' the community'} is awaiting review by the HOA manager.
        {'\n\n'}You'll have full access once approved. Pull down to refresh your status.
      </Text>
      <TouchableOpacity style={[state.btn, {backgroundColor: colors.gold50, borderColor: colors.gold500 + '40'}]} onPress={onRefresh}>
        <Text style={[state.btnText, {color: colors.gold600}]}>Check status</Text>
      </TouchableOpacity>
    </View>
  );
}

function DeclinedCard({hoaName}: {hoaName: string | null}) {
  return (
    <View style={state.card}>
      <View style={[state.iconWrap, {backgroundColor: '#FEF2F2', borderColor: '#FECACA'}]}>
        <XCircle size={28} color="#DC2626" strokeWidth={1.5} />
      </View>
      <Text style={state.title}>Request declined</Text>
      <Text style={state.body}>
        Your request to join{hoaName ? ` ${hoaName}` : ' the community'} was declined by the HOA manager.
        {'\n\n'}Contact your HOA administrator directly if you believe this is a mistake.
      </Text>
    </View>
  );
}

function RevokedCard({hoaName}: {hoaName: string | null}) {
  return (
    <View style={state.card}>
      <View style={[state.iconWrap, {backgroundColor: '#FEF2F2', borderColor: '#FECACA'}]}>
        <AlertCircle size={28} color="#DC2626" strokeWidth={1.5} />
      </View>
      <Text style={state.title}>Access revoked</Text>
      <Text style={state.body}>
        Your access to{hoaName ? ` ${hoaName}` : ' the community'} has been removed by the HOA manager.
        {'\n\n'}Contact your HOA administrator if you have questions.
      </Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: {
    height: 26, paddingHorizontal: 10, borderRadius: radius.pill,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  text: {fontSize: 12, fontWeight: '600'},
  approved: {borderColor: colors.sage100, backgroundColor: colors.sage50},
  pending: {borderColor: colors.gold500 + '40', backgroundColor: colors.gold50},
  declined: {borderColor: '#FECACA', backgroundColor: '#FEF2F2'},
});

const state = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: 28, alignItems: 'center', ...shadow.sm,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  title: {fontSize: 20, fontWeight: '800', color: colors.ink900, marginBottom: 12, textAlign: 'center'},
  body: {fontSize: 14, color: colors.ink500, lineHeight: 22, textAlign: 'center', marginBottom: 20},
  btn: {
    borderRadius: radius.pill, borderWidth: 1,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  btnText: {fontSize: 14, fontWeight: '700'},
});

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},

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
  greeting: {flex: 1, fontSize: 26, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
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

  communityCard: {
    marginHorizontal: 16, marginBottom: 16, borderRadius: 22,
    backgroundColor: colors.bgCard, padding: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  communityGlow: {
    position: 'absolute', right: -40, top: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(194,85,43,0.07)',
  },
  communityTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  communityTypeBadge: {
    paddingHorizontal: 10, height: 26, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border, justifyContent: 'center',
  },
  communityTypeBadgeText: {fontSize: 11, fontWeight: '700', color: colors.ink500, letterSpacing: 0.5},
  unitBadge: {
    paddingHorizontal: 10, height: 26, borderRadius: radius.pill,
    backgroundColor: colors.terracotta50, borderWidth: 1, borderColor: colors.terracotta100, justifyContent: 'center',
  },
  unitBadgeText: {fontSize: 11, fontWeight: '700', color: colors.terracotta600},
  communityName: {fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.6, marginBottom: 4},
  communityAddress: {fontSize: 13, color: colors.ink500, marginBottom: 12},
  communityManagedText: {fontSize: 12, color: colors.ink400},

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

  infoSection: {marginHorizontal: 16, marginTop: 6, marginBottom: 12},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900, marginBottom: 10},
  infoCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.sm,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  infoLabel: {fontSize: 13, fontWeight: '600', color: colors.ink500},
  infoValue: {fontSize: 13, fontWeight: '700', color: colors.ink900, maxWidth: '55%', textAlign: 'right'},
});
