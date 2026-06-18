import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {ClipboardList, CheckCircle2, Users, Clock} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  homeownerApi,
  HomeownerBid,
  HomeownerGroup,
} from '../../api/homeowner';
import {Button} from '../../components/Button';
import {Chip} from '../../components/Chip';
import {ServiceCategoryBadge} from '../../components/ServiceCategoryBadge';

function formatHours(h: number) {
  if (h <= 0) {return 'Closed';}
  if (h < 24) {return `${Math.ceil(h)}h left`;}
  return `${Math.floor(h / 24)}d left`;
}

export default function BidsScreen() {
  const [bids, setBids] = useState<HomeownerBid[]>([]);
  const [groups, setGroups] = useState<HomeownerGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupActionId, setGroupActionId] = useState<number | null>(null);
  const [bidActionId, setBidActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, g] = await Promise.all([
        homeownerApi.getBids(),
        homeownerApi.getGroups(),
      ]);
      setBids(b);
      setGroups(g.filter(gr => gr.status !== 'cancelled'));
    } catch (e: any) {
      console.warn('Bids load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  async function handleApprove(groupId: number) {
    setGroupActionId(groupId);
    try {
      const res = await homeownerApi.approveGroup(groupId);
      if (res.status === 'bidding') {
        Alert.alert(
          'Group is live!',
          'All members approved — providers can now see your group and submit bids.',
        );
      }
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGroupActionId(null);
    }
  }

  async function handleCancelGroup(groupId: number) {
    Alert.alert(
      'Cancel your spot?',
      'You will be removed from this group.',
      [
        {text: 'Keep my spot', style: 'cancel'},
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            setGroupActionId(groupId);
            try {
              await homeownerApi.cancelGroup(groupId);
              await load();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setGroupActionId(null);
            }
          },
        },
      ],
    );
  }

  async function handleAccept(bidId: number) {
    Alert.alert(
      'Accept this bid?',
      'Other bids on this request will be automatically declined.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Accept bid',
          onPress: async () => {
            setBidActionId(bidId);
            try {
              await homeownerApi.acceptBid(bidId);
              await load();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setBidActionId(null);
            }
          },
        },
      ],
    );
  }

  async function handleDecline(bidId: number) {
    setBidActionId(bidId);
    try {
      await homeownerApi.declineBid(bidId);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setBidActionId(null);
    }
  }

  const pendingBids = bids.filter(b => b.status === 'pending');
  const acceptedBids = bids.filter(b => b.status === 'accepted');
  const declinedBids = bids.filter(b => b.status === 'declined');
  const totalPendingValue = pendingBids.reduce((sum, bid) => sum + bid.amount, 0);
  // Deduplicate by group_id
  const activeGroups = groups
    .filter(g => ['grouping', 'pending_approval', 'bidding'].includes(g.status))
    .filter((g, i, arr) => arr.findIndex(x => x.group_id === g.group_id) === i);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.terracotta600}
          />
        }>
        <View style={styles.header}>
          <View style={styles.headerCard}>
            <View style={styles.headerGlow} />
            <View style={styles.headerBadge}>
              <ClipboardList size={11} color={colors.terracotta400} strokeWidth={2} />
              <Text style={styles.headerBadgeText}>Homeowner ledger</Text>
            </View>
            <Text style={styles.title}>My bids</Text>
            <Text style={styles.sub}>Track your groups, provider offers, and confirmed wins.</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardWarm]}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{pendingBids.length}</Text>
              <Text style={styles.summarySub}>
                ${Math.round(totalPendingValue / 100).toLocaleString()} open value
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Groups</Text>
              <Text style={styles.summaryValue}>{activeGroups.length}</Text>
              <Text style={styles.summarySub}>active neighbourhood bundles</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardSage]}>
              <Text style={styles.summaryLabel}>Accepted</Text>
              <Text style={styles.summaryValue}>{acceptedBids.length}</Text>
              <Text style={styles.summarySub}>booked providers</Text>
            </View>
          </View>
        </View>

        {/* Groups */}
        {activeGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>GROUP BIDS</Text>
            {activeGroups.map(g => {
              const isBusy = groupActionId === g.group_id;
              if (g.status === 'pending_approval') {
                return (
                  <View key={g.group_id} style={[styles.groupCard, styles.groupGold]}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupTitle}>Your vote is needed</Text>
                      <Text style={styles.groupMeta}>
                        {g.approved_count}/{g.member_count} approved
                      </Text>
                    </View>
                    <Text style={styles.groupSub}>
                      {g.category} · {g.member_count} neighbours · window closed
                    </Text>
                    <Text style={styles.groupDesc}>
                      Approve to send this group to providers, or cancel your spot.
                    </Text>
                    <View style={styles.groupActions}>
                      <Button
                        label="Cancel spot"
                        variant="ghost"
                        size="sm"
                        onPress={() => handleCancelGroup(g.group_id)}
                        disabled={isBusy}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Approve group"
                        size="sm"
                        onPress={() => handleApprove(g.group_id)}
                        loading={isBusy}
                        style={styles.actionBtn}
                      />
                    </View>
                  </View>
                );
              }
              if (g.status === 'bidding') {
                return (
                  <View key={g.group_id} style={[styles.groupCard, styles.groupSage]}>
                    <View style={styles.groupHeader}>
                      <Text style={[styles.groupTitle, {color: colors.sage700}]}>
                        ✓ Sent to providers
                      </Text>
                      <Text style={styles.groupMeta}>
                        {g.member_count} neighbours
                      </Text>
                    </View>
                    <Text style={styles.groupSub}>
                      {g.category} · waiting for provider bids
                    </Text>
                  </View>
                );
              }
              const progress = Math.min(100, ((72 - g.hours_remaining) / 72) * 100);
              return (
                <View key={g.group_id} style={[styles.groupCard, styles.groupCream]}>
                  <View style={styles.groupHeader}>
                    <View style={{flex: 1}}>
                      <Text style={styles.groupTitle}>
                        {g.category.charAt(0).toUpperCase() + g.category.slice(1)} group
                      </Text>
                      <Text style={styles.groupSub}>{g.neighborhood}</Text>
                    </View>
                    <View style={styles.memberBubble}>
                      <Text style={styles.memberBubbleNum}>{g.member_count}</Text>
                      <Text style={styles.memberBubbleLbl}>neighbours</Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoCell}>
                      <Text style={styles.infoCellLabel}>Window closes</Text>
                      <Text style={styles.infoCellVal}>{formatHours(g.hours_remaining)}</Text>
                    </View>
                    <View style={styles.infoCell}>
                      <Text style={styles.infoCellLabel}>Your vote</Text>
                      <Text style={[styles.infoCellVal, {color: g.my_approval_status === 'approved' ? colors.sage700 : colors.gold600}]}>
                        {g.my_approval_status === 'approved' ? '✓ Approved' : 'Pending'}
                      </Text>
                    </View>
                    <View style={[styles.infoCell, {borderRightWidth: 0}]}>
                      <Text style={styles.infoCellLabel}>Approved</Text>
                      <Text style={styles.infoCellVal}>{g.approved_count}/{g.member_count}</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, {width: `${progress}%` as any}]} />
                  </View>
                  <Text style={styles.groupHint}>
                    After the window closes, all members vote to send to providers. The more neighbours, the better the group deal.
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Pending bids */}
        {pendingBids.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>ACTIVE</Text>
              <Chip
                label={`${pendingBids.length} in progress`}
                tone="sage"
                dot
              />
            </View>
            {pendingBids.map(bid => (
              <View key={bid.id} style={styles.bidCard}>
                <View style={styles.bidTop}>
                  <View style={styles.bidInfo}>
                    <Chip label="Live offer" tone="terracotta" style={styles.bidToneChip} />
                    <Text style={styles.bidTitle} numberOfLines={1}>
                      {bid.request_title}
                    </Text>
                    <Text style={styles.bidProvider}>
                      {bid.provider_name} · {bid.estimated_days}d
                    </Text>
                  </View>
                  <View style={styles.bidAmountCol}>
                    <Text style={styles.bidAmount}>
                      ${Math.round(bid.amount / 100).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.bidActions}>
                  <TouchableOpacity
                    onPress={() => handleDecline(bid.id)}
                    disabled={bidActionId === bid.id}
                    style={styles.declineBtn}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <Button
                    label="Accept bid"
                    size="sm"
                    onPress={() => handleAccept(bid.id)}
                    loading={bidActionId === bid.id}
                    style={styles.acceptBtn}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Accepted bids */}
        {acceptedBids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COMPLETED</Text>
            {acceptedBids.map(bid => (
              <View key={bid.id} style={[styles.bidCard, styles.bidCardAccepted]}>
                <View style={styles.bidTop}>
                  <View style={styles.bidInfo}>
                    <Chip label="Booked" tone="sage" style={styles.bidToneChip} />
                    <Text style={styles.bidTitle}>{bid.request_title}</Text>
                    <Text style={styles.bidProvider}>{bid.provider_name}</Text>
                  </View>
                  <View style={styles.bidAmountCol}>
                    <Text style={styles.bidAmount}>
                      ${Math.round(bid.amount / 100).toLocaleString()}
                    </Text>
                    <Chip label="Accepted" tone="sage" style={styles.statusChip} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Declined bids */}
        {declinedBids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ARCHIVED</Text>
            {declinedBids.map(bid => (
              <View
                key={bid.id}
                style={[styles.bidCard, {opacity: 0.6}]}>
                <View style={styles.bidTop}>
                  <View style={styles.bidInfo}>
                    <Chip label="Archived" tone="neutral" style={styles.bidToneChip} />
                    <Text style={styles.bidTitle}>{bid.request_title}</Text>
                    <Text style={styles.bidProvider}>{bid.provider_name}</Text>
                  </View>
                  <Text style={[styles.bidAmount, {color: colors.ink400}]}>
                    ${Math.round(bid.amount / 100).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {bids.length === 0 && groups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bids yet</Text>
            <Text style={styles.emptySub}>
              Post a service request to start receiving bids from local providers.
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  scroll: {flex: 1},
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {color: colors.ink400, fontSize: 14},
  header: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4},
  headerCard: {
    backgroundColor: colors.warmDark, borderRadius: radius.xl,
    padding: 18, overflow: 'hidden', marginBottom: 16, ...shadow.lg,
  },
  headerGlow: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    right: -50, top: -60, backgroundColor: 'rgba(194,85,43,0.18)',
  },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', height: 24, paddingHorizontal: 10,
    borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 10,
  },
  headerBadgeText: {fontSize: 11, fontWeight: '700', color: colors.terracotta400, letterSpacing: 0.6},
  title: {fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5},
  sub: {fontSize: 14, color: colors.cream300, marginTop: 4},
  summaryRow: {flexDirection: 'row', gap: 10, marginTop: 18},
  summaryCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow.sm,
  },
  summaryCardWarm: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  summaryCardSage: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  summaryLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 0.7, textTransform: 'uppercase'},
  summaryValue: {fontSize: 24, fontWeight: '700', color: colors.ink900, marginTop: 6},
  summarySub: {fontSize: 11, color: colors.ink500, marginTop: 4, lineHeight: 15},
  section: {marginHorizontal: 16, marginBottom: 24},
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink400,
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Group cards
  groupCard: {
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  groupGold: {backgroundColor: colors.gold50, borderColor: colors.gold100},
  groupSage: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  groupCream: {backgroundColor: colors.cream100, borderColor: colors.border},
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  groupMeta: {fontSize: 12, color: colors.ink400, fontWeight: '600'},
  groupSub: {fontSize: 13, color: colors.ink500, marginBottom: 8},
  groupDesc: {fontSize: 12, color: colors.ink500, lineHeight: 17},
  groupActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    justifyContent: 'flex-end',
  },
  actionBtn: {flex: 1},
  progressTrack: {height: 4, borderRadius: 2, backgroundColor: colors.cream200, marginTop: 10},
  progressFill: {height: 4, borderRadius: 2, backgroundColor: colors.sage500},
  memberBubble: {
    alignItems: 'center', backgroundColor: colors.sage50,
    borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.sage100, minWidth: 64,
  },
  memberBubbleNum: {fontSize: 22, fontWeight: '700', color: colors.sage700, lineHeight: 26},
  memberBubbleLbl: {fontSize: 10, fontWeight: '600', color: colors.sage600, marginTop: 1},
  infoGrid: {
    flexDirection: 'row', borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, marginTop: 10, overflow: 'hidden',
    backgroundColor: colors.bgCard,
  },
  infoCell: {
    flex: 1, padding: 10, borderRightWidth: 1, borderRightColor: colors.border,
  },
  infoCellLabel: {fontSize: 10, fontWeight: '600', color: colors.ink400, letterSpacing: 0.5},
  infoCellVal: {fontSize: 14, fontWeight: '700', color: colors.ink900, marginTop: 3},
  groupHint: {fontSize: 12, color: colors.ink400, lineHeight: 16, marginTop: 8},
  // Bid cards
  bidCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    marginBottom: 10,
    ...shadow.md,
  },
  bidCardAccepted: {borderColor: colors.sage100, backgroundColor: colors.sage50},
  bidTop: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12},
  bidInfo: {flex: 1, marginRight: 12},
  bidToneChip: {alignSelf: 'flex-start', marginBottom: 8},
  bidTitle: {fontSize: 15, fontWeight: '600', color: colors.ink900},
  bidProvider: {fontSize: 13, color: colors.ink500, marginTop: 2},
  bidAmountCol: {alignItems: 'flex-end', gap: 4},
  bidAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.4,
  },
  statusChip: {height: 20},
  bidActions: {flexDirection: 'row', gap: 10, justifyContent: 'flex-end'},
  declineBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  acceptBtn: {flex: 1},
  emptyState: {
    marginHorizontal: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink900,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.ink400,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPad: {height: 32},
});
