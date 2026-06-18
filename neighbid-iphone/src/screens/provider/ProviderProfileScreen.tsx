import React, {useCallback, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {BadgeCheck, MapPinHouse, MapPinned, ShieldCheck, Wrench} from 'lucide-react-native';
import {providerApi, ProviderProfile} from '../../api/provider';
import {colors, radius, shadow} from '../../theme';
import {Button} from '../../components/Button';

interface Props {
  onLogout: () => void | Promise<void>;
}

function yesNo(value: boolean) {
  return value ? 'Yes' : 'No';
}

function tradeChips(trades: string | null | undefined) {
  return (trades ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function ProviderProfileScreen({onLogout}: Props) {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  const load = useCallback(async () => {
    try {
      setProfile(await providerApi.getProfile());
    } catch (error: any) {
      console.warn('Provider profile error:', error.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: () => void onLogout()},
    ]);
  }

  const trades = tradeChips(profile?.trades);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroOrb} />
          <View style={styles.toolSilhouette}>
            <Wrench size={110} color={colors.terracotta400} strokeWidth={1} />
          </View>

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.company_name ?? 'P').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.companyName}>{profile?.company_name ?? 'Provider profile'}</Text>
            <Text style={styles.heroSub}>{profile?.neighborhood ?? 'Service area not set'}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Wrench size={11} color={colors.cream200} strokeWidth={2} />
                <Text style={styles.roleBadgeText}>Service Provider</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroTagRow}>
            {trades.length > 0 ? trades.map(trade => (
              <View key={trade} style={styles.heroTag}>
                <Text style={styles.heroTagText}>{trade}</Text>
              </View>
            )) : (
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>Add your trades</Text>
              </View>
            )}
          </View>

          <View style={styles.heroStatRow}>
            <View style={styles.heroStatPill}>
              <Wrench size={14} color={colors.terracotta400} strokeWidth={2} />
              <Text style={styles.heroStatValue}>{trades.length || 0}</Text>
              <Text style={styles.heroStatLabel}>trades</Text>
            </View>
            <View style={styles.heroStatPill}>
              <ShieldCheck size={14} color={colors.terracotta400} strokeWidth={2} />
              <Text style={styles.heroStatValue}>{yesNo(!!profile?.is_licensed)}</Text>
              <Text style={styles.heroStatLabel}>licensed</Text>
            </View>
            <View style={styles.heroStatPill}>
              <MapPinned size={14} color={colors.terracotta400} strokeWidth={2} />
              <Text style={styles.heroStatValue}>{profile?.service_radius_mi ?? 0}mi</Text>
              <Text style={styles.heroStatLabel}>radius</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Wrench size={16} color={colors.terracotta600} strokeWidth={2} />
            <Text style={styles.statValue}>{trades.length || 0}</Text>
            <Text style={styles.statLabel}>Active trades</Text>
            <Text style={styles.statSub}>{trades.length > 0 ? trades.slice(0, 2).join(' · ') : 'Not set yet'}</Text>
          </View>
          <View style={styles.statCard}>
            <BadgeCheck size={16} color={colors.sage700} strokeWidth={2} />
            <Text style={styles.statValue}>{yesNo(!!profile?.is_licensed)}</Text>
            <Text style={styles.statLabel}>Licensed</Text>
            <Text style={styles.statSub}>{yesNo(!!profile?.is_insured)} insured</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.statCard, styles.softCard]}>
            <MapPinHouse size={16} color={colors.sky600} strokeWidth={2} />
            <Text style={styles.softTitle}>Service area</Text>
            <Text style={styles.softValue}>{profile?.neighborhood ?? 'Not set'}</Text>
          </View>
          <View style={[styles.statCard, styles.softCard]}>
            <ShieldCheck size={16} color={colors.gold600} strokeWidth={2} />
            <Text style={styles.softTitle}>Coverage</Text>
            <Text style={styles.softValue}>{profile?.service_radius_mi ?? 0} miles</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business details</Text>
          <Text style={styles.sectionSub}>Core business info at a glance.</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Company</Text>
              <Text style={styles.detailValue}>{profile?.company_name ?? '—'}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{profile?.address ?? '—'}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Insurance</Text>
              <Text style={styles.detailValue}>{yesNo(!!profile?.is_insured)}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>License</Text>
              <Text style={styles.detailValue}>{yesNo(!!profile?.is_licensed)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeEyebrow}>Provider account</Text>
          <Text style={styles.noticeTitle}>Keep service area and trades current.</Text>
          <Text style={styles.noticeText}>That keeps the job feed, bid matching, and group chats focused on the work you can actually win.</Text>
        </View>

        <Button label="Sign out" variant="ghost" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 20, paddingTop: 22, paddingBottom: 120},
  heroCard: {
    backgroundColor: colors.warmDark,
    borderRadius: radius.xl,
    padding: 22,
    overflow: 'hidden',
    marginBottom: 18,
    ...shadow.lg,
  },
  heroOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -80,
    top: -70,
    backgroundColor: 'rgba(194,85,43,0.14)',
  },
  toolSilhouette: {position: 'absolute', right: -30, top: 10, opacity: 0.07},
  avatarWrap: {alignItems: 'center'},
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.terracotta500,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)',
    ...shadow.md,
  },
  avatarText: {color: '#fff', fontSize: 26, fontWeight: '700'},
  companyName: {fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center'},
  heroSub: {fontSize: 14, color: colors.cream300, marginTop: 4, lineHeight: 20, textAlign: 'center'},
  badgeRow: {flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center'},
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  roleBadgeText: {fontSize: 12, fontWeight: '700', color: colors.white},
  heroTagRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 18, justifyContent: 'center'},
  heroTag: {
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  heroTagText: {fontSize: 12, fontWeight: '700', color: colors.white},
  heroStatRow: {flexDirection: 'row', gap: 10, marginTop: 18},
  heroStatPill: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg,
    paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', gap: 4,
  },
  heroStatValue: {fontSize: 15, fontWeight: '700', color: colors.white},
  heroStatLabel: {fontSize: 10, color: colors.cream300, textTransform: 'uppercase', letterSpacing: 0.7},
  grid: {flexDirection: 'row', gap: 10, marginBottom: 18},
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.sm,
  },
  statValue: {fontSize: 18, fontWeight: '700', color: colors.ink900, marginTop: 10},
  statLabel: {fontSize: 12, color: colors.ink400, marginTop: 4},
  statSub: {fontSize: 12, color: colors.ink500, marginTop: 8, lineHeight: 18},
  softCard: {backgroundColor: colors.cream50},
  softTitle: {fontSize: 12, fontWeight: '700', color: colors.ink400, marginTop: 10, textTransform: 'uppercase'},
  softValue: {fontSize: 17, fontWeight: '700', color: colors.ink900, marginTop: 8, lineHeight: 22},
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 18,
    ...shadow.sm,
  },
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900, marginBottom: 8},
  sectionSub: {fontSize: 13, color: colors.ink400, lineHeight: 19, marginBottom: 12},
  detailGrid: {gap: 10, paddingBottom: 16},
  detailCard: {
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 0.8, textTransform: 'uppercase'},
  detailValue: {fontSize: 15, fontWeight: '700', color: colors.ink900, lineHeight: 21, marginTop: 6},
  noticeCard: {
    backgroundColor: colors.terracotta50,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    padding: 18,
    marginBottom: 18,
  },
  noticeEyebrow: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.8, textTransform: 'uppercase'},
  noticeTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900, marginTop: 6},
  noticeText: {fontSize: 14, color: colors.ink500, marginTop: 6, lineHeight: 20},
});
