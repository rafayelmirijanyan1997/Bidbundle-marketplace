import React, {useState} from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button} from '../../components/Button';
import {colors, radius} from '../../theme';
import {validateInvite, acceptInvite, User} from '../../api/auth';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'InviteSignUp'> & {
  onAuth: (user: User) => void;
};

type Step = 1 | 2;

function StepDots({current, total}: {current: Step; total: number}) {
  return (
    <View style={dots.row}>
      {Array.from({length: total}, (_, i) => i + 1).map(n => (
        <View
          key={n}
          style={[
            dots.dot,
            n === current ? dots.dotActive : n < current ? dots.dotDone : dots.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row: {flexDirection: 'row', gap: 6, alignItems: 'center'},
  dot: {height: 7, borderRadius: 4},
  dotActive: {width: 24, backgroundColor: colors.terracotta600},
  dotDone: {width: 7, backgroundColor: 'rgba(194,85,43,0.4)'},
  dotInactive: {width: 7, backgroundColor: colors.border},
});

export default function InviteSignUpScreen({navigation, onAuth}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [communityInfo, setCommunityInfo] = useState<{
    community_name: string;
    community_type: string | null;
    unit_number: string | null;
    invite_id: number;
  } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleValidate() {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const info = await validateInvite(code.trim());
      setCommunityInfo(info);
      if (info.unit_number) setUnitNumber(info.unit_number);
      setStep(2);
    } catch (e: any) {
      Alert.alert('Invalid invite', e.message ?? 'This code is invalid or expired.');
    } finally {
      setValidating(false);
    }
  }

  async function handleFinish() {
    if (!communityInfo) return;
    setSubmitting(true);
    try {
      const user = await acceptInvite({
        invite_code: code.trim(),
        email: email.trim().toLowerCase(),
        password,
        full_name: name.trim(),
        unit_number: unitNumber.trim() || undefined,
      });
      onAuth(user);
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message ?? 'Try again.');
      setSubmitting(false);
    }
  }

  const canFinish = name.trim() && email.trim() && password.length >= 6;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
        {step === 1 ? (
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.eyebrow}>Step 1 of 2</Text>
            <Text style={s.title}>Enter invite code</Text>
            <Text style={s.sub}>Your HOA manager sent you a code. Enter it here to join your community.</Text>
            <StepDots current={1} total={2} />

            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>INVITE CODE</Text>
              <TextInput
                style={[s.input, s.codeInput]}
                value={code}
                onChangeText={setCode}
                placeholder="e.g. abc123xyz"
                placeholderTextColor={colors.ink300}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.infoCard}>
              <Text style={s.infoTitle}>What is an invite code?</Text>
              <Text style={s.infoBody}>
                Your building or HOA manager creates invite codes for residents. Ask them if you don't have one yet.
              </Text>
            </View>

            <Button
              label={validating ? 'Checking…' : 'Continue'}
              onPress={handleValidate}
              disabled={!code.trim() || validating}
              loading={validating}
              style={s.btn}
            />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => setStep(1)} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.eyebrow}>Step 2 of 2</Text>
            <Text style={s.title}>Create your account</Text>
            <Text style={s.sub}>You're joining your community — no area verification needed.</Text>
            <StepDots current={2} total={2} />

            {communityInfo && (
              <View style={s.communityBanner}>
                <Text style={s.communityBannerLabel}>Joining</Text>
                <Text style={s.communityBannerName}>{communityInfo.community_name}</Text>
                {communityInfo.community_type && (
                  <Text style={s.communityBannerType}>
                    {communityInfo.community_type.replace('_', ' ')}
                  </Text>
                )}
              </View>
            )}

            <View style={s.fields}>
              {[
                {label: 'FULL NAME', value: name, onChange: setName, placeholder: 'Sarah Chen', secure: false, keyboard: 'default' as const, cap: 'words' as const},
                {label: 'EMAIL', value: email, onChange: setEmail, placeholder: 'sarah@email.com', secure: false, keyboard: 'email-address' as const, cap: 'none' as const},
                {label: 'PASSWORD', value: password, onChange: setPassword, placeholder: '6+ characters', secure: true, keyboard: 'default' as const, cap: 'none' as const},
                {label: 'UNIT NUMBER (optional)', value: unitNumber, onChange: setUnitNumber, placeholder: 'e.g. 4B', secure: false, keyboard: 'default' as const, cap: 'characters' as const},
              ].map(f => (
                <View key={f.label} style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={s.input}
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.ink300}
                    secureTextEntry={f.secure}
                    keyboardType={f.keyboard}
                    autoCapitalize={f.cap}
                    autoCorrect={false}
                  />
                </View>
              ))}
            </View>

            <Button
              label={submitting ? 'Creating account…' : 'Join community'}
              onPress={handleFinish}
              disabled={!canFinish || submitting}
              loading={submitting}
              style={s.btn}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  flex: {flex: 1},
  content: {paddingHorizontal: 24, paddingBottom: 48},
  backBtn: {marginTop: 16, marginBottom: 20, alignSelf: 'flex-start'},
  backText: {color: colors.terracotta600, fontSize: 15, fontWeight: '600'},
  eyebrow: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 6},
  title: {fontSize: 32, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6, marginBottom: 6},
  sub: {fontSize: 14, color: colors.ink500, lineHeight: 20, marginBottom: 20},
  fields: {marginTop: 20, gap: 16},
  fieldWrap: {marginTop: 16},
  fieldLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 8},
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, height: 50, paddingHorizontal: 16,
    fontSize: 15, color: colors.ink900,
  },
  codeInput: {
    fontSize: 18, fontWeight: '700', letterSpacing: 2,
    textAlign: 'center',
  },
  btn: {marginTop: 28},
  infoCard: {
    backgroundColor: colors.cream100, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 16,
  },
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.ink900, marginBottom: 3},
  infoBody: {fontSize: 12, color: colors.ink500, lineHeight: 16},
  communityBanner: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100,
    padding: 16, marginTop: 20, alignItems: 'center',
  },
  communityBannerLabel: {
    fontSize: 10, fontWeight: '700', color: colors.terracotta600,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4,
  },
  communityBannerName: {fontSize: 20, fontWeight: '800', color: colors.ink900, textAlign: 'center'},
  communityBannerType: {fontSize: 13, color: colors.ink500, marginTop: 4, textTransform: 'capitalize'},
});
