import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MapPin, Mail, Shield, CheckCircle2, Users, Wrench, Home} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {useAuth} from '../../hooks/useAuth';
import {Chip} from '../../components/Chip';

interface Props {
  onLogout: () => void | Promise<void>;
}

export default function ProfileScreen({onLogout}: Props) {
  const {user} = useAuth();

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: () => void onLogout()},
    ]);
  }

  const initials = user?.full_name
    ?.split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'ME';

  const detailRows = [
    {label: 'Neighbourhood', value: user?.neighborhood ?? 'Not set', Icon: MapPin},
    {label: 'Email', value: user?.email ?? '—', Icon: Mail},
    {label: 'Role', value: user?.role ?? '—', Icon: Shield},
  ];

  const statPills = [
    {value: user?.neighborhood ? 'Verified' : 'Setup', label: 'status', Icon: CheckCircle2},
    {value: user?.role === 'homeowner' ? 'Group' : 'Serve', label: 'mode', Icon: Users},
    {value: user?.neighborhood ? '1' : '0', label: 'area', Icon: MapPin},
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {/* Background tool silhouettes */}
          <View style={styles.heroOrbLarge} />
          <View style={styles.toolSilhouette}>
            <Wrench size={110} color={colors.terracotta400} strokeWidth={1} />
          </View>

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Home size={11} color={colors.cream200} strokeWidth={2} />
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'homeowner' ? 'Homeowner' : 'Service Provider'}
                </Text>
              </View>
              <Chip label={user?.neighborhood ?? 'No neighbourhood'} tone="gold" />
            </View>
          </View>

          <View style={styles.statRow}>
            {statPills.map(pill => (
              <View key={pill.label} style={styles.statPill}>
                <pill.Icon size={14} color={colors.terracotta400} strokeWidth={2} />
                <Text style={styles.statValue}>{pill.value}</Text>
                <Text style={styles.statLabel}>{pill.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Account</Text>
          <Text style={styles.sectionTitle}>Personal details</Text>
        </View>
        <View style={styles.section}>
          {detailRows.map((row, i) => (
            <View
              key={row.label}
              style={[styles.row, i === detailRows.length - 1 && styles.rowLast]}>
              <View style={styles.rowLabelWrap}>
                <row.Icon size={14} color={colors.terracotta600} strokeWidth={2} />
                <Text style={styles.rowLabel}>{row.label}</Text>
              </View>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.helpCard}>
          <View style={styles.helpIconRow}>
            <MapPin size={16} color={colors.terracotta600} strokeWidth={2} />
            <Text style={styles.helpEyebrow}>Neighbourhood access</Text>
          </View>
          <Text style={styles.helpTitle}>Your account is tied to your local service area.</Text>
          <Text style={styles.helpText}>
            Keep your neighbourhood current so group requests, chat, and provider offers stay relevant.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120},
  heroCard: {
    backgroundColor: colors.warmDark,
    borderRadius: radius.xl,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 22,
    ...shadow.lg,
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -80,
    top: -70,
    backgroundColor: 'rgba(194,85,43,0.14)',
  },
  toolSilhouette: {
    position: 'absolute',
    right: -30,
    top: 10,
    opacity: 0.07,
  },
  avatarWrap: {alignItems: 'center'},
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.terracotta500,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
    ...shadow.md,
  },
  avatarText: {color: '#fff', fontSize: 26, fontWeight: '700'},
  name: {fontSize: 24, fontWeight: '700', color: colors.white},
  email: {fontSize: 14, color: colors.cream300, marginTop: 4},
  badgeRow: {flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center'},
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  roleBadgeText: {fontSize: 12, fontWeight: '700', color: colors.white},
  statRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {fontSize: 15, fontWeight: '700', color: colors.white},
  statLabel: {fontSize: 10, color: colors.cream300, textTransform: 'uppercase', letterSpacing: 0.7},
  sectionHeader: {marginBottom: 10},
  sectionEyebrow: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 0.9, textTransform: 'uppercase'},
  sectionTitle: {fontSize: 20, fontWeight: '700', color: colors.ink900, marginTop: 4},
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {borderBottomWidth: 0},
  rowLabelWrap: {flexDirection: 'row', alignItems: 'center', gap: 8},
  rowLabel: {fontSize: 14, color: colors.ink500},
  rowValue: {fontSize: 14, fontWeight: '600', color: colors.ink900, flexShrink: 1, textAlign: 'right', maxWidth: '55%'},
  helpCard: {
    backgroundColor: colors.terracotta50,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 20,
  },
  helpIconRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6},
  helpEyebrow: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.8, textTransform: 'uppercase'},
  helpTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginTop: 2},
  helpText: {fontSize: 14, color: colors.ink500, lineHeight: 20, marginTop: 6},
  signOutBtn: {
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    ...shadow.sm,
  },
  signOutText: {fontSize: 15, fontWeight: '600', color: colors.ink700},
});
