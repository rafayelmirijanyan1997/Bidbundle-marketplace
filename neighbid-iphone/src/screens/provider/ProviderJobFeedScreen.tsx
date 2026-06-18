import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, Modal, TextInput, ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Sparkles, Users, MapPin, Filter, X, Calendar,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {providerApi, JobFeedItem, BidDraftResult} from '../../api/provider';
import {Button} from '../../components/Button';
import {Chip} from '../../components/Chip';
import {ServiceCategoryBadge} from '../../components/ServiceCategoryBadge';

const CATEGORY_FILTERS = ['All', 'Plumbing', 'Lawn', 'HVAC', 'Electrical', 'Cleaning', 'Gutter', 'Handyman'];

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

function nextWorkDays(n: number): string[] {
  const days: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  for (let i = 0; i < n; i++) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function ProviderJobFeedScreen() {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [draftJob, setDraftJob] = useState<JobFeedItem | null>(null);
  const [draft, setDraft] = useState<BidDraftResult | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [draftText, setDraftText] = useState('');
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const feed = await providerApi.getJobFeed();
      setJobs(feed);
    } catch (e: any) {console.warn('Job feed error:', e.message);}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useEffect(() => {load();}, [load]);

  const filteredJobs = activeFilter === 'All'
    ? jobs
    : jobs.filter(j => j.category.toLowerCase().includes(activeFilter.toLowerCase()));

  async function openDraft(job: JobFeedItem) {
    setDraftJob(job);
    setDraftLoading(true);
    setDraft(null);
    setAmount('');
    setDraftText('');
    setWorkDays([]);
    const reqId = job.primary_request_id ?? job.id;
    try {
      const result = await providerApi.draftBid(reqId);
      setDraft(result);
      setAmount(String(Math.round(result.suggested_amount_cents / 100)));
      setDraftText(result.draft_text);
      setWorkDays(nextWorkDays(result.suggested_days));
    } catch {
      setAmount('');
      setDraftText('');
      setWorkDays(nextWorkDays(2));
    } finally {setDraftLoading(false);}
  }

  async function submitBid() {
    if (!draftJob || !amount.trim()) {return;}
    const reqId = draftJob.primary_request_id ?? draftJob.id;
    const cents = Math.round(parseFloat(amount) * 100);
    if (cents <= 0 || workDays.length === 0) {
      Alert.alert('Missing info', 'Enter a valid amount and at least one work day.');
      return;
    }
    setSubmitting(true);
    try {
      await providerApi.submitBid(reqId, cents, workDays.length, workDays);
      setJobs(prev => prev.map(j => j.id === draftJob.id ? {...j, bid_count: j.bid_count + 1} : j));
      Alert.alert('Bid submitted!', 'Your bid has been sent. The homeowner will be notified.', [
        {text: 'OK', onPress: () => setDraftJob(null)},
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit bid.');
    } finally {setSubmitting(false);}
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Bid draft modal */}
      <Modal
        visible={!!draftJob}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDraftJob(null)}>
        {draftJob && (
          <SafeAreaView style={s.modalSafe} edges={['top']}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle} numberOfLines={2}>{draftJob.title}</Text>
              <TouchableOpacity onPress={() => setDraftJob(null)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <X size={22} color={colors.ink500} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
              {/* Job summary */}
              <View style={s.jobSummary}>
                {draftJob.is_group && (
                  <View style={s.groupBadge}>
                    <Users size={13} color={colors.sage700} strokeWidth={2} />
                    <Text style={s.groupBadgeText}>{neighbourLabel(draftJob.member_count)} · Group deal</Text>
                  </View>
                )}
                <View style={s.summaryRow}>
                  <MapPin size={13} color={colors.ink400} strokeWidth={2} />
                  <Text style={s.summaryText}>
                    {draftJob.neighborhood}{draftJob.distance_mi ? ` · ${draftJob.distance_mi} mi away` : ''}
                  </Text>
                </View>
                <View style={s.summaryBudget}>
                  <Text style={s.summaryBudgetLabel}>Budget range</Text>
                  <Text style={s.summaryBudgetVal}>
                    ${Math.round(draftJob.budget_min / 100).toLocaleString()}–${Math.round(draftJob.budget_max / 100).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* AI draft */}
              {draft && !draft.stub && (
                <View style={s.aiDraftCard}>
                  <View style={s.aiDraftHeader}>
                    <Sparkles size={13} color={colors.terracotta600} strokeWidth={2} />
                    <Text style={s.aiDraftLabel}>AI Bid Draft · {draft.headline}</Text>
                    <Chip label={draft.confidence} tone={draft.confidence === 'high' ? 'sage' : 'gold'} style={{height: 18}} />
                  </View>
                </View>
              )}

              {draftLoading && (
                <View style={s.draftLoading}>
                  <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
                  <Text style={s.draftLoadingText}>AI drafting your bid…</Text>
                </View>
              )}

              {/* Amount */}
              <Text style={s.fieldLabel}>BID AMOUNT ($)</Text>
              <View style={s.amountRow}>
                <Text style={s.amountPrefix}>$</Text>
                <TextInput
                  style={s.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.ink300}
                />
              </View>

              {/* Work days */}
              <Text style={s.fieldLabel}>PROPOSED WORK DAYS</Text>
              {workDays.map((day, i) => (
                <View key={i} style={s.workDayRow}>
                  <Calendar size={14} color={colors.ink400} strokeWidth={2} />
                  <Text style={s.workDayText}>{new Date(day + 'T12:00:00').toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}</Text>
                  <TouchableOpacity onPress={() => setWorkDays(prev => prev.filter((_, j) => j !== i))}>
                    <X size={14} color={colors.ink300} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setWorkDays(prev => [...prev, nextWorkDays(prev.length + 1)[prev.length]])}
                style={s.addDayBtn}>
                <Text style={s.addDayText}>+ Add another day</Text>
              </TouchableOpacity>

              {/* Proposal text */}
              <Text style={s.fieldLabel}>PROPOSAL</Text>
              <TextInput
                style={s.proposalInput}
                value={draftText}
                onChangeText={setDraftText}
                placeholder="Describe your approach, timeline, and what's included..."
                placeholderTextColor={colors.ink300}
                multiline
              />

              <Button
                label={submitting ? 'Submitting…' : 'Submit bid'}
                onPress={submitBid}
                loading={submitting}
                disabled={!amount.trim() || workDays.length === 0}
                style={{marginTop: 16}}
              />
              <View style={{height: 32}} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Job feed</Text>
        <Text style={s.sub}>{filteredJobs.length} nearby group request{filteredJobs.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {CATEGORY_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[s.filterChip, activeFilter === f && s.filterChipActive]}>
            <Text style={[s.filterChipText, activeFilter === f && s.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredJobs}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={colors.terracotta600} />}
        contentContainerStyle={s.listContent}
        renderItem={({item, index}) => (
          <View style={[s.jobCard, index === 0 && s.jobCardFeatured]}>
            {index === 0 && (
              <View style={s.featuredBanner}>
                <Text style={s.featuredBannerText}>● Closest match</Text>
                {item.is_group && <Text style={s.featuredGroupText}>· {neighbourLabel(item.member_count)} · Group deal</Text>}
              </View>
            )}
            <View style={s.jobCardBody}>
              <ServiceCategoryBadge category={item.category} size={44} />
              <View style={s.jobInfo}>
                <Text style={s.jobTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.jobMeta}>
                  {item.neighborhood}{item.distance_mi ? ` · ${item.distance_mi} mi away` : ''} · {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
                </Text>
                <View style={s.jobChips}>
                  {item.is_group && <Chip label={neighbourLabel(item.member_count)} tone="sage" style={{height: 20}} />}
                  <Chip label={item.category} tone="neutral" style={{height: 20}} />
                </View>
              </View>
              <View style={s.jobRight}>
                <Text style={s.jobBudget}>
                  ${Math.round(item.budget_min / 100).toLocaleString()}–${Math.round(item.budget_max / 100).toLocaleString()}
                </Text>
                <Text style={s.jobBudgetLabel}>bid range</Text>
                <TouchableOpacity
                  onPress={() => openDraft(item)}
                  style={s.draftBtn}>
                  <Sparkles size={12} color="#fff" strokeWidth={2.5} />
                  <Text style={s.draftBtnText}>Draft bid</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>No group jobs yet</Text>
              <Text style={s.emptySub}>Group jobs appear here once all homeowners in a group approve sending to providers.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  header: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8},
  title: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
  sub: {fontSize: 13, color: colors.ink400, marginTop: 2},
  filterScroll: {flexGrow: 0, marginBottom: 8},
  filterContent: {paddingHorizontal: 16, gap: 8, paddingVertical: 4},
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: {backgroundColor: colors.ink900, borderColor: colors.ink900},
  filterChipText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  filterChipTextActive: {color: '#fff'},
  listContent: {paddingHorizontal: 16, paddingBottom: 32, gap: 10},

  jobCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm, overflow: 'hidden',
  },
  jobCardFeatured: {
    borderColor: colors.terracotta100,
    backgroundColor: colors.terracotta50,
  },
  featuredBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.terracotta50, paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.terracotta100, gap: 6,
  },
  featuredBannerText: {fontSize: 12, fontWeight: '700', color: colors.terracotta600},
  featuredGroupText: {fontSize: 12, color: colors.sage700, fontWeight: '600'},
  jobCardBody: {flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12},
  jobAvatar: {width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  jobAvatarText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  jobInfo: {flex: 1},
  jobTitle: {fontSize: 15, fontWeight: '600', color: colors.ink900, lineHeight: 20},
  jobMeta: {fontSize: 12, color: colors.ink400, marginTop: 3},
  jobChips: {flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap'},
  jobRight: {alignItems: 'flex-end', gap: 4},
  jobBudget: {fontSize: 14, fontWeight: '700', color: colors.ink900},
  jobBudgetLabel: {fontSize: 10, color: colors.ink400},
  draftBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.terracotta600, paddingHorizontal: 10,
    height: 30, borderRadius: radius.pill, marginTop: 4,
  },
  draftBtnText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  emptyState: {alignItems: 'center', paddingTop: 60, gap: 10},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 14, color: colors.ink400, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20},

  // Modal
  modalSafe: {flex: 1, backgroundColor: colors.bgApp},
  modalHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard,
  },
  modalTitle: {flex: 1, fontSize: 18, fontWeight: '700', color: colors.ink900},
  modalBody: {padding: 20},
  jobSummary: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16, ...shadow.sm,
  },
  groupBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.sage50, borderRadius: radius.pill,
    paddingHorizontal: 10, height: 26, alignSelf: 'flex-start', marginBottom: 8,
  },
  groupBadgeText: {fontSize: 12, fontWeight: '700', color: colors.sage700},
  summaryRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8},
  summaryText: {fontSize: 13, color: colors.ink500},
  summaryBudget: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  summaryBudgetLabel: {fontSize: 11, fontWeight: '600', color: colors.ink400},
  summaryBudgetVal: {fontSize: 18, fontWeight: '700', color: colors.terracotta600},
  aiDraftCard: {
    backgroundColor: colors.terracotta50, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.terracotta100, padding: 12, marginBottom: 16,
  },
  aiDraftHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  aiDraftLabel: {fontSize: 12, fontWeight: '600', color: colors.terracotta600, flex: 1},
  draftLoading: {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginBottom: 16},
  draftLoadingText: {fontSize: 14, color: colors.terracotta600},
  fieldLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 8, marginTop: 14},
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, height: 54,
  },
  amountPrefix: {fontSize: 20, fontWeight: '700', color: colors.ink500, marginRight: 6},
  amountInput: {flex: 1, fontSize: 28, fontWeight: '700', color: colors.ink900},
  workDayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: 12, marginBottom: 6,
  },
  workDayText: {flex: 1, fontSize: 14, color: colors.ink900},
  addDayBtn: {paddingVertical: 8},
  addDayText: {fontSize: 14, color: colors.terracotta600, fontWeight: '600'},
  proposalInput: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, minHeight: 120, padding: 14,
    fontSize: 14, color: colors.ink900, lineHeight: 21, textAlignVertical: 'top',
  },
});
