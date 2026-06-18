import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell, Plus, MapPin, Users, ChevronRight, X,
  TrendingDown, Zap, CheckCircle, Clock, ClipboardList, MessageCircle, Sparkles,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  homeownerApi,
  DashboardData,
  HomeownerRequest,
  HomeownerGroup,
  Notification,
  NeighbourhoodRequest,
} from '../../api/homeowner';
import {useAuth} from '../../hooks/useAuth';
import {Chip} from '../../components/Chip';
import {Button} from '../../components/Button';
import {ServiceCategoryBadge} from '../../components/ServiceCategoryBadge';
import NewRequestScreen from './NewRequestScreen';
import {getLosAngelesGreeting} from '../../utils/time';

const DISMISSED_KEY = 'dismissed_notification_ids';
const brandMark = require('../../assets/bidbundle-mark.png');

function formatHours(h: number) {
  if (h <= 0) {return 'Window closed';}
  if (h < 24) {return `${Math.ceil(h)}h left`;}
  return `${Math.floor(h / 24)}d ${Math.ceil(h % 24)}h left`;
}

function categoryColor(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes('lawn') || c.includes('garden')) {return colors.sage500;}
  if (c.includes('plumb') || c.includes('hvac') || c.includes('elect')) {return '#6F8DB8';}
  if (c.includes('clean')) {return '#B07AA0';}
  if (c.includes('gutter') || c.includes('roof')) {return colors.gold500;}
  return colors.terracotta500;
}

function groupStatusTone(status: string | null | undefined): 'sage' | 'terracotta' | 'gold' | 'neutral' {
  if (status === 'bidding') {return 'terracotta';}
  if (status === 'pending_approval') {return 'gold';}
  if (status === 'grouping') {return 'sage';}
  return 'neutral';
}

function groupStatusLabel(status: string | null | undefined): string {
  if (status === 'bidding') {return 'Bids live';}
  if (status === 'pending_approval') {return 'Pending approval';}
  if (status === 'grouping') {return 'Join group';}
  return 'Open';
}

// Mini bar chart using Views — same style as web app
function MiniBarChart({data, color}: {data: number[]; color: string}) {
  const max = Math.max(...data, 1);
  const months = ['J', 'F', 'M', 'A', 'M', 'J'];
  return (
    <View style={chart.wrap}>
      {data.map((v, i) => (
        <View key={i} style={chart.col}>
          <View
            style={[
              chart.bar,
              {
                height: Math.max(4, (v / max) * 52),
                backgroundColor: v > 0 ? color : colors.cream200,
              },
            ]}
          />
          <Text style={chart.label}>{months[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 66},
  col: {flex: 1, alignItems: 'center', gap: 4},
  bar: {width: '100%', borderRadius: 3},
  label: {fontSize: 9, color: colors.ink300, fontWeight: '600'},
});

interface RequestDetailItem {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  neighborhood: string;
  status: string;
  group_status?: string | null;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  owner_name?: string | null;
  is_mine: boolean;
}

export default function DashboardScreen() {
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [requests, setRequests] = useState<HomeownerRequest[]>([]);
  const [groups, setGroups] = useState<HomeownerGroup[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [nbFeed, setNbFeed] = useState<NeighbourhoodRequest[]>([]);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupActionId, setGroupActionId] = useState<number | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<RequestDetailItem | null>(null);

  // Load dismissed IDs from storage
  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then(raw => {
      if (raw) {
        setDismissedIds(new Set(JSON.parse(raw)));
      }
    });
  }, []);

  const load = useCallback(async () => {
    try {
      const [dash, reqs, grps, notifs, feed] = await Promise.all([
        homeownerApi.getDashboard(),
        homeownerApi.getRequests(),
        homeownerApi.getGroups(),
        homeownerApi.getNotifications().catch(() => []),
        homeownerApi.getNeighbourhoodFeed().catch(() => []),
      ]);
      setDashboard(dash);
      setRequests(reqs);
      setGroups(grps.filter(g => g.status !== 'cancelled'));
      setNotifications(notifs);
      // Show active neighbourhood demand that the user has not joined yet.
      setNbFeed(
        feed.filter(r =>
          !r.is_mine &&
          (
            r.group_status === 'grouping' ||
            r.group_status === 'pending_approval' ||
            r.group_status === 'bidding' ||
            r.group_status === null
          )
        )
      );
    } catch (e: any) {
      console.warn('Dashboard error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);

  const onRefresh = useCallback(() => {setRefreshing(true); load();}, [load]);

  async function dismissNotification(id: number) {
    const next = new Set([...dismissedIds, id]);
    setDismissedIds(next);
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
  }

  async function handleApprove(groupId: number) {
    setGroupActionId(groupId);
    try {
      const res = await homeownerApi.approveGroup(groupId);
      if (res.status === 'bidding') {
        Alert.alert('Group is live!', 'Providers can now see and bid on your group.');
      }
      await load();
    } catch (e: any) {Alert.alert('Error', e.message);}
    finally {setGroupActionId(null);}
  }

  async function handleCancelGroup(groupId: number) {
    Alert.alert('Cancel your spot?', 'You will leave this group.', [
      {text: 'Keep my spot', style: 'cancel'},
      {
        text: 'Cancel', style: 'destructive',
        onPress: async () => {
          setGroupActionId(groupId);
          try {await homeownerApi.cancelGroup(groupId); await load();}
          catch (e: any) {Alert.alert('Error', e.message);}
          finally {setGroupActionId(null);}
        },
      },
    ]);
  }

  async function handleJoin(req: NeighbourhoodRequest) {
    setJoiningId(req.id);
    try {
      const res = await homeownerApi.joinGroup(
        req.category,
        req.neighborhood,
        req.budget_min,
        req.budget_max,
        req.group_id,
      );
      const msg = res.group_id
        ? 'You joined the group! Check My Bids and Chat to connect with your neighbours.'
        : 'You started a new group request in your neighbourhood.';
      Alert.alert('Joined!', msg);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not join the group.');
    } finally {
      setJoiningId(null);
    }
  }

  function openRequestDetail(req: RequestDetailItem) {
    setSelectedDetail(req);
  }

  function openGroupDetail(group: HomeownerGroup) {
    const request = requests.find(item => item.group_id === group.group_id);
    if (!request) {
      navigation.navigate('Bids');
      return;
    }
    openRequestDetail({
      id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      neighborhood: request.neighborhood,
      status: request.status,
      group_status: request.group_status,
      budget_min: request.budget_min,
      budget_max: request.budget_max,
      bid_count: request.bid_count,
      is_mine: true,
    });
  }

  function openNotifications() {
    if (visibleNotifications.length === 0) {
      Alert.alert('Notifications', 'No new notifications right now.');
      return;
    }
    Alert.alert(
      'Notifications',
      visibleNotifications.map(n => `${n.title}\n${n.body}`).join('\n\n'),
    );
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const greeting = getLosAngelesGreeting();
  // Deduplicate requests by group_id (user may have joined same group via multiple requests)
  const activeRequests = requests
    .filter(r => ['live', 'grouping', 'draft'].includes(r.status))
    .filter((r, i, arr) => {
      if (!r.group_id) {return true;}
      return arr.findIndex(x => x.group_id === r.group_id) === i;
    });
  const topBidRequest = requests.find(r => r.bid_count > 0 && r.status !== 'closed');
  // Deduplicate by group_id in case of backend race conditions
  const activeGroups = groups
    .filter(g => ['grouping', 'pending_approval', 'bidding'].includes(g.status))
    .filter((g, i, arr) => arr.findIndex(x => x.group_id === g.group_id) === i);
  const neighbourhoodOpportunities = nbFeed.slice(0, 4);
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id)).slice(0, 2);
  const totalSaved = Math.round((dashboard?.total_saved_cents ?? 0) / 100);

  // Fake monthly savings data — replace with real when API provides it
  const savingsData = [0, 0, totalSaved > 0 ? Math.round(totalSaved * 0.3) : 0, totalSaved > 0 ? Math.round(totalSaved * 0.7) : 0, totalSaved, 0];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}><Text style={styles.loadingText}>Loading…</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Modal
        visible={showNewRequest}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewRequest(false)}>
        <NewRequestScreen
          onDone={() => {
            setShowNewRequest(false);
            load();
          }}
          onBack={() => setShowNewRequest(false)}
        />
      </Modal>
      <Modal
        visible={selectedDetail !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDetail(null)}>
        <SafeAreaView style={styles.detailSafe} edges={['top']}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setSelectedDetail(null)} style={styles.detailBackBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Request details</Text>
            <View style={{width: 52}} />
          </View>
          {selectedDetail ? (
            <ScrollView contentContainerStyle={styles.detailContainer}>
              <View style={styles.detailCard}>
                <View style={styles.detailTitleRow}>
                  <Text style={styles.detailTitle}>{selectedDetail.title}</Text>
                  <Chip
                    label={selectedDetail.group_status ? groupStatusLabel(selectedDetail.group_status) : selectedDetail.status}
                    tone={selectedDetail.group_status ? groupStatusTone(selectedDetail.group_status) : selectedDetail.status === 'live' ? 'sage' : 'neutral'}
                  />
                </View>
                <Text style={styles.detailMeta}>
                  {selectedDetail.neighborhood} · {selectedDetail.category}
                  {selectedDetail.owner_name ? ` · ${selectedDetail.owner_name}` : ''}
                </Text>
                <Text style={styles.detailBudget}>
                  ${Math.round(selectedDetail.budget_min / 100).toLocaleString()}–${Math.round(selectedDetail.budget_max / 100).toLocaleString()}
                </Text>
                <Text style={styles.detailStat}>{selectedDetail.bid_count} bid{selectedDetail.bid_count !== 1 ? 's' : ''} tracked</Text>
                <Text style={styles.detailDescription}>
                  {selectedDetail.description?.trim() || 'No additional description was provided for this request.'}
                </Text>
              </View>
              <View style={styles.detailActions}>
                {selectedDetail.is_mine ? (
                  <Button label="Open My Bids" onPress={() => {
                    setSelectedDetail(null);
                    navigation.navigate('Bids');
                  }} />
                ) : (
                  <Button label="Join this group" onPress={() => {
                    const req = nbFeed.find(item => item.id === selectedDetail.id);
                    if (req) {
                      setSelectedDetail(null);
                      handleJoin(req);
                    }
                  }} />
                )}
                <Button
                  label="Open Chat"
                  variant="ghost"
                  onPress={() => {
                    setSelectedDetail(null);
                    navigation.navigate('Chat');
                  }}
                />
              </View>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: tabBarHeight + 36}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerCard}>
            <View style={styles.headerGlow} />
            <View style={styles.brandHeaderRow}>
              <View style={styles.brandRow}>
                <View style={styles.brandMarkWrap}>
                  <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                </View>
                <Text style={styles.brand}>BidBundle</Text>
                <View style={styles.brandPillSoft}>
                  <Text style={styles.brandSoftText}>Homeowner</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerTopRow}>
              <Text style={styles.greeting}>{greeting}, {firstName}</Text>
              <TouchableOpacity style={styles.bellBtn} onPress={openNotifications}>
                <Bell size={20} color={colors.cream200} strokeWidth={2} />
                {visibleNotifications.length > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{visibleNotifications.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.headerStatPill}>
                <MapPin size={12} color={colors.cream300} strokeWidth={2} />
                <Text style={styles.headerStatText}>{user?.neighborhood ?? 'West Adams, Los Angeles'}</Text>
              </View>
              <View style={styles.headerStatPill}>
                <Text style={styles.headerStatDot}>•</Text>
                <Text style={styles.headerStatText}>{dashboard?.unread_messages ?? 0} unread</Text>
              </View>
              <View style={styles.headerStatPill}>
                <Users size={12} color={colors.cream300} strokeWidth={2} />
                <Text style={styles.headerStatText}>{activeGroups.length} active groups</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Notifications (dismissable) ── */}
        {visibleNotifications.map(n => (
          <View key={n.id} style={styles.notifCard}>
            <View style={styles.notifLeft}>
              <Bell size={14} color={colors.terracotta600} strokeWidth={2} />
              <View style={styles.notifText}>
                <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => dismissNotification(n.id)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <X size={16} color={colors.ink300} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ))}

        {/* ── Hero bid card ── */}
        {topBidRequest && (
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.heroTop}>
              <View style={styles.heroChips}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live bidding</Text>
              </View>
              <View style={styles.heroBudge}>
                <Text style={styles.heroBudgeText}>
                  Closes {topBidRequest.closes_at ? new Date(topBidRequest.closes_at).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'open'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>{topBidRequest.title}</Text>
            <Text style={styles.heroSub}>
              {topBidRequest.bid_count} bid{topBidRequest.bid_count !== 1 ? 's' : ''} in · {topBidRequest.neighborhood}
            </Text>
            <View style={styles.heroFooter}>
              <View>
                <Text style={styles.heroEyebrow}>BEST BID</Text>
                <Text style={styles.heroBid}>
                  {topBidRequest.best_bid_cents
                    ? `$${Math.round(topBidRequest.best_bid_cents / 100).toLocaleString()}`
                    : '—'}
                </Text>
                {topBidRequest.best_bid_cents && topBidRequest.budget_min > topBidRequest.best_bid_cents && (
                  <Text style={styles.heroSaving}>
                    −${Math.round((topBidRequest.budget_min - topBidRequest.best_bid_cents) / 100)} vs solo
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Bids')}>
                <Text style={styles.heroBtnText}>Review bids</Text>
                <ChevronRight size={14} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {flex: 1.4}]}>
            <Text style={styles.statEyebrow}>SAVINGS THIS YEAR</Text>
            <Text style={[styles.statBig, {color: colors.terracotta600}]}>
              ${totalSaved.toLocaleString()}
            </Text>
            <Chip label="↓ 22% vs solo" tone="sage" style={styles.statChip} />
            <MiniBarChart data={savingsData} color={colors.terracotta500} />
          </View>
          <View style={styles.statsRight}>
            <View style={[styles.statCard, styles.statCardSm]}>
              <Text style={styles.statEyebrow}>OPEN REQUESTS</Text>
              <Text style={styles.statBig}>{activeRequests.length}</Text>
              <View style={styles.statRow}>
                <ClipboardList size={11} color={colors.ink400} strokeWidth={2} />
                <Text style={styles.statSub}>you posted</Text>
              </View>
            </View>
            <View style={[styles.statCard, styles.statCardSm, styles.statCardSage]}>
              <Text style={styles.statEyebrow}>GROUPS JOINED</Text>
              <Text style={[styles.statBig, {color: colors.sage700}]}>
                {activeGroups.length}
              </Text>
              <View style={styles.statRow}>
                <Zap size={11} color={colors.sage600} strokeWidth={2} />
                <Text style={[styles.statSub, {color: colors.sage600}]}>live nearby</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardBids]} activeOpacity={0.85} onPress={() => navigation.navigate('Bids')}>
            <View style={[styles.quickIcon, {backgroundColor: colors.terracotta50}]}>
              <ClipboardList size={18} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <Text style={styles.quickTitle}>My bids</Text>
            <Text style={styles.quickSub}>Review quotes and group activity.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardChat]} activeOpacity={0.85} onPress={() => navigation.navigate('Chat')}>
            <View style={[styles.quickIcon, {backgroundColor: colors.sage50}]}>
              <MessageCircle size={18} color={colors.sage700} strokeWidth={2} />
            </View>
            <Text style={styles.quickTitle}>Chat</Text>
            <Text style={styles.quickSub}>Open neighbourhood and group messages.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardQuote]} activeOpacity={0.85} onPress={() => navigation.navigate('Quote')}>
            <View style={[styles.quickIcon, {backgroundColor: colors.gold50}]}>
              <Sparkles size={18} color={colors.gold600} strokeWidth={2} />
            </View>
            <Text style={styles.quickTitle}>Quote check</Text>
            <Text style={styles.quickSub}>Compare outside quotes with BidBundle bids.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardNew]} activeOpacity={0.85} onPress={() => setShowNewRequest(true)}>
            <View style={[styles.quickIcon, {backgroundColor: colors.sky50}]}>
              <Plus size={18} color={colors.sky600} strokeWidth={2.3} />
            </View>
            <Text style={styles.quickTitle}>New request</Text>
            <Text style={styles.quickSub}>Post a job for your neighbours to join.</Text>
          </TouchableOpacity>
        </View>

        {/* ── Neighbourhood groups feed ── */}
        {nbFeed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Groups in your area</Text>
              <Chip label={`${nbFeed.length} active`} tone="sage" dot />
            </View>
            <Text style={styles.nbFeedSub}>
              Neighbours have started these service groups. Join to get group pricing.
            </Text>
            {neighbourhoodOpportunities.map(req => (
              <View key={req.id} style={styles.nbCard}>
                <View style={styles.nbCardLeft}>
                  <ServiceCategoryBadge category={req.category} size={40} />
                  <View style={styles.nbInfo}>
                    <Text style={styles.nbTitle} numberOfLines={1}>{req.title}</Text>
                    <Text style={styles.nbMeta}>
                      {req.owner_name.split(' ')[0]} · {req.bid_count} bid{req.bid_count !== 1 ? 's' : ''} · {req.category}
                    </Text>
                    <Text style={styles.nbBudget}>
                      ${Math.round(req.budget_min / 100)}–${Math.round(req.budget_max / 100)}
                    </Text>
                  </View>
                </View>
                <View style={styles.nbActions}>
                  <Chip
                    label={groupStatusLabel(req.group_status)}
                    tone={groupStatusTone(req.group_status)}
                    style={styles.nbStatusChip}
                  />
                  <TouchableOpacity
                    onPress={() => openRequestDetail({
                      id: req.id,
                      title: req.title,
                      description: null,
                      category: req.category,
                      neighborhood: req.neighborhood,
                      status: req.status,
                      group_status: req.group_status,
                      budget_min: req.budget_min,
                      budget_max: req.budget_max,
                      bid_count: req.bid_count,
                      owner_name: req.owner_name,
                      is_mine: false,
                    })}
                    style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleJoin(req)}
                    disabled={joiningId === req.id}
                    style={[styles.joinBtn, joiningId === req.id && styles.joinBtnDisabled]}>
                    <Text style={styles.joinBtnText}>
                      {joiningId === req.id ? '…' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Active groups ── */}
        {activeGroups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your groups</Text>
              <Chip label={`${activeGroups.length} active`} tone="terracotta" dot />
            </View>
            {activeGroups.map(g => {
              const isBusy = groupActionId === g.group_id;
              if (g.status === 'pending_approval') {
                return (
                  <View key={g.group_id} style={[styles.groupCard, styles.groupGold]}>
                    <View style={styles.groupHeader}>
                      <View style={styles.groupHeaderLeft}>
                        <Clock size={14} color={colors.gold600} strokeWidth={2} />
                        <Text style={[styles.groupTitle, {color: colors.gold600}]}>Your vote is needed</Text>
                      </View>
                      <Text style={styles.groupMeta}>{g.approved_count}/{g.member_count} approved</Text>
                    </View>
                    <Text style={styles.groupSub}>
                      {g.category} · {g.member_count} neighbour{g.member_count !== 1 ? 's' : ''} · window closed
                    </Text>
                    <Text style={styles.groupDesc}>Approve or leave this group.</Text>
                    <View style={styles.groupActions}>
                      <Button label="View details" variant="quiet" size="sm" onPress={() => openGroupDetail(g)} style={styles.groupBtn} />
                      <Button label="Cancel spot" variant="ghost" size="sm" onPress={() => handleCancelGroup(g.group_id)} disabled={isBusy} style={styles.groupBtn} />
                      <Button label="Approve group" size="sm" onPress={() => handleApprove(g.group_id)} loading={isBusy} style={styles.groupBtn} />
                    </View>
                  </View>
                );
              }
              if (g.status === 'bidding') {
                return (
                  <View key={g.group_id} style={[styles.groupCard, styles.groupSage]}>
                    <View style={styles.groupHeader}>
                      <View style={styles.groupHeaderLeft}>
                        <CheckCircle size={14} color={colors.sage700} strokeWidth={2} />
                        <Text style={[styles.groupTitle, {color: colors.sage700}]}>Sent to providers</Text>
                      </View>
                      <Text style={styles.groupMeta}>{g.member_count} neighbours</Text>
                    </View>
                    <Text style={styles.groupSub}>{g.category} · waiting for bids</Text>
                    <View style={styles.groupActions}>
                      <Button label="View details" variant="quiet" size="sm" onPress={() => openGroupDetail(g)} style={styles.groupBtn} />
                    </View>
                  </View>
                );
              }
              const progress = Math.min(100, ((72 - g.hours_remaining) / 72) * 100);
              return (
                <View key={g.group_id} style={[styles.groupCard, styles.groupCream]}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupHeaderLeft}>
                      <Users size={14} color={colors.ink500} strokeWidth={2} />
                      <Text style={styles.groupTitle}>Gathering neighbours</Text>
                    </View>
                    <Text style={styles.groupMeta}>{g.member_count} joined</Text>
                  </View>
                  <Text style={styles.groupSub}>{g.category} · {formatHours(g.hours_remaining)}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, {width: `${progress}%` as any}]} />
                  </View>
                  <Text style={styles.groupDesc}>Approve when the window closes.</Text>
                  <View style={styles.groupActions}>
                    <Button label="View details" variant="quiet" size="sm" onPress={() => openGroupDetail(g)} style={styles.groupBtnSingle} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Active requests ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active requests</Text>
            <Text style={styles.sectionCount}>
              {activeRequests.length > 0 ? `${activeRequests.length} open` : neighbourhoodOpportunities.length > 0 ? `${neighbourhoodOpportunities.length} nearby` : '0 open'}
            </Text>
          </View>
          <View style={styles.requestsCard}>
            {activeRequests.length === 0 && neighbourhoodOpportunities.length > 0 ? (
              neighbourhoodOpportunities.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => openRequestDetail({
                    id: r.id,
                    title: r.title,
                    description: null,
                    category: r.category,
                    neighborhood: r.neighborhood,
                    status: r.status,
                    group_status: r.group_status,
                    budget_min: r.budget_min,
                    budget_max: r.budget_max,
                    bid_count: r.bid_count,
                    owner_name: r.owner_name,
                    is_mine: false,
                  })}
                  style={[styles.requestRow, i > 0 && {borderTopWidth: 1, borderTopColor: colors.border}]}>
                  <ServiceCategoryBadge category={r.category} size={40} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.requestMeta}>
                      {r.neighborhood} · {r.bid_count} bid{r.bid_count !== 1 ? 's' : ''} · {r.owner_name.split(' ')[0]}
                    </Text>
                  </View>
                  <View style={styles.requestRight}>
                    <Text style={styles.requestBudget}>
                      ${Math.round(r.budget_min / 100)}–${Math.round(r.budget_max / 100)}
                    </Text>
                    <Chip
                      label={groupStatusLabel(r.group_status)}
                      tone={groupStatusTone(r.group_status)}
                      style={styles.statusChip}
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : activeRequests.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No active requests yet.</Text>
                <TouchableOpacity style={styles.newRequestBtn} onPress={() => setShowNewRequest(true)}>
                  <Plus size={14} color={colors.terracotta600} strokeWidth={2.5} />
                  <Text style={styles.newRequestText}>Post a request</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeRequests.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => openRequestDetail({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    category: r.category,
                    neighborhood: r.neighborhood,
                    status: r.status,
                    group_status: r.group_status,
                    budget_min: r.budget_min,
                    budget_max: r.budget_max,
                    bid_count: r.bid_count,
                    is_mine: true,
                  })}
                  style={[styles.requestRow, i > 0 && {borderTopWidth: 1, borderTopColor: colors.border}]}>
                  <ServiceCategoryBadge category={r.category} size={40} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle} numberOfLines={1}>{r.title}</Text>
                    <Text style={styles.requestMeta}>
                      {r.neighborhood} · {r.bid_count} bid{r.bid_count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.requestRight}>
                    <Text style={styles.requestBudget}>
                      ${Math.round(r.budget_min / 100)}–${Math.round(r.budget_max / 100)}
                    </Text>
                    <Chip
                      label={r.group_status ? groupStatusLabel(r.group_status) : r.status}
                      tone={r.group_status ? groupStatusTone(r.group_status) : r.status === 'live' ? 'sage' : r.bid_count > 0 ? 'terracotta' : 'neutral'}
                      style={styles.statusChip}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
            {activeRequests.length > 0 && (
              <TouchableOpacity style={styles.addRequestRow} onPress={() => setShowNewRequest(true)}>
                <Plus size={14} color={colors.ink400} strokeWidth={2.5} />
                <Text style={styles.addRequestText}>Add a new service request</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  detailSafe: {flex: 1, backgroundColor: colors.bgApp},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {color: colors.ink400, fontSize: 14},
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  detailBackBtn: {
    minWidth: 52,
    alignItems: 'flex-start',
  },
  detailHeaderTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900},
  detailContainer: {padding: 16, gap: 16},
  detailCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadow.sm,
  },
  detailTitleRow: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  detailTitle: {flex: 1, fontSize: 22, fontWeight: '700', color: colors.ink900},
  detailMeta: {fontSize: 13, color: colors.ink400, marginTop: 8},
  detailBudget: {fontSize: 26, fontWeight: '700', color: colors.terracotta600, marginTop: 14},
  detailStat: {fontSize: 13, color: colors.sage700, marginTop: 4, fontWeight: '600'},
  detailDescription: {fontSize: 14, color: colors.ink500, lineHeight: 21, marginTop: 14},
  detailActions: {gap: 10},

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerCard: {
    backgroundColor: colors.warmDark,
    borderRadius: radius.xl,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    ...shadow.lg,
  },
  headerGlow: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    right: -60, top: -70,
    backgroundColor: 'rgba(194,85,43,0.18)',
  },
  brandHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerTopRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  brandMarkWrap: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandMark: {width: 22, height: 22},
  brand: {fontSize: 15, fontWeight: '800', color: colors.terracotta400, letterSpacing: -0.2},
  brandPillSoft: {
    height: 24, marginLeft: 6, paddingHorizontal: 10,
    borderRadius: radius.pill, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  brandSoftText: {fontSize: 11, fontWeight: '700', color: colors.cream300},
  greeting: {flex: 1, fontSize: 26, fontWeight: '700', color: colors.white, letterSpacing: -0.5},
  headerStats: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12},
  headerStatPill: {
    height: 26, paddingHorizontal: 10, borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  headerStatText: {fontSize: 12, color: colors.cream200, fontWeight: '600'},
  headerStatDot: {fontSize: 12, color: colors.cream300, fontWeight: '700'},
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 2,
  },
  backText: {fontSize: 16, fontWeight: '600', color: colors.ink700},
  bellBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.terracotta500,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadgeText: {color: '#fff', fontSize: 9, fontWeight: '700'},

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

  // Hero card
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: colors.warmDark,
    padding: 22,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', right: -40, top: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(224,135,88,0.2)',
  },
  heroTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  heroChips: {flexDirection: 'row', alignItems: 'center', gap: 6},
  liveDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: colors.terracotta400},
  liveText: {fontSize: 12, fontWeight: '700', color: colors.terracotta400},
  heroBudge: {
    paddingHorizontal: 8, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBudgeText: {fontSize: 11, color: '#B5AC9C', fontWeight: '600'},
  heroTitle: {fontSize: 22, fontWeight: '700', color: '#FBF7F1', letterSpacing: -0.4, marginBottom: 4},
  heroSub: {fontSize: 13, color: '#8C8273', marginBottom: 18},
  heroFooter: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'},
  heroEyebrow: {fontSize: 10, fontWeight: '700', color: '#6E6557', letterSpacing: 1},
  heroBid: {fontSize: 40, fontWeight: '700', color: '#FBF7F1', letterSpacing: -1, lineHeight: 44},
  heroSaving: {fontSize: 12, color: colors.sage500, fontWeight: '600', marginTop: 2},
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.terracotta600,
    paddingHorizontal: 16, height: 40, borderRadius: radius.pill,
  },
  heroBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},

  // Stats row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.terracotta50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    padding: 16,
    ...shadow.sm,
  },
  statsRight: {gap: 10, flex: 1},
  statCardSm: {flex: 1, padding: 14, backgroundColor: colors.bgCard, borderColor: colors.border},
  statCardSage: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  statEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8, marginBottom: 6},
  statBig: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6, lineHeight: 32},
  statChip: {height: 20, marginTop: 6, marginBottom: 10},
  statRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  statSub: {fontSize: 11, color: colors.ink400},

  // Quick actions
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
  quickCardBids:  {borderLeftWidth: 3, borderLeftColor: colors.terracotta600},
  quickCardChat:  {borderLeftWidth: 3, borderLeftColor: colors.sage700},
  quickCardQuote: {borderLeftWidth: 3, borderLeftColor: colors.gold600},
  quickCardNew:   {borderLeftWidth: 3, borderLeftColor: colors.sky600},
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  quickSub: {fontSize: 12, color: colors.ink400, marginTop: 4, lineHeight: 17},

  // Section
  section: {marginHorizontal: 16, marginBottom: 16},
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900},
  sectionCount: {fontSize: 13, color: colors.ink400},

  // Group cards
  groupCard: {borderRadius: radius.lg, padding: 16, marginBottom: 10, borderWidth: 1},
  groupGold: {backgroundColor: colors.gold50, borderColor: colors.gold100},
  groupSage: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  groupCream: {backgroundColor: colors.cream100, borderColor: colors.border},
  groupHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  groupHeaderLeft: {flexDirection: 'row', alignItems: 'center', gap: 6},
  groupTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  groupMeta: {fontSize: 12, color: colors.ink400, fontWeight: '600'},
  groupSub: {fontSize: 13, color: colors.ink500, marginBottom: 8},
  groupDesc: {fontSize: 12, color: colors.ink500, lineHeight: 17, marginTop: 4},
  groupActions: {flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'flex-end'},
  groupBtn: {flex: 1},
  groupBtnSingle: {minWidth: 120},
  progressTrack: {height: 5, borderRadius: 3, backgroundColor: colors.cream200, overflow: 'hidden'},
  progressFill: {height: 5, borderRadius: 3, backgroundColor: colors.sage500},

  // Requests card
  requestsCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.borderStrong, overflow: 'hidden', ...shadow.md,
  },
  requestRow: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14},
  requestAvatar: {width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  requestAvatarText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  requestInfo: {flex: 1},
  requestTitle: {fontSize: 14, fontWeight: '600', color: colors.ink900},
  requestMeta: {fontSize: 12, color: colors.ink400, marginTop: 2},
  requestRight: {alignItems: 'flex-end', gap: 4},
  requestBudget: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  statusChip: {height: 20},
  addRequestRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.cream50,
  },
  addRequestText: {fontSize: 13, fontWeight: '600', color: colors.ink400},
  // Neighbourhood feed
  nbFeedSub: {fontSize: 13, color: colors.ink400, marginBottom: 10, marginTop: -4},
  nbCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.borderStrong, padding: 14, marginBottom: 8, ...shadow.md,
  },
  nbCardLeft: {flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1},
  nbAvatar: {width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  nbAvatarText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  nbInfo: {flex: 1},
  nbTitle: {fontSize: 14, fontWeight: '600', color: colors.ink900},
  nbMeta: {fontSize: 12, color: colors.ink400, marginTop: 2},
  nbBudget: {fontSize: 12, fontWeight: '600', color: colors.terracotta600, marginTop: 2},
  nbActions: {alignItems: 'flex-end', gap: 8, marginLeft: 10},
  nbStatusChip: {height: 20},
  viewBtn: {
    minWidth: 62,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
  },
  viewBtnText: {fontSize: 12, fontWeight: '700', color: colors.ink700},
  joinBtn: {
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingHorizontal: 16, height: 34, alignItems: 'center', justifyContent: 'center',
  },
  joinBtnDisabled: {backgroundColor: colors.terracotta100},
  joinBtnText: {color: '#fff', fontSize: 13, fontWeight: '700'},

  emptyRow: {padding: 20, alignItems: 'center', gap: 12},
  emptyText: {fontSize: 14, color: colors.ink400},
  newRequestBtn: {flexDirection: 'row', alignItems: 'center', gap: 6},
  newRequestText: {fontSize: 14, fontWeight: '600', color: colors.terracotta600},
});
