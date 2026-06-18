import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import {ArrowLeft, Sparkles} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {Button} from '../../components/Button';
import {homeownerApi, HomeownerRequest} from '../../api/homeowner';
import {aiApi, QuoteSummaryResponse} from '../../api/ai';

function dollarsFromCents(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

interface Props {
  onBack?: () => void;
}

export default function QuoteCheckScreen({onBack}: Props) {
  const [requests, setRequests] = useState<HomeownerRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{uri: string; name?: string | null; type?: string | null} | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<QuoteSummaryResponse | null>(null);

  useEffect(() => {
    homeownerApi.getRequests()
      .then(reqs => setRequests(reqs))
      .catch(() => setRequests([]));
  }, []);

  async function analyzeQuote() {
    if ((!quoteText.trim() && !selectedFile) || loading) {return;}
    setLoading(true);
    try {
      const result = selectedFile
        ? await aiApi.quoteSummaryFile(selectedFile, selectedRequestId)
        : await aiApi.quoteSummaryText(quoteText.trim(), selectedRequestId);
      setSummary(result);
    } catch (e: any) {
      Alert.alert('AI unavailable', 'Try a clearer file or paste a little more detail from the quote and run it again.');
    } finally {
      setLoading(false);
    }
  }

  async function chooseFile() {
    try {
      const picked = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
      });
      setSelectedFile({
        uri: picked.fileCopyUri ?? picked.uri,
        name: picked.name,
        type: picked.type,
      });
      setSummary(null);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Upload failed', 'Could not open the file picker.');
      }
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.bgApp}} edges={['top']}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerGlow} />
            {onBack ? (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <ArrowLeft size={20} color={colors.cream200} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerIconRow}>
              <View style={styles.headerIcon}>
                <Sparkles size={18} color={colors.gold500} strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.headerName}>Quote check</Text>
                <Text style={styles.headerSub}>Upload or paste an outside quote and compare it with your BidBundle options.</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>MATCH TO REQUEST</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.requestRow}>
              <TouchableOpacity
                onPress={() => setSelectedRequestId(null)}
                style={[styles.requestChip, selectedRequestId === null && styles.requestChipActive]}>
                <Text style={[styles.requestChipText, selectedRequestId === null && styles.requestChipTextActive]}>General quote</Text>
              </TouchableOpacity>
              {requests.slice(0, 6).map(request => (
                <TouchableOpacity
                  key={request.id}
                  onPress={() => setSelectedRequestId(request.id)}
                  style={[styles.requestChip, selectedRequestId === request.id && styles.requestChipActive]}>
                  <Text style={[styles.requestChipText, selectedRequestId === request.id && styles.requestChipTextActive]} numberOfLines={1}>
                    {request.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>UPLOAD QUOTE FILE</Text>
            <TouchableOpacity onPress={chooseFile} style={styles.uploadBtn} activeOpacity={0.85}>
              <View style={styles.uploadBadge}>
                <Sparkles size={14} color={colors.gold600} strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.uploadTitle}>{selectedFile ? selectedFile.name ?? 'Selected quote file' : 'Choose PDF or image'}</Text>
                <Text style={styles.uploadSub}>
                  {selectedFile ? 'File attached for AI analysis' : 'Upload a contractor estimate, quote PDF, or screenshot'}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>OR PASTE QUOTE TEXT</Text>
            <TextInput
              style={styles.textarea}
              value={quoteText}
              onChangeText={setQuoteText}
              placeholder="Paste the provider quote, estimate, or line items here..."
              placeholderTextColor={colors.ink300}
              multiline
              textAlignVertical="top"
            />
            <Button
              label={loading ? 'Analyzing…' : 'Run AI quote check'}
              onPress={analyzeQuote}
              loading={loading}
              disabled={(!quoteText.trim() && !selectedFile) || loading}
              style={styles.primaryBtn}
            />
          </View>

          {summary && (
            <>
              <View style={styles.resultHero}>
                <View style={styles.scoreWrap}>
                  <Text style={styles.scoreValue}>{summary.score}</Text>
                  <Text style={styles.scoreLabel}>score</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.providerName}>{summary.provider_name}</Text>
                  <Text style={styles.providerAmount}>{dollarsFromCents(summary.quoted_amount)}</Text>
                  <Text style={styles.providerSummary}>{summary.scope_summary}</Text>
                </View>
              </View>

              {summary.vs_neighbid && (
                <View style={styles.compareCard}>
                  <Text style={styles.compareTitle}>BidBundle comparison</Text>
                  <Text style={styles.compareLine}>Best BidBundle bid: {dollarsFromCents(summary.vs_neighbid.neighbid_best_bid)}</Text>
                  <Text style={styles.compareLine}>
                    {summary.vs_neighbid.saving_if_use_neighbid >= 0
                      ? `Potential savings: ${dollarsFromCents(summary.vs_neighbid.saving_if_use_neighbid)}`
                      : `Outside quote is cheaper by ${dollarsFromCents(Math.abs(summary.vs_neighbid.saving_if_use_neighbid))}`}
                  </Text>
                </View>
              )}

              {summary.flags.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Things to check</Text>
                  {summary.flags.map(flag => (
                    <View key={flag} style={styles.flagRow}>
                      <View style={styles.flagDot} />
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>AI recommendation</Text>
                <Text style={styles.recommendation}>{summary.recommendation}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 120, gap: 14},
  headerCard: {
    backgroundColor: colors.warmDark, borderRadius: radius.xl,
    padding: 18, overflow: 'hidden', ...shadow.lg,
  },
  headerGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    right: -60, top: -80, backgroundColor: 'rgba(184,134,43,0.18)',
  },
  backBtn: {marginBottom: 12},
  headerIconRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  headerIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerName: {fontSize: 22, fontWeight: '700', color: colors.white},
  headerSub: {fontSize: 13, color: colors.cream300, marginTop: 3, lineHeight: 18},
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    ...shadow.md,
  },
  label: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8, marginBottom: 10},
  requestRow: {gap: 8, paddingBottom: 14},
  requestChip: {
    maxWidth: 190,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream100,
  },
  requestChipActive: {backgroundColor: colors.terracotta600, borderColor: colors.terracotta600},
  requestChipText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  requestChipTextActive: {color: '#fff'},
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream50,
    padding: 14,
    marginBottom: 14,
  },
  uploadBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.gold50,
    borderWidth: 1,
    borderColor: colors.gold100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {fontSize: 14, fontWeight: '700', color: colors.ink900},
  uploadSub: {fontSize: 12, color: colors.ink500, marginTop: 3, lineHeight: 17},
  textarea: {
    minHeight: 150,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream50,
    padding: 14,
    fontSize: 15,
    color: colors.ink900,
    lineHeight: 21,
  },
  primaryBtn: {marginTop: 16},
  resultHero: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.sm,
  },
  scoreWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.terracotta50,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {fontSize: 24, fontWeight: '700', color: colors.terracotta600, lineHeight: 26},
  scoreLabel: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, textTransform: 'uppercase', marginTop: 2},
  providerName: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  providerAmount: {fontSize: 24, fontWeight: '700', color: colors.gold600, marginTop: 4},
  providerSummary: {fontSize: 13, color: colors.ink500, marginTop: 8, lineHeight: 19},
  compareCard: {
    backgroundColor: colors.sage50,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.sage100,
    padding: 16,
  },
  compareTitle: {fontSize: 15, fontWeight: '700', color: colors.sage700, marginBottom: 6},
  compareLine: {fontSize: 13, color: colors.sage700, lineHeight: 19},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginBottom: 10},
  flagRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8},
  flagDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold600, marginTop: 6},
  flagText: {flex: 1, fontSize: 13, color: colors.ink700, lineHeight: 19},
  recommendation: {fontSize: 14, color: colors.ink700, lineHeight: 21},
});
