import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Sparkles, Users, CheckCircle} from 'lucide-react-native';
import {ServiceCategoryBadge} from '../../components/ServiceCategoryBadge';
import {colors, radius, shadow} from '../../theme';
import {apiFetch} from '../../api/client';
import {Button} from '../../components/Button';
import {Chip} from '../../components/Chip';
import {useAuth} from '../../hooks/useAuth';

const CATEGORIES = [
  {value: 'plumbing', label: 'Plumbing', emoji: '🔧'},
  {value: 'lawn', label: 'Lawn', emoji: '🌿'},
  {value: 'gutter', label: 'Gutter', emoji: '🏠'},
  {value: 'hvac', label: 'HVAC', emoji: '❄️'},
  {value: 'electrical', label: 'Electrical', emoji: '⚡'},
  {value: 'cleaning', label: 'Cleaning', emoji: '🧹'},
  {value: 'handyman', label: 'Handyman', emoji: '🔨'},
  {value: 'roofing', label: 'Roofing', emoji: '🏗️'},
  {value: 'other', label: 'Other', emoji: '📋'},
];

interface AIResult {
  title: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  estimated_group_likelihood: 'high' | 'medium' | 'low';
  group_reason: string;
  stub: boolean;
}

interface Props {
  onDone: () => void;
  onBack: () => void;
}

export default function NewRequestScreen({onDone, onBack}: Props) {
  const {user} = useAuth();
  const [step, setStep] = useState<'describe' | 'review'>('describe');
  const [description, setDescription] = useState('');
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function runAIWriter() {
    if (!description.trim()) {return;}
    setAiLoading(true);
    try {
      const result = await apiFetch<AIResult>('/ai/request-writer', {
        method: 'POST',
        body: JSON.stringify({description: description.trim()}),
      });
      setAiResult(result);
      setSelectedCategory(result.category);
      setBudgetMin(String(Math.round(result.budget_min / 100)));
      setBudgetMax(String(Math.round(result.budget_max / 100)));
      setStep('review');
    } catch (e: any) {
      Alert.alert('AI unavailable', 'You can still fill in the details manually.');
      setStep('review');
    } finally {
      setAiLoading(false);
    }
  }

  async function submitRequest() {
    const minCents = Math.round(parseFloat(budgetMin) * 100);
    const maxCents = Math.round(parseFloat(budgetMax) * 100);
    if (!selectedCategory || !budgetMin || !budgetMax || minCents <= 0) {
      Alert.alert('Missing fields', 'Please select a category and enter a budget range.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{id: number; group_id: number | null; group_status: string | null}>('/requests', {
        method: 'POST',
        body: JSON.stringify({
          title: aiResult?.title ?? description.trim().slice(0, 60),
          description: aiResult?.description ?? description.trim(),
          category: selectedCategory,
          neighborhood: user?.neighborhood ?? 'My Neighbourhood',
          status: 'live',
          budget_min: minCents,
          budget_max: maxCents,
        }),
      });

      const groupMsg = res.group_id
        ? res.group_status === 'grouping'
          ? 'You\'ve been added to an existing group in your area! The group will close in 72 hours.'
          : 'You\'ve started a new group. Neighbours will be notified to join.'
        : 'Request posted successfully.';

      Alert.alert('Request posted!', groupMsg, [{text: 'Great!', onPress: onDone}]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to post request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'describe') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
          <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
            <View style={s.headerCard}>
              <View style={s.headerGlow} />
              <TouchableOpacity onPress={onBack} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>
              <View style={s.headerIconRow}>
                <View style={s.headerIcon}>
                  <Sparkles size={18} color={colors.terracotta400} strokeWidth={2} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={s.title}>What service do you need?</Text>
                  <Text style={s.sub}>Describe it in plain language — AI will turn it into a professional request.</Text>
                </View>
              </View>
            </View>

            <TextInput
              style={s.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. My kitchen sink has a bad leak under the cabinet, water dripping constantly..."
              placeholderTextColor={colors.ink300}
              multiline
              autoFocus
            />

            {/* AI hint */}
            <View style={s.aiHint}>
              <Sparkles size={14} color={colors.terracotta600} strokeWidth={2} />
              <Text style={s.aiHintText}>AI will auto-generate a professional title, category, and budget range from your description.</Text>
            </View>

            <Button
              label={aiLoading ? 'Analysing…' : 'Continue with AI ✦'}
              onPress={runAIWriter}
              loading={aiLoading}
              disabled={!description.trim() || aiLoading}
              style={s.submitBtn}
            />
            <TouchableOpacity onPress={() => setStep('review')} style={s.skipBtn}>
              <Text style={s.skipText}>Fill in manually instead →</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Review step
  const likelihood = aiResult?.estimated_group_likelihood ?? 'low';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.headerCard}>
            <View style={s.headerGlow} />
            <TouchableOpacity onPress={() => setStep('describe')} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={s.headerIconRow}>
              <View style={s.headerIcon}>
                <CheckCircle size={18} color={colors.sage500} strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={s.title}>Review your request</Text>
                <Text style={s.sub}>Edit any details before posting to your neighbourhood.</Text>
              </View>
            </View>
          </View>

          {/* AI-generated title */}
          {aiResult && (
            <View style={s.aiCard}>
              <View style={s.aiCardHeader}>
                <Sparkles size={14} color={colors.terracotta600} strokeWidth={2} />
                <Text style={s.aiCardLabel}>AI generated</Text>
              </View>
              <Text style={s.aiTitle}>{aiResult.title}</Text>
              <Text style={s.aiDesc} numberOfLines={3}>{aiResult.description}</Text>
            </View>
          )}

          {/* Category picker */}
          <Text style={s.fieldLabel}>CATEGORY</Text>
          <View style={s.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setSelectedCategory(cat.value)}
                style={[s.catChip, selectedCategory === cat.value && s.catChipActive]}>
                <ServiceCategoryBadge category={cat.label} size={26} />
                <Text style={[s.catLabel, selectedCategory === cat.value && s.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Budget */}
          <Text style={s.fieldLabel}>BUDGET RANGE</Text>
          <View style={s.budgetRow}>
            <View style={s.budgetField}>
              <Text style={s.budgetPrefix}>$</Text>
              <TextInput
                style={s.budgetInput}
                value={budgetMin}
                onChangeText={setBudgetMin}
                placeholder="Min"
                placeholderTextColor={colors.ink300}
                keyboardType="number-pad"
              />
            </View>
            <Text style={s.budgetDash}>—</Text>
            <View style={s.budgetField}>
              <Text style={s.budgetPrefix}>$</Text>
              <TextInput
                style={s.budgetInput}
                value={budgetMax}
                onChangeText={setBudgetMax}
                placeholder="Max"
                placeholderTextColor={colors.ink300}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Group likelihood */}
          {aiResult && (
            <View style={[
              s.groupCard,
              likelihood === 'high' ? s.groupCardHigh : likelihood === 'medium' ? s.groupCardMed : s.groupCardLow,
            ]}>
              <View style={s.groupCardTop}>
                {likelihood === 'high'
                  ? <CheckCircle size={16} color={colors.sage700} strokeWidth={2.5} />
                  : <Users size={16} color={colors.gold600} strokeWidth={2} />
                }
                <Text style={s.groupCardTitle}>
                  {likelihood === 'high' ? 'High group chance' : likelihood === 'medium' ? 'Medium group chance' : 'Starting a new group'}
                </Text>
                <Chip
                  label={likelihood}
                  tone={likelihood === 'high' ? 'sage' : likelihood === 'medium' ? 'gold' : 'neutral'}
                  style={{height: 20}}
                />
              </View>
              <Text style={s.groupCardReason}>{aiResult.group_reason}</Text>
            </View>
          )}

          <Button
            label={submitting ? 'Posting…' : 'Post request'}
            onPress={submitRequest}
            loading={submitting}
            disabled={!selectedCategory || !budgetMin || !budgetMax}
            style={s.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 20, paddingBottom: 40, gap: 0},
  headerCard: {
    backgroundColor: colors.warmDark, borderRadius: radius.xl,
    padding: 18, overflow: 'hidden', marginBottom: 20, ...shadow.lg,
  },
  headerGlow: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    right: -50, top: -60, backgroundColor: 'rgba(194,85,43,0.16)',
  },
  headerIconRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 4},
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  backBtn: {marginBottom: 12, alignSelf: 'flex-start'},
  backText: {color: colors.terracotta400, fontSize: 15, fontWeight: '600'},
  title: {fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.4},
  sub: {fontSize: 13, color: colors.cream300, lineHeight: 19, marginTop: 4},
  descInput: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, minHeight: 140, padding: 16,
    fontSize: 15, color: colors.ink900, lineHeight: 22, textAlignVertical: 'top',
  },
  aiHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.terracotta50, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.terracotta100, padding: 12, marginTop: 12,
  },
  aiHintText: {fontSize: 13, color: colors.terracotta600, flex: 1, lineHeight: 18},
  submitBtn: {marginTop: 24},
  skipBtn: {alignItems: 'center', marginTop: 16},
  skipText: {fontSize: 14, color: colors.ink400},

  // Review step
  aiCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 20, ...shadow.sm,
  },
  aiCardHeader: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8},
  aiCardLabel: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.5},
  aiTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900, marginBottom: 6},
  aiDesc: {fontSize: 13, color: colors.ink500, lineHeight: 18},

  fieldLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 10},
  categoryGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20},
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
  },
  catChipActive: {backgroundColor: colors.terracotta600, borderColor: colors.terracotta600},
  catEmoji: {fontSize: 14},
  catLabel: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  catLabelActive: {color: '#fff'},

  budgetRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20},
  budgetField: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, height: 50,
  },
  budgetPrefix: {fontSize: 16, fontWeight: '600', color: colors.ink500, marginRight: 4},
  budgetInput: {flex: 1, fontSize: 16, color: colors.ink900},
  budgetDash: {fontSize: 18, color: colors.ink300},

  groupCard: {borderRadius: radius.lg, borderWidth: 1, padding: 14, marginBottom: 12},
  groupCardHigh: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  groupCardMed: {backgroundColor: colors.gold50, borderColor: colors.gold100},
  groupCardLow: {backgroundColor: colors.cream100, borderColor: colors.border},
  groupCardTop: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6},
  groupCardTitle: {fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1},
  groupCardReason: {fontSize: 13, color: colors.ink500, lineHeight: 18},
});
