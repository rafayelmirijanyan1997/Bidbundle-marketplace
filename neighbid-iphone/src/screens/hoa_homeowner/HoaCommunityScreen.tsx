import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  Megaphone, AlertCircle, BookOpen, Plus,
  Pin, Vote, DollarSign, ThumbsUp, ThumbsDown,
  ChevronDown,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  getAnnouncements, getMyComplaints, raiseComplaint, getRules,
  getPolls, votePoll, getPollBids,
  AnnouncementOut, ComplaintOut, RuleOut, PollOut, PollBidOut,
  COMPLAINT_CATEGORIES,
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
  closed: 'Voting closed',
  bid_launched: 'Bidding open',
};

export default function HoaCommunityScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [seg, setSeg] = useState<Segment>('announcements');
  const [refreshing, setRefreshing] = useState(false);

  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [annLoading, setAnnLoading] = useState(true);

  const [complaints, setComplaints] = useState<ComplaintOut[]>([]);
  const [compLoading, setCompLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCategory, setCCategory] = useState('General');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [cSaving, setCSaving] = useState(false);

  const [rules, setRules] = useState<RuleOut[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  const [polls, setPolls] = useState<PollOut[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [votingPoll, setVotingPoll] = useState<number | null>(null);
  const [expandedBids, setExpandedBids] = useState<Record<number, PollBidOut[]>>({});
  const [loadingBids, setLoadingBids] = useState<number | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    try { setAnnouncements(await getAnnouncements()); } catch {}
    finally { setAnnLoading(false); }
  }, []);

  const loadComplaints = useCallback(async () => {
    setCompLoading(true);
    try { setComplaints(await getMyComplaints()); } catch {}
    finally { setCompLoading(false); }
  }, []);

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

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  async function handleRaiseComplaint() {
    if (!cTitle.trim() || !cDesc.trim()) return;
    setCSaving(true);
    try {
      const c = await raiseComplaint(cTitle.trim(), cDesc.trim(), cCategory);
      setComplaints(prev => [c, ...prev]);
      setCTitle(''); setCDesc(''); setCCategory('General');
      setShowForm(false);
      setSeg('complaints');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit complaint');
    } finally { setCSaving(false); }
  }

  async function handleVote(pollId: number, vote: 'yes' | 'no') {
    setVotingPoll(pollId);
    try {
      const updated = await votePoll(pollId, vote);
      setPolls(prev => prev.map(p => p.id === pollId ? updated : p));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to record vote');
    } finally { setVotingPoll(null); }
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
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load bids');
    } finally { setLoadingBids(null); }
  }

  const pinned = announcements.filter(a => a.pinned);
  const unpinned = announcements.filter(a => !a.pinned);
  const openCount = complaints.filter(c => c.status === 'open').length;
  const openPollCount = polls.filter(p => p.status === 'open' && !p.my_vote).length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Community</Text>
        <Text style={s.subtitle}>
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          {' · '}{rules.length} rule{rules.length !== 1 ? 's' : ''}
          {polls.length > 0 ? ` · ${polls.length} poll${polls.length !== 1 ? 's' : ''}` : ''}
        </Text>
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
            {k === 'polls' && openPollCount > 0 && (
              <View style={[s.badge, {backgroundColor: colors.sage700}]}>
                <Text style={s.badgeText}>{openPollCount}</Text>
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
              {annLoading ? (
                <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
              ) : announcements.length === 0 ? (
                <EmptyState
                  icon={<Megaphone size={28} color={colors.ink300} strokeWidth={1.5} />}
                  title="No announcements yet"
                  sub="Your HOA manager hasn't posted any announcements. Check back soon." />
              ) : (
                <>
                  {pinned.length > 0 && (
                    <>
                      <Text style={s.sectionLabel}>PINNED</Text>
                      {pinned.map(a => <AnnouncementCard key={a.id} item={a} />)}
                    </>
                  )}
                  {unpinned.length > 0 && (
                    <>
                      {pinned.length > 0 && <Text style={s.sectionLabel}>RECENT</Text>}
                      {unpinned.map(a => <AnnouncementCard key={a.id} item={a} />)}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ── COMPLAINTS ── */}
          {seg === 'complaints' && (
            <>
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => setShowForm(v => !v)}
                activeOpacity={0.85}>
                <Plus size={15} color="#fff" strokeWidth={2.5} />
                <Text style={s.addBtnText}>Raise a complaint</Text>
              </TouchableOpacity>

              {showForm && (
                <View style={s.formCard}>
                  <Text style={s.formTitle}>New complaint</Text>
                  <TextInput
                    style={s.inputSingle}
                    placeholder="Short title"
                    placeholderTextColor={colors.ink300}
                    value={cTitle}
                    onChangeText={setCTitle}
                  />
                  <TextInput
                    style={s.inputMulti}
                    placeholder="Describe the issue in detail…"
                    placeholderTextColor={colors.ink300}
                    value={cDesc}
                    onChangeText={setCDesc}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={s.catPicker}
                    onPress={() => setShowCatPicker(v => !v)}
                    activeOpacity={0.8}>
                    <Text style={s.catPickerText}>{cCategory}</Text>
                    <ChevronDown size={14} color={colors.ink400} strokeWidth={2} />
                  </TouchableOpacity>
                  {showCatPicker && (
                    <View style={s.catList}>
                      {COMPLAINT_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat}
                          style={[s.catOption, cCategory === cat && s.catOptionActive]}
                          onPress={() => { setCCategory(cat); setShowCatPicker(false); }}>
                          <Text style={[s.catOptionText, cCategory === cat && s.catOptionTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={[s.submitBtn, (!cTitle.trim() || !cDesc.trim() || cSaving) && s.submitBtnDisabled]}
                    onPress={handleRaiseComplaint}
                    disabled={!cTitle.trim() || !cDesc.trim() || cSaving}
                    activeOpacity={0.85}>
                    {cSaving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.submitBtnText}>Submit complaint</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {compLoading ? (
                <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
              ) : complaints.length === 0 ? (
                <EmptyState
                  icon={<AlertCircle size={28} color={colors.ink300} strokeWidth={1.5} />}
                  title="No complaints raised"
                  sub="Use the button above to raise an issue with your HOA manager." />
              ) : complaints.map(c => (
                <View key={c.id} style={s.complaintCard}>
                  <View style={s.complaintTop}>
                    <View style={[s.statusDot, {backgroundColor: STATUS_COLORS[c.status]}]} />
                    <Text style={s.complaintTitle}>{c.title}</Text>
                    <View style={s.statusPill}>
                      <Text style={[s.statusPillText, {color: STATUS_COLORS[c.status]}]}>
                        {STATUS_LABELS[c.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.complaintDesc}>{c.description}</Text>
                  <View style={s.complaintFooter}>
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{c.category}</Text>
                    </View>
                    <Text style={s.complaintMeta}>{fmtDate(c.created_at)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* ── RULES ── */}
          {seg === 'rules' && (
            <>
              {rulesLoading ? (
                <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
              ) : rules.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={28} color={colors.ink300} strokeWidth={1.5} />}
                  title="No rules yet"
                  sub="Your HOA manager hasn't posted any community rules yet." />
              ) : (
                <>
                  <View style={s.rulesHeader}>
                    <BookOpen size={14} color={colors.ink400} strokeWidth={2} />
                    <Text style={s.rulesHeaderText}>{rules.length} community rule{rules.length !== 1 ? 's' : ''}</Text>
                  </View>
                  {rules.map((r, i) => (
                    <View key={r.id} style={s.ruleCard}>
                      <View style={s.ruleNumber}>
                        <Text style={s.ruleNumberText}>{i + 1}</Text>
                      </View>
                      <View style={s.ruleBody}>
                        <Text style={s.ruleTitle}>{r.title}</Text>
                        {r.description ? <Text style={s.ruleDesc}>{r.description}</Text> : null}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}

          {/* ── POLLS ── */}
          {seg === 'polls' && (
            <>
              {pollsLoading ? (
                <ActivityIndicator color={colors.terracotta600} style={{marginTop: 32}} />
              ) : polls.length === 0 ? (
                <EmptyState
                  icon={<Vote size={28} color={colors.ink300} strokeWidth={1.5} />}
                  title="No polls yet"
                  sub="Your HOA manager hasn't posted any polls. Check back when a service vote is underway." />
              ) : polls.map(p => {
                const isVoting = votingPoll === p.id;
                const bids = expandedBids[p.id];
                const yPct = p.total_votes > 0 ? (p.yes_count / p.total_votes) * 100 : 0;
                const nPct = 100 - yPct;
                return (
                  <View key={p.id} style={s.pollCard}>
                    {/* Status + category header */}
                    <View style={s.pollHeader}>
                      <View style={[s.pollStatusPill, {
                        backgroundColor: POLL_STATUS_COLORS[p.status] + '18',
                        borderColor: POLL_STATUS_COLORS[p.status] + '40',
                      }]}>
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

                    {/* Vote bar */}
                    <View style={s.voteBarWrap}>
                      <View style={[s.voteBarSeg, {flex: yPct || 1, backgroundColor: colors.sage700}]} />
                      <View style={[s.voteBarSeg, {flex: nPct || 1, backgroundColor: colors.cream200}]} />
                    </View>
                    <View style={s.voteLabels}>
                      <Text style={s.voteLabelYes}>✓ Yes — {p.yes_count}</Text>
                      <Text style={s.voteLabelNo}>{p.no_count} — No ✗</Text>
                    </View>
                    <Text style={s.pollMeta}>
                      {p.total_votes} vote{p.total_votes !== 1 ? 's' : ''} · Closes {fmtDate(p.closes_at)}
                    </Text>

                    {/* Voting buttons — only for open polls */}
                    {p.status === 'open' && (
                      p.my_vote ? (
                        <View style={s.votedRow}>
                          <View style={[s.votedBadge, {
                            backgroundColor: p.my_vote === 'yes' ? colors.sage50 : colors.cream100,
                            borderColor: p.my_vote === 'yes' ? colors.sage100 : colors.border,
                          }]}>
                            {p.my_vote === 'yes'
                              ? <ThumbsUp size={13} color={colors.sage700} strokeWidth={2} />
                              : <ThumbsDown size={13} color={colors.ink400} strokeWidth={2} />}
                            <Text style={[s.votedText, {
                              color: p.my_vote === 'yes' ? colors.sage700 : colors.ink500,
                            }]}>
                              You voted {p.my_vote === 'yes' ? 'Yes' : 'No'}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={s.voteButtons}>
                          {isVoting ? (
                            <ActivityIndicator color={colors.terracotta600} />
                          ) : (
                            <>
                              <TouchableOpacity
                                style={[s.voteBtn, s.voteBtnYes]}
                                onPress={() => handleVote(p.id, 'yes')}
                                activeOpacity={0.85}>
                                <ThumbsUp size={14} color="#fff" strokeWidth={2} />
                                <Text style={s.voteBtnYesText}>Yes, I need this</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[s.voteBtn, s.voteBtnNo]}
                                onPress={() => handleVote(p.id, 'no')}
                                activeOpacity={0.85}>
                                <ThumbsDown size={14} color={colors.ink500} strokeWidth={2} />
                                <Text style={s.voteBtnNoText}>Not for me</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      )
                    )}

                    {/* Voted confirmation for closed polls */}
                    {p.status !== 'open' && p.my_vote && (
                      <View style={s.votedRow}>
                        <View style={[s.votedBadge, {
                          backgroundColor: p.my_vote === 'yes' ? colors.sage50 : colors.cream100,
                          borderColor: p.my_vote === 'yes' ? colors.sage100 : colors.border,
                        }]}>
                          {p.my_vote === 'yes'
                            ? <ThumbsUp size={13} color={colors.sage700} strokeWidth={2} />
                            : <ThumbsDown size={13} color={colors.ink400} strokeWidth={2} />}
                          <Text style={[s.votedText, {
                            color: p.my_vote === 'yes' ? colors.sage700 : colors.ink500,
                          }]}>
                            You voted {p.my_vote === 'yes' ? 'Yes' : 'No'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Bid board toggle — for bid_launched polls */}
                    {p.status === 'bid_launched' && (
                      <TouchableOpacity
                        style={s.viewBidsBtn}
                        onPress={() => handleToggleBids(p)}
                        activeOpacity={0.85}>
                        <DollarSign size={13} color={colors.terracotta600} strokeWidth={2} />
                        <Text style={s.viewBidsBtnText}>
                          {loadingBids === p.id ? 'Loading…' : bids ? 'Hide bids' : 'View provider bids'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Bid board */}
                    {bids && (
                      <View style={s.bidBoard}>
                        <Text style={s.bidBoardTitle}>PROVIDER BIDS</Text>
                        {bids.length === 0 ? (
                          <Text style={s.bidBoardEmpty}>No provider bids yet. Check back soon.</Text>
                        ) : bids.map((b, i) => (
                          <View key={b.bid_id} style={[s.bidRow, i < bids.length - 1 && s.bidRowBorder]}>
                            <View style={[s.bidRank, i === 0 && s.bidRankFirst]}>
                              <Text style={[s.bidRankText, i === 0 && s.bidRankTextFirst]}>{i + 1}</Text>
                            </View>
                            <View style={s.bidInfo}>
                              <Text style={s.bidProvider}>{b.provider_name}</Text>
                              <Text style={s.bidDays}>{b.estimated_days} day{b.estimated_days !== 1 ? 's' : ''}</Text>
                            </View>
                            <View style={s.bidRight}>
                              <Text style={[s.bidAmount, i === 0 && s.bidAmountFirst]}>
                                ${b.amount.toLocaleString()}
                              </Text>
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

function AnnouncementCard({item}: {item: AnnouncementOut}) {
  return (
    <View style={[ac.card, item.pinned && ac.cardPinned]}>
      {item.pinned && (
        <View style={ac.pinnedRow}>
          <Pin size={10} color={colors.terracotta600} strokeWidth={2.5} />
          <Text style={ac.pinnedText}>Pinned</Text>
        </View>
      )}
      <Text style={ac.title}>{item.title}</Text>
      <Text style={ac.body}>{item.body}</Text>
      <Text style={ac.meta}>{fmtDate(item.created_at)}</Text>
    </View>
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

const ac = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 12, ...shadow.sm,
  },
  cardPinned: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  pinnedRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  pinnedText: {fontSize: 11, fontWeight: '700', color: colors.terracotta600},
  title: {fontSize: 16, fontWeight: '800', color: colors.ink900, marginBottom: 6},
  body: {fontSize: 14, color: colors.ink700, lineHeight: 21, marginBottom: 10},
  meta: {fontSize: 12, color: colors.ink400},
});

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
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 1.2,
    marginBottom: 10, marginTop: 4,
  },

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
  formTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginBottom: 12},
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
  catOption: {paddingHorizontal: 14, paddingVertical: 12},
  catOptionActive: {backgroundColor: colors.terracotta50},
  catOptionText: {fontSize: 14, color: colors.ink700, fontWeight: '500'},
  catOptionTextActive: {color: colors.terracotta600, fontWeight: '700'},
  submitBtn: {
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingVertical: 13, alignItems: 'center',
  },
  submitBtnDisabled: {opacity: 0.4},
  submitBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},

  complaintCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 12, ...shadow.sm,
  },
  complaintTop: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  statusDot: {width: 8, height: 8, borderRadius: 4, flexShrink: 0},
  complaintTitle: {flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink900},
  statusPill: {
    backgroundColor: colors.cream100, borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border,
  },
  statusPillText: {fontSize: 11, fontWeight: '700'},
  complaintDesc: {fontSize: 13, color: colors.ink500, lineHeight: 19, marginBottom: 10},
  complaintFooter: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  catBadge: {
    backgroundColor: colors.cream100, borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border,
  },
  catBadgeText: {fontSize: 11, fontWeight: '600', color: colors.ink500},
  complaintMeta: {fontSize: 12, color: colors.ink400},

  rulesHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
  },
  rulesHeaderText: {fontSize: 13, fontWeight: '600', color: colors.ink400},
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

  // Polls
  pollCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14, ...shadow.sm,
  },
  pollHeader: {flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10},
  pollStatusPill: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1},
  pollStatusText: {fontSize: 11, fontWeight: '700'},
  pollCatPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border,
  },
  pollCatText: {fontSize: 11, fontWeight: '600', color: colors.ink500},
  pollTitle: {fontSize: 16, fontWeight: '800', color: colors.ink900, marginBottom: 4},
  pollDesc: {fontSize: 13, color: colors.ink500, lineHeight: 19, marginBottom: 10},
  voteBarWrap: {flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6},
  voteBarSeg: {},
  voteLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  voteLabelYes: {fontSize: 12, fontWeight: '700', color: colors.sage700},
  voteLabelNo: {fontSize: 12, fontWeight: '700', color: colors.ink400},
  pollMeta: {fontSize: 12, color: colors.ink400, marginBottom: 14},

  // Voting buttons
  voteButtons: {flexDirection: 'row', gap: 10},
  voteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1,
  },
  voteBtnYes: {backgroundColor: colors.sage700, borderColor: colors.sage700},
  voteBtnNo: {backgroundColor: colors.bgApp, borderColor: colors.border},
  voteBtnYesText: {fontSize: 13, fontWeight: '700', color: '#fff'},
  voteBtnNoText: {fontSize: 13, fontWeight: '700', color: colors.ink500},

  // Voted confirmation
  votedRow: {marginTop: 2},
  votedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  votedText: {fontSize: 13, fontWeight: '700'},

  // View bids button
  viewBidsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12,
    borderWidth: 1, borderColor: colors.terracotta100, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 9, backgroundColor: colors.terracotta50,
    alignSelf: 'flex-start',
  },
  viewBidsBtnText: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},

  // Bid board
  bidBoard: {
    marginTop: 12, backgroundColor: colors.bgApp, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  bidBoardTitle: {
    fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  bidBoardEmpty: {fontSize: 13, color: colors.ink400, padding: 14, textAlign: 'center'},
  bidRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10},
  bidRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  bidRank: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.warmDark,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bidRankFirst: {backgroundColor: colors.terracotta600},
  bidRankText: {fontSize: 11, fontWeight: '800', color: '#FBF7F1'},
  bidRankTextFirst: {color: '#fff'},
  bidInfo: {flex: 1},
  bidProvider: {fontSize: 14, fontWeight: '700', color: colors.ink900},
  bidDays: {fontSize: 12, color: colors.ink400, marginTop: 1},
  bidRight: {alignItems: 'flex-end', gap: 4},
  bidAmount: {fontSize: 16, fontWeight: '800', color: colors.ink900},
  bidAmountFirst: {color: colors.terracotta600},
  bidStatusPill: {paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, borderWidth: 1},
  bidStatusText: {fontSize: 10, fontWeight: '700'},
});
