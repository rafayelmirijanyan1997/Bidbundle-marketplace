import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  Megaphone, AlertCircle, BookOpen, Vote,
  Pin, Trash2, Plus, CheckCircle, Clock,
  ChevronDown, Rocket, XCircle, DollarSign,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  getAnnouncements, createAnnouncement, togglePin, deleteAnnouncement,
  getComplaints, updateComplaintStatus,
  getRules, createRule, deleteRule,
  getPolls, createPoll, closePoll, launchPollBid, getPollBids,
  acceptPollBid, declinePollBid,
  AnnouncementOut, ComplaintOut, RuleOut, PollOut, PollBidOut,
  SERVICE_CATEGORIES,
} from '../../api/hoaCommunity';

type Segment = 'announcements' | 'complaints' | 'rules' | 'polls';

const STATUS_COLORS: Record<string, string> = {
  open: '#DC2626',
  in_progress: colors.gold600,
  resolved: colors.sage700,
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In progress', resolved: 'Resolved',
};
const POLL_STATUS_COLORS: Record<string, string> = {
  open: colors.sage700,
  closed: colors.ink400,
  bid_launched: colors.terracotta600,
};
const POLL_STATUS_LABELS: Record<string, string> = {
  open: 'Voting open',
  closed: 'Closed',
  bid_launched: 'Bid launched',
};

export default function AdminHubScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [seg, setSeg] = useState<Segment>('announcements');
  const [refreshing, setRefreshing] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annSaving, setAnnSaving] = useState(false);

  // Complaints
  const [complaints, setComplaints] = useState<ComplaintOut[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Rules
  const [rules, setRules] = useState<RuleOut[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleSaving, setRuleSaving] = useState(false);

  // Polls
  const [polls, setPolls] = useState<PollOut[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [pollCategory, setPollCategory] = useState('Plumbing');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [pollBudgetMin, setPollBudgetMin] = useState('');
  const [pollBudgetMax, setPollBudgetMax] = useState('');
  const [pollDays, setPollDays] = useState('7');
  const [pollSaving, setPollSaving] = useState(false);
  const [expandedBids, setExpandedBids] = useState<Record<number, PollBidOut[]>>({});
  const [loadingBids, setLoadingBids] = useState<number | null>(null);
  const [actioningPoll, setActioningPoll] = useState<number | null>(null);
  const [actioningBid, setActioningBid] = useState<number | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    try { setAnnouncements(await getAnnouncements()); } catch {}
    finally { setAnnLoading(false); }
  }, []);

  const loadComplaints = useCallback(async () => {
    setCompLoading(true);
    try { setComplaints(await getComplaints(statusFilter)); } catch {}
    finally { setCompLoading(false); }
  }, [statusFilter]);

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    try { setRules(await getRules()); } catch {}
    finally { setRulesLoading(false); }
  }, []);

  const loadPolls = useCallback(async () => {
    setPollsLoading(true);
    try { setPolls(await getPolls()); } catch {}
    finally { setPollsLoading(false); }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadAnnouncements(), loadComplaints(), loadRules(), loadPolls()]);
    setRefreshing(false);
  }, [loadAnnouncements, loadComplaints, loadRules, loadPolls]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadComplaints(); }, [statusFilter]);

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  // Announcement handlers
  async function handleCreateAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) return;
    setAnnSaving(true);
    try {
      await createAnnouncement(annTitle.trim(), annBody.trim(), annPinned);
      setAnnTitle(''); setAnnBody(''); setAnnPinned(false);
      setShowAnnForm(false);
      await loadAnnouncements();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to post announcement');
    } finally { setAnnSaving(false); }
  }

  async function handleTogglePin(id: number) {
    try {
      const updated = await togglePin(id);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
    } catch {}
  }

  async function handleDeleteAnn(id: number, title: string) {
    Alert.alert('Delete announcement', `Delete "${title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAnnouncement(id);
          setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  async function handleComplaintStatus(id: number, newStatus: string) {
    try {
      const updated = await updateComplaintStatus(id, newStatus);
      setComplaints(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  async function handleCreateRule() {
    if (!ruleTitle.trim()) return;
    setRuleSaving(true);
    try {
      const r = await createRule(ruleTitle.trim(), ruleDesc.trim());
      setRules(prev => [...prev, r]);
      setRuleTitle(''); setRuleDesc(''); setShowRuleForm(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setRuleSaving(false); }
  }

  async function handleDeleteRule(id: number, title: string) {
    Alert.alert('Delete rule', `Delete rule "${title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteRule(id);
          setRules(prev => prev.filter(r => r.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  // Poll handlers
  async function handleCreatePoll() {
    if (!pollTitle.trim()) return;
    setPollSaving(true);
    try {
      const p = await createPoll(
        pollTitle.trim(), pollDesc.trim(), pollCategory,
        pollBudgetMin ? parseInt(pollBudgetMin, 10) : null,
        pollBudgetMax ? parseInt(pollBudgetMax, 10) : null,
        parseInt(pollDays, 10) || 7,
      );
      setPolls(prev => [p, ...prev]);
      setPollTitle(''); setPollDesc(''); setPollCategory('Plumbing');
      setPollBudgetMin(''); setPollBudgetMax(''); setPollDays('7');
      setShowPollForm(false);
    } catch (e: any) { Alert.alert('Error', e.message ?? 'Failed to create poll'); }
    finally { setPollSaving(false); }
  }

  async function handleClosePoll(id: number, title: string) {
    Alert.alert('Close voting', `Stop voting on "${title}"? Residents won't be able to vote after this.`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Close poll', style: 'destructive', onPress: async () => {
        setActioningPoll(id);
        try {
          const updated = await closePoll(id);
          setPolls(prev => prev.map(p => p.id === id ? updated : p));
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setActioningPoll(null); }
      }},
    ]);
  }

  async function handleLaunchBid(id: number, title: string) {
    Alert.alert('Launch community bid', `Open "${title}" for provider bids? Service providers will see this request and submit quotes. All residents will see the bids.`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Launch bid', onPress: async () => {
        setActioningPoll(id);
        try {
          const updated = await launchPollBid(id);
          setPolls(prev => prev.map(p => p.id === id ? updated : p));
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setActioningPoll(null); }
      }},
    ]);
  }

  async function handleToggleBids(poll: PollOut) {
    if (expandedBids[poll.id]) {
      setExpandedBids(prev => { const n = {...prev}; delete n[poll.id]; return n; });
      return;
    }
    setLoadingBids(poll.id);
    try {
      const bids = await getPollBids(poll.id);
      setExpandedBids(prev => ({...prev, [poll.id]: bids}));
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoadingBids(null); }
  }

  async function refreshPollBids(pollId: number) {
    const bids = await getPollBids(pollId);
    setExpandedBids(prev => ({...prev, [pollId]: bids}));
  }

  function handleAcceptBid(pollId: number, bidId: number, providerName: string) {
    Alert.alert('Accept bid', `Accept ${providerName}'s bid? They'll be notified they won, and all other bids on this request will be declined.`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Accept', onPress: async () => {
        setActioningBid(bidId);
        try {
          await acceptPollBid(bidId);
          await refreshPollBids(pollId);
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setActioningBid(null); }
      }},
    ]);
  }

  function handleDeclineBid(pollId: number, bidId: number, providerName: string) {
    Alert.alert('Decline bid', `Decline ${providerName}'s bid?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Decline', style: 'destructive', onPress: async () => {
        setActioningBid(bidId);
        try {
          await declinePollBid(bidId);
          await refreshPollBids(pollId);
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setActioningBid(null); }
      }},
    ]);
  }

  const openCount = complaints.filter(c => c.status === 'open').length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Community Hub</Text>
          <Text style={s.subtitle}>
            {announcements.length} post{announcements.length !== 1 ? 's' : ''}
            {openCount > 0 ? ` · ${openCount} open complaint${openCount !== 1 ? 's' : ''}` : ''}
            {polls.length > 0 ? ` · ${polls.filter(p => p.status === 'open').length} active poll${polls.filter(p => p.status === 'open').length !== 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      </View>

      {/* Segment control */}
      <View style={s.segWrap}>
        {(['announcements', 'complaints', 'rules', 'polls'] as Segment[]).map(k => (
          <TouchableOpacity
            key={k}
            style={[s.segBtn, seg === k && s.segBtnActive]}
            onPress={() => setSeg(k)}
            activeOpacity={0.8}>
            <Text style={[s.segLabel, seg === k && s.segLabelActive]} numberOfLines={1}>
              {k === 'announcements' ? 'Posts' : k === 'complaints' ? 'Issues' : k === 'rules' ? 'Rules' : 'Polls'}
            </Text>
            {k === 'complaints' && openCount > 0 && (
              <View style={s.badge}><Text style={s.badgeText}>{openCount}</Text></View>
            )}
            {k === 'polls' && polls.filter(p => p.status === 'open').length > 0 && (
              <View style={[s.badge, {backgroundColor: colors.sage700}]}>
                <Text style={s.badgeText}>{polls.filter(p => p.status === 'open').length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.body, {paddingBottom: tabBarHeight + 32}]}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}>

          {/* ── ANNOUNCEMENTS ── */}
          {seg === 'announcements' && (
            <>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAnnForm(v => !v)} activeOpacity={0.85}>
                <Plus size={15} color="#fff" strokeWidth={2.5} />
                <Text style={s.addBtnText}>New announcement</Text>
              </TouchableOpacity>
              {showAnnForm && (
                <View style={s.formCard}>
                  <Text style={s.formTitle}>Post an announcement</Text>
                  <TextInput style={s.inputSingle} placeholder="Title" placeholderTextColor={colors.ink300}
                    value={annTitle} onChangeText={setAnnTitle} />
                  <TextInput style={s.inputMulti} placeholder="Write your announcement…"
                    placeholderTextColor={colors.ink300} value={annBody} onChangeText={setAnnBody}
                    multiline numberOfLines={4} textAlignVertical="top" />
                  <View style={s.switchRow}>
                    <Text style={s.switchLabel}>Pin to top</Text>
                    <Switch value={annPinned} onValueChange={setAnnPinned}
                      trackColor={{true: colors.terracotta600, false: colors.cream200}} thumbColor="#fff" />
                  </View>
                  <TouchableOpacity
                    style={[s.submitBtn, (!annTitle.trim() || !annBody.trim() || annSaving) && s.submitBtnDisabled]}
                    onPress={handleCreateAnnouncement}
                    disabled={!annTitle.trim() || !annBody.trim() || annSaving} activeOpacity={0.85}>
                    {annSaving ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.submitBtnText}>Post announcement</Text>}
                  </TouchableOpacity>
                </View>
              )}
              {annLoading ? <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
                : announcements.length === 0
                  ? <EmptyState icon={<Megaphone size={28} color={colors.ink300} strokeWidth={1.5} />}
                      title="No announcements yet" sub="Post your first announcement to notify all residents." />
                  : announcements.map(a => (
                    <View key={a.id} style={[s.annCard, a.pinned && s.annCardPinned]}>
                      {a.pinned && (
                        <View style={s.pinnedBadge}>
                          <Pin size={10} color={colors.terracotta600} strokeWidth={2.5} />
                          <Text style={s.pinnedText}>Pinned</Text>
                        </View>
                      )}
                      <Text style={s.annTitle}>{a.title}</Text>
                      <Text style={s.annBody}>{a.body}</Text>
                      <Text style={s.annMeta}>Posted by {a.created_by_name} · {fmtDate(a.created_at)}</Text>
                      <View style={s.annActions}>
                        <TouchableOpacity style={s.annActionBtn} onPress={() => handleTogglePin(a.id)}>
                          <Pin size={13} color={a.pinned ? colors.terracotta600 : colors.ink400} strokeWidth={2} />
                          <Text style={[s.annActionText, a.pinned && {color: colors.terracotta600}]}>
                            {a.pinned ? 'Unpin' : 'Pin'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.annActionBtn} onPress={() => handleDeleteAnn(a.id, a.title)}>
                          <Trash2 size={13} color="#DC2626" strokeWidth={2} />
                          <Text style={[s.annActionText, {color: '#DC2626'}]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
            </>
          )}

          {/* ── COMPLAINTS ── */}
          {seg === 'complaints' && (
            <>
              <View style={s.filterRow}>
                {([undefined, 'open', 'in_progress', 'resolved'] as (string | undefined)[]).map(f => (
                  <TouchableOpacity key={f ?? 'all'}
                    style={[s.filterChip, statusFilter === f && s.filterChipActive]}
                    onPress={() => setStatusFilter(f)} activeOpacity={0.8}>
                    <Text style={[s.filterChipText, statusFilter === f && s.filterChipTextActive]}>
                      {f === undefined ? 'All' : STATUS_LABELS[f]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {compLoading ? <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
                : complaints.length === 0
                  ? <EmptyState icon={<AlertCircle size={28} color={colors.ink300} strokeWidth={1.5} />}
                      title="No complaints"
                      sub={statusFilter ? `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} complaints.` : 'No complaints raised yet.'} />
                  : complaints.map(c => (
                    <View key={c.id} style={s.complaintCard}>
                      <View style={s.complaintTop}>
                        <View style={[s.statusDot, {backgroundColor: STATUS_COLORS[c.status]}]} />
                        <Text style={s.complaintTitle}>{c.title}</Text>
                        <View style={s.catBadge}><Text style={s.catBadgeText}>{c.category}</Text></View>
                      </View>
                      <Text style={s.complaintDesc}>{c.description}</Text>
                      <Text style={s.complaintMeta}>
                        By {c.resident_name} · {fmtDate(c.created_at)}
                        {c.resolved_at ? ` · Resolved ${fmtDate(c.resolved_at)}` : ''}
                      </Text>
                      {c.status !== 'resolved' && (
                        <View style={s.complaintActions}>
                          {c.status === 'open' && (
                            <TouchableOpacity
                              style={[s.statusBtn, {borderColor: colors.gold500, backgroundColor: colors.gold50}]}
                              onPress={() => handleComplaintStatus(c.id, 'in_progress')}>
                              <Clock size={12} color={colors.gold600} strokeWidth={2} />
                              <Text style={[s.statusBtnText, {color: colors.gold600}]}>In progress</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[s.statusBtn, {borderColor: colors.sage100, backgroundColor: colors.sage50}]}
                            onPress={() => handleComplaintStatus(c.id, 'resolved')}>
                            <CheckCircle size={12} color={colors.sage700} strokeWidth={2} />
                            <Text style={[s.statusBtnText, {color: colors.sage700}]}>Resolve</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {c.status === 'resolved' && (
                        <View style={s.resolvedBadge}>
                          <CheckCircle size={12} color={colors.sage700} strokeWidth={2} />
                          <Text style={s.resolvedText}>Resolved</Text>
                        </View>
                      )}
                    </View>
                  ))}
            </>
          )}

          {/* ── RULES ── */}
          {seg === 'rules' && (
            <>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowRuleForm(v => !v)} activeOpacity={0.85}>
                <Plus size={15} color="#fff" strokeWidth={2.5} />
                <Text style={s.addBtnText}>Add rule</Text>
              </TouchableOpacity>
              {showRuleForm && (
                <View style={s.formCard}>
                  <Text style={s.formTitle}>New community rule</Text>
                  <TextInput style={s.inputSingle} placeholder="Rule title"
                    placeholderTextColor={colors.ink300} value={ruleTitle} onChangeText={setRuleTitle} />
                  <TextInput style={s.inputMulti} placeholder="Description (optional)"
                    placeholderTextColor={colors.ink300} value={ruleDesc} onChangeText={setRuleDesc}
                    multiline numberOfLines={3} textAlignVertical="top" />
                  <TouchableOpacity
                    style={[s.submitBtn, (!ruleTitle.trim() || ruleSaving) && s.submitBtnDisabled]}
                    onPress={handleCreateRule} disabled={!ruleTitle.trim() || ruleSaving} activeOpacity={0.85}>
                    {ruleSaving ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.submitBtnText}>Add rule</Text>}
                  </TouchableOpacity>
                </View>
              )}
              {rulesLoading ? <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
                : rules.length === 0
                  ? <EmptyState icon={<BookOpen size={28} color={colors.ink300} strokeWidth={1.5} />}
                      title="No rules yet" sub="Add your first community rule." />
                  : rules.map((r, i) => (
                    <View key={r.id} style={s.ruleCard}>
                      <View style={s.ruleNumber}><Text style={s.ruleNumberText}>{i + 1}</Text></View>
                      <View style={s.ruleBody}>
                        <Text style={s.ruleTitle}>{r.title}</Text>
                        {r.description ? <Text style={s.ruleDesc}>{r.description}</Text> : null}
                      </View>
                      <TouchableOpacity style={s.ruleDeleteBtn} onPress={() => handleDeleteRule(r.id, r.title)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Trash2 size={15} color={colors.ink300} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  ))}
            </>
          )}

          {/* ── POLLS ── */}
          {seg === 'polls' && (
            <>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowPollForm(v => !v)} activeOpacity={0.85}>
                <Plus size={15} color="#fff" strokeWidth={2.5} />
                <Text style={s.addBtnText}>New poll</Text>
              </TouchableOpacity>

              {showPollForm && (
                <View style={s.formCard}>
                  <Text style={s.formTitle}>Service interest poll</Text>
                  <Text style={s.formHint}>Ask residents if they need a service. Once enough vote Yes, you can launch a community bid.</Text>
                  <TextInput style={s.inputSingle} placeholder="e.g. Do we need HVAC inspection?"
                    placeholderTextColor={colors.ink300} value={pollTitle} onChangeText={setPollTitle} />
                  <TextInput style={s.inputMulti} placeholder="Describe the service (optional)"
                    placeholderTextColor={colors.ink300} value={pollDesc} onChangeText={setPollDesc}
                    multiline numberOfLines={3} textAlignVertical="top" />

                  {/* Category picker */}
                  <TouchableOpacity style={s.catPicker} onPress={() => setShowCatPicker(v => !v)} activeOpacity={0.8}>
                    <Text style={s.catPickerText}>{pollCategory}</Text>
                    <ChevronDown size={14} color={colors.ink400} strokeWidth={2} />
                  </TouchableOpacity>
                  {showCatPicker && (
                    <View style={s.catList}>
                      {SERVICE_CATEGORIES.map(cat => (
                        <TouchableOpacity key={cat}
                          style={[s.catOption, pollCategory === cat && s.catOptionActive]}
                          onPress={() => { setPollCategory(cat); setShowCatPicker(false); }}>
                          <Text style={[s.catOptionText, pollCategory === cat && s.catOptionTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Budget range (manager only) */}
                  <Text style={s.fieldLabel}>Budget estimate (optional)</Text>
                  <View style={s.budgetRow}>
                    <TextInput style={[s.inputSingle, {flex: 1, marginBottom: 0}]}
                      placeholder="Min $" placeholderTextColor={colors.ink300}
                      value={pollBudgetMin} onChangeText={setPollBudgetMin} keyboardType="numeric" />
                    <Text style={s.budgetDash}>–</Text>
                    <TextInput style={[s.inputSingle, {flex: 1, marginBottom: 0}]}
                      placeholder="Max $" placeholderTextColor={colors.ink300}
                      value={pollBudgetMax} onChangeText={setPollBudgetMax} keyboardType="numeric" />
                  </View>

                  {/* Close-in days */}
                  <Text style={[s.fieldLabel, {marginTop: 10}]}>Voting window</Text>
                  <View style={s.daysRow}>
                    {['3', '7', '14'].map(d => (
                      <TouchableOpacity key={d}
                        style={[s.dayChip, pollDays === d && s.dayChipActive]}
                        onPress={() => setPollDays(d)}>
                        <Text style={[s.dayChipText, pollDays === d && s.dayChipTextActive]}>{d} days</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[s.submitBtn, {marginTop: 14}, (!pollTitle.trim() || pollSaving) && s.submitBtnDisabled]}
                    onPress={handleCreatePoll} disabled={!pollTitle.trim() || pollSaving} activeOpacity={0.85}>
                    {pollSaving ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.submitBtnText}>Post poll</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {pollsLoading ? <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
                : polls.length === 0
                  ? <EmptyState icon={<Vote size={28} color={colors.ink300} strokeWidth={1.5} />}
                      title="No polls yet"
                      sub="Create a poll to find out which services your residents need before launching a community bid." />
                  : polls.map(p => {
                    const bids = expandedBids[p.id];
                    const yPct = p.total_votes > 0 ? (p.yes_count / p.total_votes) * 100 : 0;
                    const nPct = 100 - yPct;
                    const isActioning = actioningPoll === p.id;
                    return (
                      <View key={p.id} style={s.pollCard}>
                        {/* Header row */}
                        <View style={s.pollHeader}>
                          <View style={[s.pollStatusPill, {backgroundColor: POLL_STATUS_COLORS[p.status] + '18',
                            borderColor: POLL_STATUS_COLORS[p.status] + '40'}]}>
                            <Text style={[s.pollStatusText, {color: POLL_STATUS_COLORS[p.status]}]}>
                              {POLL_STATUS_LABELS[p.status]}
                            </Text>
                          </View>
                          <View style={s.pollCatPill}>
                            <Text style={s.pollCatText}>{p.category}</Text>
                          </View>
                        </View>

                        <Text style={s.pollTitle}>{p.title}</Text>
                        {p.description ? <Text style={s.pollDesc}>{p.description}</Text> : null}

                        {/* Budget (manager sees this) */}
                        {(p.budget_min || p.budget_max) && (
                          <View style={s.pollBudgetRow}>
                            <DollarSign size={12} color={colors.ink400} strokeWidth={2} />
                            <Text style={s.pollBudgetText}>
                              Budget estimate: ${p.budget_min?.toLocaleString() ?? '?'} – ${p.budget_max?.toLocaleString() ?? '?'}
                            </Text>
                          </View>
                        )}

                        {/* Vote bar */}
                        <View style={s.voteBar}>
                          <View style={[s.voteBarYes, {flex: yPct || 1}]} />
                          <View style={[s.voteBarNo, {flex: nPct || 1}]} />
                        </View>
                        <View style={s.voteLabels}>
                          <Text style={s.voteLabelYes}>✓ Yes — {p.yes_count}</Text>
                          <Text style={s.voteLabelNo}>{p.no_count} — No ✗</Text>
                        </View>
                        <Text style={s.pollMeta}>
                          {p.total_votes} vote{p.total_votes !== 1 ? 's' : ''} · Closes {fmtDate(p.closes_at)}
                        </Text>

                        {/* Manager actions */}
                        {isActioning ? (
                          <ActivityIndicator color={colors.terracotta600} style={{marginTop: 12}} />
                        ) : (
                          <View style={s.pollActions}>
                            {p.status === 'open' && (
                              <TouchableOpacity style={[s.pollActionBtn, s.pollActionClose]}
                                onPress={() => handleClosePoll(p.id, p.title)} activeOpacity={0.8}>
                                <XCircle size={13} color={colors.ink500} strokeWidth={2} />
                                <Text style={s.pollActionCloseText}>Close voting</Text>
                              </TouchableOpacity>
                            )}
                            {(p.status === 'open' || p.status === 'closed') && (
                              <TouchableOpacity style={[s.pollActionBtn, s.pollActionLaunch]}
                                onPress={() => handleLaunchBid(p.id, p.title)} activeOpacity={0.8}>
                                <Rocket size={13} color="#fff" strokeWidth={2} />
                                <Text style={s.pollActionLaunchText}>Launch bid</Text>
                              </TouchableOpacity>
                            )}
                            {p.status === 'bid_launched' && (
                              <TouchableOpacity style={[s.pollActionBtn, s.pollActionBids]}
                                onPress={() => handleToggleBids(p)} activeOpacity={0.8}>
                                <DollarSign size={13} color={colors.terracotta600} strokeWidth={2} />
                                <Text style={s.pollActionBidsText}>
                                  {bids ? 'Hide bids' : loadingBids === p.id ? 'Loading…' : `View bids${p.service_request_id ? '' : ''}`}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {/* Bid board */}
                        {bids && (
                          <View style={s.bidBoard}>
                            <Text style={s.bidBoardTitle}>Provider bids</Text>
                            {bids.length === 0 ? (
                              <Text style={s.bidBoardEmpty}>No bids submitted yet. Share this request with providers.</Text>
                            ) : bids.map((b, i) => (
                              <View key={b.bid_id} style={[s.bidRow, i < bids.length - 1 && s.bidRowBorder]}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <View style={s.bidRank}>
                                    <Text style={s.bidRankText}>{i + 1}</Text>
                                  </View>
                                  <View style={s.bidInfo}>
                                    <Text style={s.bidProvider}>{b.provider_name}</Text>
                                    <Text style={s.bidDays}>{b.estimated_days} day{b.estimated_days !== 1 ? 's' : ''}</Text>
                                  </View>
                                  <View style={s.bidAmount}>
                                    <Text style={s.bidAmountText}>${b.amount.toLocaleString()}</Text>
                                    <View style={[s.bidStatusPill, {
                                      backgroundColor: b.status === 'accepted' ? colors.sage50 : colors.cream100,
                                      borderColor: b.status === 'accepted' ? colors.sage100 : colors.border,
                                    }]}>
                                      <Text style={[s.bidStatusText, {
                                        color: b.status === 'accepted' ? colors.sage700 : colors.ink400,
                                      }]}>{b.status}</Text>
                                    </View>
                                  </View>
                                </View>

                                {b.status === 'pending' && (
                                  actioningBid === b.bid_id ? (
                                    <ActivityIndicator color={colors.terracotta600} style={{marginTop: 10}} />
                                  ) : (
                                    <View style={s.bidReviewActions}>
                                      <TouchableOpacity
                                        style={[s.bidReviewBtn, s.bidReviewDecline]}
                                        onPress={() => handleDeclineBid(p.id, b.bid_id, b.provider_name)}
                                        activeOpacity={0.8}>
                                        <XCircle size={13} color={colors.ink500} strokeWidth={2} />
                                        <Text style={s.bidReviewDeclineText}>Decline</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={[s.bidReviewBtn, s.bidReviewAccept]}
                                        onPress={() => handleAcceptBid(p.id, b.bid_id, b.provider_name)}
                                        activeOpacity={0.8}>
                                        <CheckCircle size={13} color="#fff" strokeWidth={2} />
                                        <Text style={s.bidReviewAcceptText}>Accept</Text>
                                      </TouchableOpacity>
                                    </View>
                                  )
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EmptyState({icon, title, sub}: {icon: React.ReactNode; title: string; sub: string}) {
  return (
    <View style={es.wrap}>
      <View style={es.iconWrap}>{icon}</View>
      <Text style={es.title}>{title}</Text>
      <Text style={es.sub}>{sub}</Text>
    </View>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

const es = StyleSheet.create({
  wrap: {paddingVertical: 40, alignItems: 'center'},
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.cream100, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: {fontSize: 17, fontWeight: '700', color: colors.ink700, marginBottom: 8},
  sub: {fontSize: 13, color: colors.ink400, textAlign: 'center', lineHeight: 19, maxWidth: 260},
});

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  header: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8},
  title: {fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5},
  subtitle: {fontSize: 13, color: colors.ink400, marginTop: 2},

  segWrap: {flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 4},
  segBtn: {
    flex: 1, paddingVertical: 9, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4,
  },
  segBtnActive: {backgroundColor: colors.warmDark, borderColor: colors.warmDark},
  segLabel: {fontSize: 12, fontWeight: '600', color: colors.ink500},
  segLabelActive: {color: '#FBF7F1'},
  badge: {
    backgroundColor: '#DC2626', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: {fontSize: 10, fontWeight: '800', color: '#fff'},

  body: {paddingHorizontal: 16, paddingTop: 12},

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingVertical: 12, paddingHorizontal: 20,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  addBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},

  formCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: 16,
    marginBottom: 16, ...shadow.sm,
  },
  formTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginBottom: 6},
  formHint: {fontSize: 13, color: colors.ink500, lineHeight: 18, marginBottom: 14},
  fieldLabel: {fontSize: 12, fontWeight: '700', color: colors.ink500, letterSpacing: 0.3, marginBottom: 6},
  inputSingle: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    height: 46, paddingHorizontal: 12, fontSize: 14, color: colors.ink900,
    backgroundColor: colors.bgApp, marginBottom: 10,
  },
  inputMulti: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    minHeight: 90, paddingHorizontal: 12, paddingTop: 10, fontSize: 14, color: colors.ink900,
    backgroundColor: colors.bgApp, marginBottom: 10, lineHeight: 20,
  },
  switchRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 2},
  switchLabel: {fontSize: 14, fontWeight: '600', color: colors.ink700},
  catPicker: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    height: 46, paddingHorizontal: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgApp, marginBottom: 10,
  },
  catPickerText: {fontSize: 14, color: colors.ink700, fontWeight: '600'},
  catList: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.bgCard, marginBottom: 10, overflow: 'hidden',
  },
  catOption: {paddingHorizontal: 14, paddingVertical: 11},
  catOptionActive: {backgroundColor: colors.terracotta50},
  catOptionText: {fontSize: 14, color: colors.ink700, fontWeight: '500'},
  catOptionTextActive: {color: colors.terracotta600, fontWeight: '700'},
  budgetRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10},
  budgetDash: {fontSize: 16, color: colors.ink400, fontWeight: '600'},
  daysRow: {flexDirection: 'row', gap: 8},
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  dayChipActive: {backgroundColor: colors.warmDark, borderColor: colors.warmDark},
  dayChipText: {fontSize: 13, fontWeight: '600', color: colors.ink500},
  dayChipTextActive: {color: '#FBF7F1'},
  submitBtn: {backgroundColor: colors.terracotta600, borderRadius: radius.pill, paddingVertical: 13, alignItems: 'center'},
  submitBtnDisabled: {opacity: 0.4},
  submitBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},

  // Announcements
  annCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12, ...shadow.sm,
  },
  annCardPinned: {borderColor: colors.terracotta100, backgroundColor: colors.terracotta50},
  pinnedBadge: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  pinnedText: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.5},
  annTitle: {fontSize: 16, fontWeight: '800', color: colors.ink900, marginBottom: 6},
  annBody: {fontSize: 14, color: colors.ink700, lineHeight: 21, marginBottom: 10},
  annMeta: {fontSize: 12, color: colors.ink400, marginBottom: 12},
  annActions: {flexDirection: 'row', gap: 16},
  annActionBtn: {flexDirection: 'row', alignItems: 'center', gap: 5},
  annActionText: {fontSize: 13, fontWeight: '600', color: colors.ink400},

  // Complaints
  filterRow: {flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap'},
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  filterChipActive: {backgroundColor: colors.warmDark, borderColor: colors.warmDark},
  filterChipText: {fontSize: 12, fontWeight: '600', color: colors.ink500},
  filterChipTextActive: {color: '#FBF7F1'},
  complaintCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12, ...shadow.sm,
  },
  complaintTop: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  statusDot: {width: 8, height: 8, borderRadius: 4, flexShrink: 0},
  complaintTitle: {flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink900},
  catBadge: {
    backgroundColor: colors.cream100, borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border,
  },
  catBadgeText: {fontSize: 11, fontWeight: '600', color: colors.ink500},
  complaintDesc: {fontSize: 13, color: colors.ink500, lineHeight: 19, marginBottom: 8},
  complaintMeta: {fontSize: 12, color: colors.ink400, marginBottom: 10},
  complaintActions: {flexDirection: 'row', gap: 8},
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7,
  },
  statusBtnText: {fontSize: 12, fontWeight: '700'},
  resolvedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.sage50, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: colors.sage100,
  },
  resolvedText: {fontSize: 12, fontWeight: '700', color: colors.sage700},

  // Rules
  ruleCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, marginBottom: 10, ...shadow.sm, gap: 12,
  },
  ruleNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.warmDark, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ruleNumberText: {fontSize: 13, fontWeight: '800', color: '#FBF7F1'},
  ruleBody: {flex: 1},
  ruleTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900, marginBottom: 3},
  ruleDesc: {fontSize: 13, color: colors.ink500, lineHeight: 18},
  ruleDeleteBtn: {padding: 4, flexShrink: 0},

  // Polls
  pollCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14, ...shadow.sm,
  },
  pollHeader: {flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10},
  pollStatusPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1,
  },
  pollStatusText: {fontSize: 11, fontWeight: '700'},
  pollCatPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border,
  },
  pollCatText: {fontSize: 11, fontWeight: '600', color: colors.ink500},
  pollTitle: {fontSize: 16, fontWeight: '800', color: colors.ink900, marginBottom: 4},
  pollDesc: {fontSize: 13, color: colors.ink500, lineHeight: 19, marginBottom: 8},
  pollBudgetRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12},
  pollBudgetText: {fontSize: 12, color: colors.ink500, fontWeight: '600'},
  voteBar: {flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6},
  voteBarYes: {backgroundColor: colors.sage600 ?? colors.sage700},
  voteBarNo: {backgroundColor: colors.cream200},
  voteLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  voteLabelYes: {fontSize: 12, fontWeight: '700', color: colors.sage700},
  voteLabelNo: {fontSize: 12, fontWeight: '700', color: colors.ink400},
  pollMeta: {fontSize: 12, color: colors.ink400, marginBottom: 12},
  pollActions: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  pollActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1,
  },
  pollActionClose: {borderColor: colors.border, backgroundColor: colors.bgApp},
  pollActionCloseText: {fontSize: 12, fontWeight: '700', color: colors.ink500},
  pollActionLaunch: {borderColor: colors.terracotta600, backgroundColor: colors.terracotta600},
  pollActionLaunchText: {fontSize: 12, fontWeight: '700', color: '#fff'},
  pollActionBids: {borderColor: colors.terracotta100, backgroundColor: colors.terracotta50},
  pollActionBidsText: {fontSize: 12, fontWeight: '700', color: colors.terracotta600},

  // Bid board
  bidBoard: {
    marginTop: 12, backgroundColor: colors.bgApp, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  bidBoardTitle: {
    fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  bidBoardEmpty: {fontSize: 13, color: colors.ink400, padding: 14, textAlign: 'center'},
  bidRow: {paddingHorizontal: 14, paddingVertical: 12, gap: 10},
  bidRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  bidRank: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.warmDark,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bidRankText: {fontSize: 11, fontWeight: '800', color: '#FBF7F1'},
  bidInfo: {flex: 1, marginLeft: 10},
  bidProvider: {fontSize: 14, fontWeight: '700', color: colors.ink900},
  bidDays: {fontSize: 12, color: colors.ink400, marginTop: 1},
  bidAmount: {alignItems: 'flex-end', gap: 4},
  bidAmountText: {fontSize: 16, fontWeight: '800', color: colors.ink900},
  bidStatusPill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, borderWidth: 1,
  },
  bidStatusText: {fontSize: 10, fontWeight: '700'},
  bidReviewActions: {flexDirection: 'row', gap: 8, marginTop: 10},
  bidReviewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1,
  },
  bidReviewDecline: {backgroundColor: colors.cream50, borderColor: colors.border},
  bidReviewDeclineText: {fontSize: 12, fontWeight: '700', color: colors.ink500},
  bidReviewAccept: {backgroundColor: colors.terracotta600, borderColor: colors.terracotta600},
  bidReviewAcceptText: {fontSize: 12, fontWeight: '700', color: '#fff'},
});
