# NeighBid iPhone — Session 1: Scaffold, Navigation, Design System, Auth

## Task Status
`Approved`

## Goal
Create `neighbid-iphone/` — a bare React Native project that opens in Xcode,
runs in the iOS Simulator, and implements the full auth flow (Welcome → Sign In
→ Register with role picker) wired to the live FastAPI backend.

After this session, opening `neighbid-iphone/ios/NeighBidIphone.xcworkspace`
in Xcode and hitting Run should land the user on the sign-in screen.

---

## Codex Implementation Prompt

Working directory: `/Users/lancedsilva/Documents/neighbid-claude-codex-starter`

### Step 1 — Remove old mobile app

```bash
rm -rf neighbid-mobile
```

### Step 2 — Init new React Native project

```bash
npx @react-native-community/cli@latest init NeighBidIphone \
  --directory neighbid-iphone \
  --template react-native-template-typescript \
  --skip-install
cd neighbid-iphone
npm install
```

### Step 3 — Install core dependencies

```bash
npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  react-native-vector-icons \
  axios
```

### Step 4 — iOS pod install

```bash
cd ios && pod install && cd ..
```

### Step 5 — Create project structure

Create these directories:
```
src/
  theme/
  api/
  hooks/
  navigation/
  screens/
    auth/
    homeowner/
    provider/
    shared/
  components/
```

### Step 6 — Design system `src/theme/index.ts`

```typescript
export const colors = {
  // Canvas
  cream50:  '#FBF7F1',
  cream100: '#F5EFE5',
  cream200: '#EDE4D3',
  cream300: '#E0D4BD',

  // Ink
  ink900: '#1F1A14',
  ink700: '#3D362B',
  ink500: '#6E6557',
  ink400: '#8C8273',
  ink300: '#B5AC9C',
  ink200: '#D7CFBF',

  // Terracotta (primary)
  terracotta600: '#C2552B',
  terracotta500: '#D26B3F',
  terracotta400: '#E08758',
  terracotta100: '#F7DDCB',
  terracotta50:  '#FBEEE3',

  // Sage
  sage700: '#4A6A4D',
  sage600: '#5C7E60',
  sage500: '#7A9A7E',
  sage100: '#DCE7DD',
  sage50:  '#EBF1EC',

  // Gold
  gold600: '#B8862B',
  gold500: '#D6A23E',
  gold100: '#F2E2B8',
  gold50:  '#F8EFD6',

  // Sidebar / warm dark
  warmDark:        '#221C16',
  warmDarkHover:   '#2D261D',

  // Semantic
  bgApp:    '#FBF7F1',
  bgCard:   '#FFFFFF',
  border:        '#ECE3D2',
  borderStrong:  '#D7CFBF',
  white: '#FFFFFF',
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  pill: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#1F1A14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1F1A14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const typography = {
  displayLg: { fontSize: 30, fontWeight: '500' as const, letterSpacing: -0.6 },
  displayMd: { fontSize: 24, fontWeight: '500' as const, letterSpacing: -0.4 },
  displaySm: { fontSize: 20, fontWeight: '500' as const, letterSpacing: -0.3 },
  bodyLg:    { fontSize: 16, fontWeight: '400' as const },
  bodyMd:    { fontSize: 14, fontWeight: '400' as const },
  bodySm:    { fontSize: 13, fontWeight: '400' as const },
  label:     { fontSize: 12, fontWeight: '600' as const },
  eyebrow:   { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.1, textTransform: 'uppercase' as const },
};
```

### Step 7 — Shared UI components `src/components/`

**`src/components/Card.tsx`**
```tsx
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pad?: boolean;
}

export function Card({ children, style, pad = true }: CardProps) {
  return (
    <View style={[styles.card, pad && styles.pad, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  pad: { padding: 20 },
});
```

**`src/components/Button.tsx`**
```tsx
import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator,
} from 'react-native';
import { colors, radius } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'quiet';
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        variant === 'primary' && styles.primary,
        variant === 'ghost'   && styles.ghost,
        variant === 'quiet'   && styles.quiet,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.terracotta600} />
        : <Text style={[styles.label, variant === 'primary' && styles.labelPrimary, size === 'sm' && styles.labelSm]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sm:      { height: 36, paddingHorizontal: 16 },
  primary: { backgroundColor: colors.terracotta600 },
  ghost:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.borderStrong },
  quiet:   { backgroundColor: colors.cream100 },
  disabled:{ opacity: 0.45 },
  label:     { fontSize: 15, fontWeight: '600', color: colors.ink900 },
  labelPrimary: { color: '#fff' },
  labelSm:   { fontSize: 13 },
});
```

**`src/components/Chip.tsx`**
```tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

type ChipTone = 'terracotta' | 'sage' | 'gold' | 'neutral';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  dot?: boolean;
  style?: ViewStyle;
}

const toneBg: Record<ChipTone, string> = {
  terracotta: colors.terracotta50,
  sage:       colors.sage50,
  gold:       colors.gold50,
  neutral:    colors.cream100,
};
const toneColor: Record<ChipTone, string> = {
  terracotta: colors.terracotta600,
  sage:       colors.sage700,
  gold:       colors.gold600,
  neutral:    colors.ink700,
};

export function Chip({ label, tone = 'neutral', dot, style }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: toneBg[tone] }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: toneColor[tone] }]} />}
      <Text style={[styles.label, { color: toneColor[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    height: 24, paddingHorizontal: 10, borderRadius: radius.pill,
  },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600' },
});
```

### Step 8 — API client `src/api/client.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your machine's local IP when testing on a physical device
// e.g. 'http://192.168.1.x:8000'
export const API_BASE = 'http://localhost:8000';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

export async function setToken(token: string): Promise<void> {
  return AsyncStorage.setItem('access_token', token);
}

export async function clearToken(): Promise<void> {
  return AsyncStorage.removeItem('access_token');
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: string;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = options.token ?? (await getToken());
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
```

### Step 9 — Auth API `src/api/auth.ts`

```typescript
import { apiFetch, setToken, clearToken, API_BASE } from './client';

export type Role = 'homeowner' | 'provider';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  neighbourhood_id: number | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function register(params: {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  latitude?: number;
  longitude?: number;
}): Promise<User> {
  const data = await apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  await setToken(data.access_token);
  return fetchMe();
}

export async function login(email: string, password: string): Promise<User> {
  const body = new URLSearchParams({ username: email, password }).toString();
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Invalid email or password');
  const data: TokenResponse = await res.json();
  await setToken(data.access_token);
  return fetchMe();
}

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/users/me');
}

export async function logout(): Promise<void> {
  await clearToken();
}
```

### Step 10 — Auth hook `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { fetchMe, logout as apiLogout, User } from '../api/auth';
import { getToken } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then(async (token) => {
      if (token) {
        try { setUser(await fetchMe()); } catch { /* expired token */ }
      }
      setLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return { user, setUser, loading, logout };
}
```

### Step 11 — Auth screens

**`src/screens/auth/WelcomeScreen.tsx`**
```tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { colors, typography } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Brand mark */}
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>N</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>Bid together,{'\n'}save together.</Text>
          <Text style={styles.sub}>
            Group your home-service requests with neighbours.
            Providers compete for the whole block — so everyone pays less.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.stats}>
          {[
            { big: '2,400+', label: 'Homeowners' },
            { big: '$310',   label: 'Avg. saved' },
            { big: '47',     label: 'Providers' },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statBig}>{s.big}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Get started free" onPress={() => navigation.navigate('Register')} />
          <Button
            label="Sign in"
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.cream50 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 32 },
  brandMark: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.terracotta600,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  brandLetter: { color: '#fff', fontSize: 22, fontWeight: '700' },
  hero: { flex: 1, justifyContent: 'center' },
  headline: {
    fontSize: 40, fontWeight: '700', color: colors.ink900,
    letterSpacing: -1, lineHeight: 46, marginBottom: 16,
  },
  sub: { fontSize: 16, color: colors.ink500, lineHeight: 24 },
  stats: {
    flexDirection: 'row', gap: 0, marginBottom: 40,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24,
  },
  stat: { flex: 1, alignItems: 'center' },
  statBig:   { fontSize: 22, fontWeight: '700', color: colors.terracotta600 },
  statLabel: { fontSize: 11, color: colors.ink500, marginTop: 2, fontWeight: '600' },
  actions: {},
});
```

**`src/screens/auth/SignInScreen.tsx`**
```tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { colors, radius, typography } from '../../theme';
import { login } from '../../api/auth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'> & {
  onAuth: (user: any) => void;
};

type Role = 'homeowner' | 'provider';

export default function SignInScreen({ navigation, onAuth }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('homeowner');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role !== role) {
        Alert.alert(
          'Wrong role',
          `This account is registered as a ${user.role}. Switch the role selector and try again.`
        );
        setLoading(false);
        return;
      }
      onAuth(user);
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message ?? 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to your neighbourhood dashboard.</Text>

          {/* Role picker */}
          <View style={styles.roleRow}>
            {(['homeowner', 'provider'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              >
                <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>
                  {r === 'homeowner' ? 'Homeowner' : 'Provider'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.fields}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.ink300}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.ink300}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button label="Sign in" onPress={handleSignIn} loading={loading} style={{ marginTop: 28 }} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footer}>
            <Text style={styles.footerText}>
              Need an account? <Text style={styles.footerLink}>Create one →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.cream50 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back:      { marginTop: 16, marginBottom: 32 },
  backText:  { color: colors.terracotta600, fontSize: 15, fontWeight: '600' },
  title:     { fontSize: 34, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6 },
  sub:       { fontSize: 15, color: colors.ink500, marginTop: 6, marginBottom: 28 },
  roleRow:   { flexDirection: 'row', backgroundColor: colors.cream100, borderRadius: radius.lg, padding: 4, marginBottom: 28 },
  roleBtn:   { flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  roleBtnActive: { backgroundColor: colors.bgCard, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: colors.ink500 },
  roleLabelActive: { color: colors.ink900 },
  fields:    {},
  fieldLabel: { fontSize: 11, fontWeight: '600', color: colors.ink400, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, height: 50, paddingHorizontal: 16,
    fontSize: 16, color: colors.ink900,
  },
  footer:   { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.ink500 },
  footerLink: { color: colors.terracotta600, fontWeight: '600' },
});
```

**`src/screens/auth/RegisterScreen.tsx`**
```tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { colors, radius } from '../../theme';
import { register } from '../../api/auth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Role = 'homeowner' | 'provider';
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onAuth: (user: any) => void;
};

export default function RegisterScreen({ navigation, onAuth }: Props) {
  const [role, setRole] = useState<Role>('homeowner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Missing fields', 'Name, email, and a 6+ character password are required.');
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      onAuth(user);
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Try a different email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>Join your neighbourhood. Start saving as a group.</Text>

          {/* Role picker */}
          <Text style={styles.sectionLabel}>I AM A</Text>
          <View style={styles.roleRow}>
            {[
              { value: 'homeowner' as Role, label: 'Homeowner', desc: 'Group requests, save on services' },
              { value: 'provider'  as Role, label: 'Provider',  desc: 'Win group bids, grow revenue' },
            ].map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
              >
                <Text style={[styles.roleTitle, role === r.value && styles.roleTitleActive]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>YOUR DETAILS</Text>
          {[
            { label: 'Full name',       value: name,     set: setName,     placeholder: 'Marcus Johnson',     keyboard: 'default' as const,       secure: false },
            { label: 'Email address',   value: email,    set: setEmail,    placeholder: 'marcus@email.com',   keyboard: 'email-address' as const, secure: false },
            { label: 'Password',        value: password, set: setPassword, placeholder: '6+ characters',      keyboard: 'default' as const,       secure: true  },
          ].map((f) => (
            <View key={f.label} style={{ marginBottom: 16 }}>
              <Text style={styles.fieldLabel}>{f.label.toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={colors.ink300}
                value={f.value}
                onChangeText={f.set}
                keyboardType={f.keyboard}
                secureTextEntry={f.secure}
                autoCapitalize={f.secure || f.keyboard === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          <Button label="Create account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Sign in →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.cream50 },
  container: { paddingHorizontal: 28, paddingBottom: 40 },
  back:      { marginTop: 16, marginBottom: 28 },
  backText:  { color: colors.terracotta600, fontSize: 15, fontWeight: '600' },
  title:     { fontSize: 34, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6 },
  sub:       { fontSize: 15, color: colors.ink500, marginTop: 6, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.ink400, letterSpacing: 1, marginBottom: 10 },
  roleRow:   { flexDirection: 'row', gap: 12, marginBottom: 28 },
  roleCard:  { flex: 1, padding: 16, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border },
  roleCardActive: { borderColor: colors.terracotta600, backgroundColor: colors.terracotta50 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: colors.ink700, marginBottom: 4 },
  roleTitleActive: { color: colors.terracotta600 },
  roleDesc:  { fontSize: 12, color: colors.ink500, lineHeight: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: colors.ink400, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, height: 50, paddingHorizontal: 16,
    fontSize: 16, color: colors.ink900,
  },
  footer:   { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: colors.ink500 },
  footerLink: { color: colors.terracotta600, fontWeight: '600' },
});
```

### Step 12 — Navigation

**`src/navigation/AuthNavigator.tsx`**
```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen  from '../screens/auth/WelcomeScreen';
import SignInScreen   from '../screens/auth/SignInScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
  Welcome:  undefined;
  SignIn:   undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface Props { onAuth: (user: any) => void; }

export default function AuthNavigator({ onAuth }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome"  component={WelcomeScreen} />
      <Stack.Screen name="SignIn"   children={(p) => <SignInScreen   {...p} onAuth={onAuth} />} />
      <Stack.Screen name="Register" children={(p) => <RegisterScreen {...p} onAuth={onAuth} />} />
    </Stack.Navigator>
  );
}
```

**`src/navigation/HomeownerNavigator.tsx`** — simple placeholder tabs
```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Coming in Session 2</Text>
    </View>
  );
}

interface Props { onLogout: () => void; }

export default function HomeownerNavigator({ onLogout }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream50 },
        headerTintColor: colors.ink900,
        tabBarActiveTintColor: colors.terracotta600,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: { backgroundColor: colors.bgCard, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home"    children={() => <PlaceholderScreen title="Dashboard" />}  />
      <Tab.Screen name="Bids"    children={() => <PlaceholderScreen title="My Bids" />}    />
      <Tab.Screen name="Chat"    children={() => <PlaceholderScreen title="Chat" />}       />
      <Tab.Screen name="Profile" children={() => <PlaceholderScreen title="Profile" />}   />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream50 },
  title:       { fontSize: 24, fontWeight: '700', color: colors.ink900 },
  sub:         { fontSize: 14, color: colors.ink400, marginTop: 8 },
});
```

**`src/navigation/ProviderNavigator.tsx`** — same pattern
```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Coming in Session 3</Text>
    </View>
  );
}

interface Props { onLogout: () => void; }
export default function ProviderNavigator({ onLogout }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream50 },
        headerTintColor: colors.ink900,
        tabBarActiveTintColor: colors.terracotta600,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: { backgroundColor: colors.bgCard, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home"    children={() => <PlaceholderScreen title="Dashboard" />}  />
      <Tab.Screen name="Jobs"    children={() => <PlaceholderScreen title="Job Feed" />}   />
      <Tab.Screen name="Bids"    children={() => <PlaceholderScreen title="My Bids" />}    />
      <Tab.Screen name="Profile" children={() => <PlaceholderScreen title="Profile" />}   />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream50 },
  title:       { fontSize: 24, fontWeight: '700', color: colors.ink900 },
  sub:         { fontSize: 14, color: colors.ink400, marginTop: 8 },
});
```

**`src/navigation/RootNavigator.tsx`**
```tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator     from './AuthNavigator';
import HomeownerNavigator from './HomeownerNavigator';
import ProviderNavigator  from './ProviderNavigator';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

export default function RootNavigator() {
  const { user, setUser, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream50 }}>
        <ActivityIndicator color={colors.terracotta600} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user
        ? <AuthNavigator onAuth={setUser} />
        : user.role === 'homeowner'
          ? <HomeownerNavigator onLogout={logout} />
          : <ProviderNavigator  onLogout={logout} />
      }
    </NavigationContainer>
  );
}
```

### Step 13 — Wire into `App.tsx`

Replace the contents of `App.tsx` with:
```tsx
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
```

### Step 14 — Verify

```bash
cd neighbid-iphone
npx tsc --noEmit 2>&1 | head -20
```

The Xcode workspace is at:
`neighbid-iphone/ios/NeighBidIphone.xcworkspace`

Open it in Xcode and press ▶ to run in the iOS Simulator.

---

## Files to create/modify

| File | Action |
|---|---|
| `neighbid-mobile/` | Delete |
| `neighbid-iphone/` | Create (RN init) |
| `neighbid-iphone/src/theme/index.ts` | Create |
| `neighbid-iphone/src/api/client.ts` | Create |
| `neighbid-iphone/src/api/auth.ts` | Create |
| `neighbid-iphone/src/hooks/useAuth.ts` | Create |
| `neighbid-iphone/src/components/Card.tsx` | Create |
| `neighbid-iphone/src/components/Button.tsx` | Create |
| `neighbid-iphone/src/components/Chip.tsx` | Create |
| `neighbid-iphone/src/screens/auth/WelcomeScreen.tsx` | Create |
| `neighbid-iphone/src/screens/auth/SignInScreen.tsx` | Create |
| `neighbid-iphone/src/screens/auth/RegisterScreen.tsx` | Create |
| `neighbid-iphone/src/navigation/AuthNavigator.tsx` | Create |
| `neighbid-iphone/src/navigation/HomeownerNavigator.tsx` | Create |
| `neighbid-iphone/src/navigation/ProviderNavigator.tsx` | Create |
| `neighbid-iphone/src/navigation/RootNavigator.tsx` | Create |
| `neighbid-iphone/App.tsx` | Modify |

## Task Update Log
- 2026-05-09 — Written and approved. Delegating to Codex.
