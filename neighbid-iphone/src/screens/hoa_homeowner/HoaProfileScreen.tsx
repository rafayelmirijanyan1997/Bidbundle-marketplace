import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import {Home, MapPin, Hash, Users} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {Button} from '../../components/Button';
import {useAuth} from '../../hooks/useAuth';
import {getMyHoaCommunity, HOAOut} from '../../api/community';

interface Props {
  onLogout: () => void;
}

export default function HoaProfileScreen({onLogout}: Props) {
  const {user} = useAuth();
  const [community, setCommunity] = useState<HOAOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyHoaCommunity()
      .then(setCommunity)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const communityTypeLabel = community?.type
    ? community.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Community';

  const initial = user?.full_name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {loading ? (
          <ActivityIndicator color={colors.terracotta600} style={{marginTop: 40}} />
        ) : (
          <>
            {/* ── Hero card ── */}
            <View style={s.heroCard}>
              <View style={s.heroOrb} />
              <View style={s.toolSilhouette}>
                <Home size={110} color={colors.terracotta400} strokeWidth={1} />
              </View>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initial}</Text>
                </View>
                <Text style={s.heroName}>{user?.full_name}</Text>
                <Text style={s.heroEmail}>{user?.email}</Text>
                <View style={s.badgeRow}>
                  <View style={s.roleBadge}>
                    <Home size={11} color={colors.cream200} strokeWidth={2} />
                    <Text style={s.roleBadgeText}>HOA Resident</Text>
                  </View>
                  {user?.unit_number ? (
                    <View style={s.roleBadge}>
                      <Text style={s.roleBadgeText}>Unit {user.unit_number}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={s.heroStatRow}>
                <View style={s.heroStatPill}>
                  <Users size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue} numberOfLines={1}>{community?.name ?? '—'}</Text>
                  <Text style={s.heroStatLabel}>community</Text>
                </View>
                <View style={s.heroStatPill}>
                  <Hash size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue}>{user?.unit_number ?? '—'}</Text>
                  <Text style={s.heroStatLabel}>unit</Text>
                </View>
                <View style={s.heroStatPill}>
                  <MapPin size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue} numberOfLines={1}>{community?.neighborhood ?? '—'}</Text>
                  <Text style={s.heroStatLabel}>area</Text>
                </View>
              </View>
            </View>

            {/* Unit info */}
            {user?.unit_number ? (
              <View style={s.unitCard}>
                <Text style={s.unitLabel}>Your unit</Text>
                <Text style={s.unitValue}>Unit {user.unit_number}</Text>
              </View>
            ) : null}

            {/* HOA note */}
            <View style={s.noteCard}>
              <View style={s.noteIconRow}>
                <MapPin size={16} color={colors.terracotta600} strokeWidth={2} />
                <Text style={s.noteEyebrow}>HOA-managed account</Text>
              </View>
              <Text style={s.noteTitle}>Your community details are managed by your HOA administrator.</Text>
              <Text style={s.noteSub}>
                Contact your HOA manager to update your unit or community information.
              </Text>
            </View>
          </>
        )}

        <View style={s.logoutSection}>
          <Button label="Log out" variant="ghost" onPress={onLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  scroll: {paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100},

  // Hero card
  heroCard: {
    backgroundColor: colors.warmDark, borderRadius: radius.xl,
    padding: 24, overflow: 'hidden', marginBottom: 16, ...shadow.lg,
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    right: -80, top: -70, backgroundColor: 'rgba(194,85,43,0.14)',
  },
  toolSilhouette: {position: 'absolute', right: -30, top: 10, opacity: 0.07},
  avatarWrap: {alignItems: 'center'},
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.terracotta500,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)',
    ...shadow.md,
  },
  avatarText: {color: '#fff', fontSize: 26, fontWeight: '700'},
  heroName: {fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center'},
  heroEmail: {fontSize: 14, color: colors.cream300, marginTop: 4, textAlign: 'center'},
  badgeRow: {flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center'},
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  roleBadgeText: {fontSize: 12, fontWeight: '700', color: colors.white},
  heroStatRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  heroStatPill: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg,
    paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', gap: 4,
  },
  heroStatValue: {fontSize: 12, fontWeight: '700', color: colors.white, textAlign: 'center'},
  heroStatLabel: {fontSize: 10, color: colors.cream300, textTransform: 'uppercase', letterSpacing: 0.7},

  // Below-hero cards
  unitCard: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, marginBottom: 12,
  },
  unitLabel: {fontSize: 13, fontWeight: '600', color: colors.terracotta600},
  unitValue: {fontSize: 20, fontWeight: '800', color: colors.ink900},
  noteCard: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100, padding: 18, marginBottom: 14,
  },
  noteIconRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6},
  noteEyebrow: {fontSize: 11, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.8, textTransform: 'uppercase'},
  noteTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900, marginTop: 2},
  noteSub: {fontSize: 14, color: colors.ink500, lineHeight: 20, marginTop: 6},
  logoutSection: {marginTop: 8},
});
