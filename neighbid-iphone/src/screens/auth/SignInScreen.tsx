import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Mail, Lock, Hammer, Droplets, Wind} from 'lucide-react-native';
import {Button} from '../../components/Button';
import {ServiceCategoryBadge} from '../../components/ServiceCategoryBadge';
import {colors, radius, shadow} from '../../theme';
import {login, User} from '../../api/auth';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

const brandMark = require('../../assets/bidbundle-mark.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'> & {
  onAuth: (user: User) => void;
};

export default function SignInScreen({navigation, onAuth}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      onAuth(user);
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message ?? 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Image source={brandMark} style={s.brandImage} resizeMode="contain" />
            </View>
            <Text style={s.brand}>BidBundle</Text>
          </View>

          {/* Service category badge strip */}
          <View style={s.badgeStrip}>
            <ServiceCategoryBadge category="Plumbing" size={44} />
            <ServiceCategoryBadge category="HVAC" size={44} />
            <ServiceCategoryBadge category="Handyman" size={44} />
            <ServiceCategoryBadge category="Electrical" size={44} />
            <ServiceCategoryBadge category="Landscaping" size={44} />
          </View>

          <Text style={s.title}>Welcome back</Text>
          <Text style={s.sub}>Sign in to access your neighbourhood bids.</Text>

          <View style={s.fields}>
            <View style={s.fieldLabelRow}>
              <Mail size={12} color={colors.ink400} strokeWidth={2} />
              <Text style={s.fieldLabel}>EMAIL</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.ink300}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <View style={[s.fieldLabelRow, s.fieldLabelGap]}>
              <Lock size={12} color={colors.ink400} strokeWidth={2} />
              <Text style={s.fieldLabel}>PASSWORD</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.ink300}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            label={loading ? 'Signing in…' : 'Sign in'}
            onPress={handleSignIn}
            loading={loading}
            style={s.submitBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('InviteSignUp')}
            style={s.inviteLink}>
            <Text style={s.inviteLinkText}>
              Have an invite code?{' '}
              <Text style={s.inviteLinkAction}>Join via invite →</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={s.footer}>
            <Text style={s.footerText}>
              Need an account?{' '}
              <Text style={s.footerLink}>Create one →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  flex: {flex: 1},
  container: {paddingHorizontal: 28, paddingBottom: 40},
  back: {marginTop: 16, marginBottom: 24},
  backText: {color: colors.terracotta600, fontSize: 15, fontWeight: '600'},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20},
  brandMark: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  brandImage: {width: 34, height: 34},
  brand: {fontSize: 14, fontWeight: '700', color: colors.terracotta600, letterSpacing: 1, textTransform: 'uppercase'},
  badgeStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  title: {fontSize: 34, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6},
  sub: {fontSize: 14, color: colors.ink500, marginTop: 6, marginBottom: 24, lineHeight: 20},
  fields: {},
  fieldLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8},
  fieldLabel: {fontSize: 11, fontWeight: '600', color: colors.ink400, letterSpacing: 1},
  fieldLabelGap: {marginTop: 18},
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink900,
    ...shadow.sm,
  },
  submitBtn: {marginTop: 28},
  inviteLink: {marginTop: 16, alignItems: 'center'},
  inviteLinkText: {fontSize: 13, color: colors.ink500},
  inviteLinkAction: {color: colors.terracotta600, fontWeight: '600'},
  footer: {marginTop: 12, alignItems: 'center'},
  footerText: {fontSize: 14, color: colors.ink500},
  footerLink: {color: colors.terracotta600, fontWeight: '600'},
});
