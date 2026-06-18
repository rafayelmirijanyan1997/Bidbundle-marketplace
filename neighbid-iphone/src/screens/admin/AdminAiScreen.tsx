import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Sparkles, Megaphone, TrendingUp, RefreshCw, Send, ChevronDown, ChevronUp} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  getDigest, composeAnnouncement, getOpportunities,
  DigestResponse, AnnouncementResponse, OpportunitiesResponse,
} from '../../api/hoaAi';

type SectionKey = 'digest' | 'announce' | 'opportunities';

export default function AdminAiScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [expanded, setExpanded] = useState<SectionKey | null>('digest');

  // Digest
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  // Announcement
  const [roughText, setRoughText] = useState('');
  const [announcement, setAnnouncement] = useState<AnnouncementResponse | null>(null);
  const [announceLoading, setAnnounceLoading] = useState(false);

  // Opportunities
  const [opps, setOpps] = useState<OpportunitiesResponse | null>(null);
  const [oppsLoading, setOppsLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const loadDigest = useCallback(async () => {
    setDigestLoading(true);
    try {setDigest(await getDigest());} catch {}
    finally {setDigestLoading(false);}
  }, []);

  const loadOpportunities = useCallback(async () => {
    setOppsLoading(true);
    try {setOpps(await getOpportunities());} catch {}
    finally {setOppsLoading(false);}
  }, []);

  useEffect(() => {loadDigest(); loadOpportunities();}, [loadDigest, loadOpportunities]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDigest(), loadOpportunities()]);
    setRefreshing(false);
  };

  async function handleCompose() {
    if (!roughText.trim()) return;
    setAnnounceLoading(true);
    try {setAnnouncement(await composeAnnouncement(roughText));} catch {}
    finally {setAnnounceLoading(false);}
  }

  function toggle(key: SectionKey) {
    setExpanded(prev => (prev === key ? null : key));
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: tabBarHeight + 36}}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}>

          {/* ── Title ── */}
          <View style={s.titleRow}>
            <View>
              <Text style={s.title}>AI Tools</Text>
              <Text style={s.subtitle}>Powered by BidBundle AI</Text>
            </View>
            <View style={s.titleBadge}>
              <Sparkles size={16} color={colors.gold600} strokeWidth={2} />
            </View>
          </View>

          {/* ── Community Digest ── */}
          <View style={s.card}>
            <TouchableOpacity style={s.cardHeader} onPress={() => toggle('digest')} activeOpacity={0.8}>
              <View style={[s.cardIconWrap, {backgroundColor: colors.terracotta50}]}>
                <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
              </View>
              <View style={s.cardHeaderText}>
                <Text style={s.cardTitle}>Community Digest</Text>
                <Text style={s.cardSub}>Weekly AI summary of your community</Text>
              </View>
              {expanded === 'digest'
                ? <ChevronUp size={18} color={colors.ink400} strokeWidth={2} />
                : <ChevronDown size={18} color={colors.ink400} strokeWidth={2} />}
            </TouchableOpacity>

            {expanded === 'digest' && (
              <View style={s.cardBody}>
                <View style={s.divider} />
                {digestLoading ? (
                  <View style={s.center}><ActivityIndicator color={colors.terracotta600} /></View>
                ) : digest ? (
                  <>
                    <View style={s.digestStatRow}>
                      <View style={[s.digestStat, {backgroundColor: colors.sky50, borderColor: colors.sky600 + '30'}]}>
                        <Text style={[s.digestStatVal, {color: colors.sky600}]}>{digest.member_count}</Text>
                        <Text style={s.digestStatLabel}>Residents</Text>
                      </View>
                      <View style={[s.digestStat, {backgroundColor: colors.gold50, borderColor: colors.gold600 + '30'}]}>
                        <Text style={[s.digestStatVal, {color: colors.gold600}]}>{digest.active_request_count}</Text>
                        <Text style={s.digestStatLabel}>Active requests</Text>
                      </View>
                      {digest.top_category ? (
                        <View style={[s.digestStat, {backgroundColor: colors.sage50, borderColor: colors.sage100}]}>
                          <Text style={[s.digestStatVal, {color: colors.sage700, fontSize: 13}]} numberOfLines={1}>{digest.top_category}</Text>
                          <Text style={s.digestStatLabel}>Top category</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={s.digestTextWrap}>
                      <Text style={s.digestText}>{digest.digest}</Text>
                    </View>
                    <TouchableOpacity style={s.refreshBtn} onPress={loadDigest} activeOpacity={0.8}>
                      <RefreshCw size={14} color={colors.terracotta600} strokeWidth={2} />
                      <Text style={s.refreshBtnText}>Regenerate digest</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>Could not load digest. Pull to refresh.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Announcement Composer ── */}
          <View style={s.card}>
            <TouchableOpacity style={s.cardHeader} onPress={() => toggle('announce')} activeOpacity={0.8}>
              <View style={[s.cardIconWrap, {backgroundColor: colors.sky50}]}>
                <Megaphone size={16} color={colors.sky600} strokeWidth={2} />
              </View>
              <View style={s.cardHeaderText}>
                <Text style={s.cardTitle}>Announcement Composer</Text>
                <Text style={s.cardSub}>Turn rough notes into polished messages</Text>
              </View>
              {expanded === 'announce'
                ? <ChevronUp size={18} color={colors.ink400} strokeWidth={2} />
                : <ChevronDown size={18} color={colors.ink400} strokeWidth={2} />}
            </TouchableOpacity>

            {expanded === 'announce' && (
              <View style={s.cardBody}>
                <View style={s.divider} />
                <Text style={s.inputLabel}>Your rough notes</Text>
                <TextInput
                  style={s.textInput}
                  multiline
                  numberOfLines={4}
                  placeholder="e.g. remind everyone about parking on Thursday for landscaping crew..."
                  placeholderTextColor={colors.ink300}
                  value={roughText}
                  onChangeText={setRoughText}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[s.composeBtn, (!roughText.trim() || announceLoading) && s.composeBtnDisabled]}
                  onPress={handleCompose}
                  activeOpacity={0.85}
                  disabled={!roughText.trim() || announceLoading}>
                  {announceLoading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <>
                        <Send size={14} color="#fff" strokeWidth={2} />
                        <Text style={s.composeBtnText}>Compose announcement</Text>
                      </>}
                </TouchableOpacity>

                {announcement && (
                  <View style={s.resultCard}>
                    <View style={s.resultSubjectRow}>
                      <Text style={s.resultEyebrow}>SUBJECT</Text>
                      <Text style={s.resultSubject}>{announcement.subject_line}</Text>
                    </View>
                    <View style={s.resultDivider} />
                    <Text style={s.resultEyebrow}>ANNOUNCEMENT</Text>
                    <Text style={s.resultBody}>{announcement.announcement}</Text>
                    <TouchableOpacity
                      style={s.clearBtn}
                      onPress={() => {setAnnouncement(null); setRoughText('');}}>
                      <Text style={s.clearBtnText}>Clear and write another</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Savings Opportunities ── */}
          <View style={s.card}>
            <TouchableOpacity style={s.cardHeader} onPress={() => toggle('opportunities')} activeOpacity={0.8}>
              <View style={[s.cardIconWrap, {backgroundColor: colors.sage50}]}>
                <TrendingUp size={16} color={colors.sage700} strokeWidth={2} />
              </View>
              <View style={s.cardHeaderText}>
                <Text style={s.cardTitle}>Savings Opportunities</Text>
                <Text style={s.cardSub}>AI-identified group-bid opportunities</Text>
              </View>
              {expanded === 'opportunities'
                ? <ChevronUp size={18} color={colors.ink400} strokeWidth={2} />
                : <ChevronDown size={18} color={colors.ink400} strokeWidth={2} />}
            </TouchableOpacity>

            {expanded === 'opportunities' && (
              <View style={s.cardBody}>
                <View style={s.divider} />
                {oppsLoading ? (
                  <View style={s.center}><ActivityIndicator color={colors.terracotta600} /></View>
                ) : opps ? (
                  <>
                    <View style={s.oppsSummaryWrap}>
                      <Text style={s.oppsSummary}>{opps.summary}</Text>
                    </View>
                    {opps.opportunities.length === 0 ? (
                      <View style={s.emptyState}>
                        <Text style={s.emptyText}>
                          No grouping opportunities yet. Encourage residents to post service requests.
                        </Text>
                      </View>
                    ) : (
                      opps.opportunities.map((opp, i) => (
                        <View key={i} style={s.oppCard}>
                          <View style={s.oppTop}>
                            <Text style={s.oppCategory}>{opp.category}</Text>
                            <View style={s.oppSavingBadge}>
                              <Text style={s.oppSavingText}>Save ~{opp.estimated_saving_pct}%</Text>
                            </View>
                          </View>
                          <Text style={s.oppSuggestion}>{opp.suggestion}</Text>
                          <View style={s.oppFooter}>
                            <Text style={s.oppRequestCount}>{opp.request_count} requests</Text>
                          </View>
                        </View>
                      ))
                    )}
                    <TouchableOpacity style={s.refreshBtn} onPress={loadOpportunities} activeOpacity={0.8}>
                      <RefreshCw size={14} color={colors.sage700} strokeWidth={2} />
                      <Text style={[s.refreshBtnText, {color: colors.sage700}]}>Refresh analysis</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>Could not load opportunities. Pull to refresh.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  center: {paddingVertical: 24, alignItems: 'center'},

  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  title: {fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5},
  subtitle: {fontSize: 13, color: colors.ink400, marginTop: 2},
  titleBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.gold50, borderWidth: 1, borderColor: colors.gold50,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },

  // Accordion cards
  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
  },
  cardIconWrap: {
    width: 38, height: 38, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardHeaderText: {flex: 1},
  cardTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900},
  cardSub: {fontSize: 12, color: colors.ink400, marginTop: 2},
  cardBody: {paddingHorizontal: 16, paddingBottom: 16},
  divider: {height: 1, backgroundColor: colors.border, marginBottom: 16},

  // Digest
  digestStatRow: {flexDirection: 'row', gap: 8, marginBottom: 14},
  digestStat: {
    flex: 1, borderRadius: radius.md, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center',
  },
  digestStatVal: {fontSize: 22, fontWeight: '800', letterSpacing: -0.5},
  digestStatLabel: {fontSize: 10, fontWeight: '600', color: colors.ink400, marginTop: 2, textAlign: 'center'},
  digestTextWrap: {
    backgroundColor: colors.cream100, borderRadius: radius.md,
    padding: 14, marginBottom: 14,
  },
  digestText: {fontSize: 14, lineHeight: 22, color: colors.ink700},

  // Announce
  inputLabel: {fontSize: 12, fontWeight: '700', color: colors.ink500, marginBottom: 8, letterSpacing: 0.3},
  textInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, fontSize: 14, color: colors.ink900, backgroundColor: colors.bgCard,
    minHeight: 100, marginBottom: 14, lineHeight: 21,
  },
  composeBtn: {
    backgroundColor: colors.sky600, borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginBottom: 16,
  },
  composeBtnDisabled: {opacity: 0.4},
  composeBtnText: {fontSize: 15, fontWeight: '700', color: '#fff'},
  resultCard: {
    backgroundColor: colors.bgApp, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  resultSubjectRow: {marginBottom: 10},
  resultEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 6},
  resultSubject: {fontSize: 16, fontWeight: '800', color: colors.ink900},
  resultDivider: {height: 1, backgroundColor: colors.border, marginBottom: 10},
  resultBody: {fontSize: 14, color: colors.ink700, lineHeight: 22},
  clearBtn: {marginTop: 14, alignItems: 'center'},
  clearBtnText: {fontSize: 13, fontWeight: '600', color: colors.ink400, textDecorationLine: 'underline'},

  // Opportunities
  oppsSummaryWrap: {
    backgroundColor: colors.sage50, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.sage100, padding: 12, marginBottom: 14,
  },
  oppsSummary: {fontSize: 13, color: colors.sage700, lineHeight: 19, fontWeight: '600'},
  oppCard: {
    backgroundColor: colors.bgApp, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10,
  },
  oppTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  oppCategory: {fontSize: 15, fontWeight: '800', color: colors.ink900},
  oppSavingBadge: {
    backgroundColor: colors.gold50, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.gold500 + '40',
  },
  oppSavingText: {fontSize: 12, fontWeight: '700', color: colors.gold600},
  oppSuggestion: {fontSize: 13, color: colors.ink500, lineHeight: 19, marginBottom: 10},
  oppFooter: {},
  oppRequestCount: {fontSize: 12, fontWeight: '700', color: colors.ink400},

  // Shared
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingVertical: 8,
  },
  refreshBtnText: {fontSize: 13, fontWeight: '600', color: colors.terracotta600},
  emptyState: {paddingVertical: 16},
  emptyText: {fontSize: 13, color: colors.ink400, textAlign: 'center', lineHeight: 19},
});
