import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert, Clipboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Copy, Building2, MapPin, Hash, Shield, ChevronRight, LogOut, Wrench} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {Button} from '../../components/Button';
import {useAuth} from '../../hooks/useAuth';
import {getMyAdminCommunity, HOAOut} from '../../api/community';

interface Props {
  onLogout: () => void;
}

export default function AdminProfileScreen({onLogout}: Props) {
  const {user} = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [hoa, setHoa] = useState<HOAOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAdminCommunity()
      .then(setHoa)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyCode() {
    if (hoa?.master_invite_code) {
      Clipboard.setString(hoa.master_invite_code);
      Alert.alert('Copied', 'Master invite code copied to clipboard');
    }
  }

  function confirmLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Log out', style: 'destructive', onPress: onLogout},
    ]);
  }

  const communityTypeLabel = hoa?.type
    ? hoa.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Community';

  const initial = hoa?.name?.charAt(0).toUpperCase() ?? user?.full_name?.charAt(0).toUpperCase() ?? 'H';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 16, paddingBottom: tabBarHeight + 36}}>

        {loading ? (
          <ActivityIndicator color={colors.terracotta600} style={{marginTop: 40}} />
        ) : (
          <>
            {/* ── Hero card ── */}
            <View style={s.heroCard}>
              <View style={s.heroOrb} />
              <View style={s.toolSilhouette}>
                <Building2 size={110} color={colors.terracotta400} strokeWidth={1} />
              </View>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initial}</Text>
                </View>
                <Text style={s.heroName}>{hoa?.name ?? user?.full_name ?? 'My Community'}</Text>
                <Text style={s.heroEmail}>{user?.email}</Text>
                <View style={s.badgeRow}>
                  <View style={s.roleBadge}>
                    <Shield size={11} color={colors.cream200} strokeWidth={2} />
                    <Text style={s.roleBadgeText}>HOA Manager</Text>
                  </View>
                  {hoa && (
                    <View style={s.roleBadge}>
                      <Text style={s.roleBadgeText}>{communityTypeLabel}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={s.heroStatRow}>
                <View style={s.heroStatPill}>
                  <Hash size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue}>{hoa?.unit_count ?? 0}</Text>
                  <Text style={s.heroStatLabel}>units</Text>
                </View>
                <View style={s.heroStatPill}>
                  <MapPin size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue} numberOfLines={1}>{hoa?.neighborhood ?? '—'}</Text>
                  <Text style={s.heroStatLabel}>area</Text>
                </View>
                <View style={s.heroStatPill}>
                  <Shield size={14} color={colors.terracotta400} strokeWidth={2} />
                  <Text style={s.heroStatValue}>Admin</Text>
                  <Text style={s.heroStatLabel}>role</Text>
                </View>
              </View>
            </View>

            {/* ── Community details ── */}
            {hoa && (
              <View style={s.detailsCard}>
                <Text style={s.cardEyebrow}>COMMUNITY DETAILS</Text>
                {[
                  {icon: <MapPin size={14} color={colors.ink400} strokeWidth={2} />, label: hoa.neighborhood},
                  {icon: <Building2 size={14} color={colors.ink400} strokeWidth={2} />, label: communityTypeLabel},
                  ...(hoa.unit_count ? [{icon: <Hash size={14} color={colors.ink400} strokeWidth={2} />, label: `${hoa.unit_count} units`}] : []),
                ].map((row, i, arr) => (
                  <View key={i} style={[s.detailRow, i < arr.length - 1 && s.detailRowBorder]}>
                    {row.icon}
                    <Text style={s.detailText}>{row.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Master invite code ── */}
            {hoa?.master_invite_code ? (
              <TouchableOpacity style={s.inviteCard} onPress={copyCode} activeOpacity={0.8}>
                <View style={s.inviteCardTop}>
                  <View>
                    <Text style={s.inviteEyebrow}>MASTER INVITE CODE</Text>
                    <Text style={s.inviteCode}>{hoa.master_invite_code}</Text>
                  </View>
                  <View style={s.copyBtnWrap}>
                    <Copy size={16} color={colors.terracotta600} strokeWidth={2} />
                    <Text style={s.copyBtnText}>Copy</Text>
                  </View>
                </View>
                <Text style={s.inviteNote}>
                  Share with any resident — they can use this code to join your community directly from the app.
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* ── Info card ── */}
            <View style={s.infoCard}>
              <View style={s.infoIconWrap}>
                <Shield size={16} color={colors.sage700} strokeWidth={2} />
              </View>
              <View style={s.infoText}>
                <Text style={s.infoTitle}>HOA Administrator</Text>
                <Text style={s.infoBody}>
                  As the HOA manager you control who joins this community, track group savings, and manage resident requests.
                </Text>
              </View>
            </View>

            {/* ── Actions ── */}
            <View style={s.actionsCard}>
              <TouchableOpacity style={s.actionRow} onPress={confirmLogout}>
                <View style={[s.actionIcon, {backgroundColor: '#FEF2F2'}]}>
                  <LogOut size={16} color="#DC2626" strokeWidth={2} />
                </View>
                <Text style={[s.actionLabel, {color: '#DC2626'}]}>Log out</Text>
                <ChevronRight size={16} color="#DC2626" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},

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
    paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', gap: 4,
  },
  heroStatValue: {fontSize: 13, fontWeight: '700', color: colors.white},
  heroStatLabel: {fontSize: 10, color: colors.cream300, textTransform: 'uppercase', letterSpacing: 0.7},

  // Details card
  detailsCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 16, marginBottom: 12, ...shadow.sm,
  },
  cardEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 14},
  detailRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10},
  detailRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  detailText: {fontSize: 14, fontWeight: '600', color: colors.ink700, flex: 1},

  // Invite code card
  inviteCard: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100,
    padding: 18, marginBottom: 12,
  },
  inviteCardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  inviteEyebrow: {fontSize: 10, fontWeight: '700', color: colors.terracotta600, letterSpacing: 1, marginBottom: 6},
  inviteCode: {fontSize: 26, fontWeight: '800', color: colors.ink900, letterSpacing: 2.5},
  copyBtnWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.terracotta100,
  },
  copyBtnText: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},
  inviteNote: {fontSize: 12, color: colors.ink500, lineHeight: 17},

  // Info card
  infoCard: {
    backgroundColor: colors.sage50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.sage100,
    padding: 16, flexDirection: 'row', gap: 12, marginBottom: 12,
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(74,106,77,0.1)', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: {flex: 1},
  infoTitle: {fontSize: 14, fontWeight: '700', color: colors.sage700, marginBottom: 4},
  infoBody: {fontSize: 13, color: colors.ink500, lineHeight: 18},

  // Actions
  actionsCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.sm,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  actionIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: {flex: 1, fontSize: 15, fontWeight: '600'},
});
