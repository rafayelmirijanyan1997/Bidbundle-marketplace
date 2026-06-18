import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  ActivityIndicator, TouchableOpacity, Modal, TextInput,
  Alert, Clipboard, RefreshControl,
} from 'react-native';
import {SafeAreaView as SafeAreaViewContext} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {UserPlus, X, Copy, Users, Check, Clock, ShieldOff} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {Button} from '../../components/Button';
import {
  getMyAdminCommunity, getHoaMembers, createInvite,
  getMembershipRequests, approveMembershipRequest, declineMembershipRequest, removeMember,
  HOAOut, HoaMemberOut, InviteOut, MembershipRequestOut,
} from '../../api/community';

export default function AdminResidentsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [hoa, setHoa] = useState<HOAOut | null>(null);
  const [members, setMembers] = useState<HoaMemberOut[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MembershipRequestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUnit, setInviteUnit] = useState('');
  const [inviting, setInviting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<InviteOut | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const community = await getMyAdminCommunity();
      setHoa(community);
      const [m, reqs] = await Promise.all([
        getHoaMembers(community.id),
        getMembershipRequests(),
      ]);
      setMembers(m);
      setPendingRequests(reqs.filter(r => r.status === 'pending'));
    } catch {
      // empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {load();}, [load]);
  const onRefresh = () => {setRefreshing(true); load();};

  async function handleInvite() {
    if (!hoa || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      const invite = await createInvite(hoa.id, inviteEmail.trim(), inviteUnit.trim() || undefined);
      setCreatedInvite(invite);
      setInviteEmail('');
      setInviteUnit('');
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create invite');
    } finally {
      setInviting(false);
    }
  }

  async function handleApprove(req: MembershipRequestOut) {
    setActioningId(req.id);
    try {
      await approveMembershipRequest(req.id);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to approve');
    } finally {
      setActioningId(null);
    }
  }

  async function handleDecline(req: MembershipRequestOut) {
    Alert.alert(
      'Decline request',
      `Decline ${req.full_name}'s request to join?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Decline', style: 'destructive', onPress: async () => {
            setActioningId(req.id);
            try {
              await declineMembershipRequest(req.id);
              await load();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to decline');
            } finally {
              setActioningId(null);
            }
          },
        },
      ],
    );
  }

  async function handleRevoke(member: HoaMemberOut) {
    if (!hoa) return;
    Alert.alert(
      'Revoke access',
      `Remove ${member.full_name} from ${hoa.name}? They will no longer have community access.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Revoke', style: 'destructive', onPress: async () => {
            setActioningId(member.user_id);
            try {
              await removeMember(hoa.id, member.user_id);
              await load();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to revoke');
            } finally {
              setActioningId(null);
            }
          },
        },
      ],
    );
  }

  function copyCode(code: string) {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Invite code copied to clipboard');
  }

  function openInviteModal() {
    setCreatedInvite(null);
    setInviteEmail('');
    setInviteUnit('');
    setShowInviteModal(true);
  }

  const avatarColors = [colors.terracotta500, colors.sage600, colors.sky600, colors.gold500, '#7B68A8'];
  const totalCount = members.length;

  const ListHeader = (
    <>
      {/* Master invite code */}
      {hoa?.master_invite_code ? (
        <TouchableOpacity style={s.masterCodeCard} onPress={() => copyCode(hoa.master_invite_code!)} activeOpacity={0.7}>
          <View>
            <Text style={s.masterCodeLabel}>MASTER INVITE CODE</Text>
            <Text style={s.masterCodeText}>{hoa.master_invite_code}</Text>
          </View>
          <View style={s.copyBtnFull}>
            <Copy size={14} color={colors.terracotta600} strokeWidth={2} />
            <Text style={s.copyBtnFullText}>Copy</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Pending requests section */}
      {pendingRequests.length > 0 && (
        <View style={s.pendingSection}>
          <View style={s.pendingSectionHeader}>
            <View style={s.pendingDot} />
            <Text style={s.pendingSectionTitle}>
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {pendingRequests.map(req => {
            const isActioning = actioningId === req.id;
            return (
              <View key={req.id} style={s.pendingCard}>
                <View style={s.pendingAvatarWrap}>
                  <View style={[s.pendingAvatar, {backgroundColor: colors.gold500}]}>
                    <Text style={s.pendingAvatarText}>{req.full_name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.pendingClockBadge}>
                    <Clock size={10} color={colors.gold600} strokeWidth={2.5} />
                  </View>
                </View>
                <View style={s.pendingInfo}>
                  <Text style={s.pendingName}>{req.full_name}</Text>
                  <Text style={s.pendingEmail}>{req.email}</Text>
                  {req.unit_number ? <Text style={s.pendingUnit}>Unit {req.unit_number}</Text> : null}
                </View>
                <View style={s.pendingActions}>
                  {isActioning ? (
                    <ActivityIndicator size="small" color={colors.terracotta600} />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={s.approveBtn}
                        onPress={() => handleApprove(req)}
                        activeOpacity={0.8}>
                        <Check size={14} color="#fff" strokeWidth={2.5} />
                        <Text style={s.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.declineBtn}
                        onPress={() => handleDecline(req)}
                        activeOpacity={0.8}>
                        <X size={14} color="#DC2626" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Members section title */}
      {totalCount > 0 && (
        <Text style={s.membersSectionTitle}>
          {totalCount} member{totalCount !== 1 ? 's' : ''}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaViewContext style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.headerRow}>
        <View>
          <Text style={s.title}>Residents</Text>
          {!loading && (
            <Text style={s.subtitle}>
              {totalCount} member{totalCount !== 1 ? 's' : ''}
              {pendingRequests.length > 0 ? ` · ${pendingRequests.length} pending` : ''}
              {hoa ? ` · ${hoa.name}` : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity style={s.inviteBtn} onPress={openInviteModal} activeOpacity={0.8}>
          <UserPlus size={14} color="#fff" strokeWidth={2.5} />
          <Text style={s.inviteBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={colors.terracotta600} size="large" /></View>
      ) : members.length === 0 && pendingRequests.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={s.emptyCard}>
            <View style={s.emptyIconWrap}>
              <Users size={28} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <Text style={s.emptyTitle}>No residents yet</Text>
            <Text style={s.emptySub}>
              Invite your first resident. They'll sign up with an invite code and you'll approve their request here.
            </Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openInviteModal}>
              <UserPlus size={14} color="#fff" strokeWidth={2.5} />
              <Text style={s.emptyBtnText}>Invite first resident</Text>
            </TouchableOpacity>
          </View>

          {hoa?.master_invite_code ? (
            <View style={s.masterCodeCardLarge}>
              <Text style={s.masterCodeLabel}>MASTER INVITE CODE</Text>
              <View style={s.masterCodeRowLarge}>
                <Text style={s.masterCodeTextLarge}>{hoa.master_invite_code}</Text>
                <TouchableOpacity style={s.copyBtnCircle} onPress={() => copyCode(hoa.master_invite_code!)}>
                  <Copy size={14} color={colors.terracotta600} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <Text style={s.masterCodeNote}>Any resident can use this code to join and request approval.</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.user_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16, paddingTop: 4, paddingBottom: tabBarHeight + 20}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta600} />}
          ListHeaderComponent={ListHeader}
          renderItem={({item}) => {
            const avatarBg = avatarColors[item.user_id % avatarColors.length];
            const isActioning = actioningId === item.user_id;
            return (
              <View style={s.memberCard}>
                <View style={[s.memberAvatar, {backgroundColor: avatarBg}]}>
                  <Text style={s.memberInitial}>{item.full_name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>{item.full_name}</Text>
                  <Text style={s.memberEmail}>{item.email}</Text>
                  {item.unit_number ? (
                    <View style={s.unitBadge}>
                      <Text style={s.unitBadgeText}>Unit {item.unit_number}</Text>
                    </View>
                  ) : null}
                </View>
                {isActioning ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <TouchableOpacity
                    style={s.revokeBtn}
                    onPress={() => handleRevoke(item)}
                    activeOpacity={0.8}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <ShieldOff size={16} color={colors.ink300} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}>
        <SafeAreaView style={s.modal}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowInviteModal(false)} style={s.modalClose} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <X size={20} color={colors.ink500} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={s.modalTitle}>Invite a resident</Text>
            <View style={{width: 36}} />
          </View>

          {createdInvite ? (
            <View style={s.modalBody}>
              <View style={s.successCard}>
                <View style={s.successIconWrap}>
                  <UserPlus size={24} color={colors.sage700} strokeWidth={2} />
                </View>
                <Text style={s.successTitle}>Invite created!</Text>
                <Text style={s.successSub}>Share this code with {createdInvite.email}:</Text>
                <View style={s.codeBox}>
                  <Text style={s.codeText}>{createdInvite.code}</Text>
                  <TouchableOpacity style={s.codeCopyBtn} onPress={() => copyCode(createdInvite.code)}>
                    <Copy size={14} color="#fff" strokeWidth={2} />
                    <Text style={s.codeCopyText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.expireNote}>Expires in 7 days · Requires your approval after sign-up</Text>
              </View>
              <Button label="Invite another resident" onPress={() => setCreatedInvite(null)} style={s.modalBtn} />
              <Button label="Done" variant="ghost" onPress={() => setShowInviteModal(false)} style={s.modalBtn} />
            </View>
          ) : (
            <View style={s.modalBody}>
              <Text style={s.modalDesc}>
                Generate a personal invite code. After signing up, the resident will appear here as a pending request for you to approve.
              </Text>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={s.input}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="resident@email.com"
                  placeholderTextColor={colors.ink300}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>UNIT NUMBER (optional)</Text>
                <TextInput
                  style={s.input}
                  value={inviteUnit}
                  onChangeText={setInviteUnit}
                  placeholder="e.g. 4B"
                  placeholderTextColor={colors.ink300}
                />
              </View>
              <Button
                label={inviting ? 'Creating invite…' : 'Create invite'}
                onPress={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                loading={inviting}
                style={s.modalBtn}
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaViewContext>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  title: {fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5},
  subtitle: {fontSize: 13, color: colors.ink400, marginTop: 2},
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  inviteBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},

  // Master invite code
  masterCodeCard: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  masterCodeCardLarge: {
    backgroundColor: colors.terracotta50, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.terracotta100, padding: 18,
  },
  masterCodeLabel: {fontSize: 10, fontWeight: '700', color: colors.terracotta600, letterSpacing: 1, marginBottom: 6},
  masterCodeText: {fontSize: 18, fontWeight: '800', color: colors.terracotta600, letterSpacing: 1.5},
  masterCodeTextLarge: {fontSize: 22, fontWeight: '800', color: colors.ink900, letterSpacing: 2},
  masterCodeRowLarge: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  masterCodeNote: {fontSize: 12, color: colors.ink400, lineHeight: 16},
  copyBtnCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.terracotta100,
    alignItems: 'center', justifyContent: 'center',
  },
  copyBtnFull: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.terracotta100,
  },
  copyBtnFullText: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},

  // Pending requests
  pendingSection: {marginBottom: 16},
  pendingSectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
  pendingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold500,
  },
  pendingSectionTitle: {fontSize: 14, fontWeight: '700', color: colors.ink700},
  pendingCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.gold500 + '40',
    flexDirection: 'row', alignItems: 'center', padding: 12,
    marginBottom: 8, ...shadow.sm,
  },
  pendingAvatarWrap: {position: 'relative', marginRight: 12},
  pendingAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  pendingAvatarText: {fontSize: 18, fontWeight: '800', color: '#fff'},
  pendingClockBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.gold50, borderWidth: 1.5, borderColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  pendingInfo: {flex: 1},
  pendingName: {fontSize: 14, fontWeight: '700', color: colors.ink900},
  pendingEmail: {fontSize: 12, color: colors.ink400, marginTop: 1},
  pendingUnit: {fontSize: 11, fontWeight: '600', color: colors.ink300, marginTop: 2},
  pendingActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.sage700, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  approveBtnText: {fontSize: 13, fontWeight: '700', color: '#fff'},
  declineBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    alignItems: 'center', justifyContent: 'center',
  },

  // Members section
  membersSectionTitle: {
    fontSize: 14, fontWeight: '700', color: colors.ink500, marginBottom: 10,
  },
  memberCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', padding: 14,
    marginBottom: 10, ...shadow.sm,
  },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  memberInitial: {fontSize: 18, fontWeight: '800', color: '#fff'},
  memberInfo: {flex: 1},
  memberName: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  memberEmail: {fontSize: 12, color: colors.ink400, marginTop: 2},
  unitBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: colors.cream100, borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  unitBadgeText: {fontSize: 11, fontWeight: '700', color: colors.ink700},
  revokeBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },

  // Empty state
  emptyWrap: {flex: 1, padding: 20},
  emptyCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: 28, alignItems: 'center', ...shadow.sm, marginBottom: 12,
  },
  emptyIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.terracotta50, borderWidth: 1.5, borderColor: colors.terracotta100,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: {fontSize: 18, fontWeight: '800', color: colors.ink900, marginBottom: 8},
  emptySub: {fontSize: 14, color: colors.ink400, textAlign: 'center', lineHeight: 20, marginBottom: 20},
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},

  // Modal
  modal: {flex: 1, backgroundColor: colors.bgApp},
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalClose: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  modalTitle: {fontSize: 17, fontWeight: '800', color: colors.ink900},
  modalBody: {padding: 20},
  modalDesc: {fontSize: 14, color: colors.ink500, lineHeight: 20, marginBottom: 20},
  fieldWrap: {marginBottom: 16},
  fieldLabel: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 8},
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, height: 50, paddingHorizontal: 16,
    fontSize: 15, color: colors.ink900,
  },
  modalBtn: {marginTop: 8},

  successCard: {
    backgroundColor: colors.sage50, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.sage100, padding: 24,
    alignItems: 'center', marginBottom: 20,
  },
  successIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(74,106,77,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  successTitle: {fontSize: 20, fontWeight: '800', color: colors.sage700, marginBottom: 6},
  successSub: {fontSize: 14, color: colors.ink500, marginBottom: 18, textAlign: 'center'},
  codeBox: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 10,
  },
  codeText: {fontSize: 24, fontWeight: '800', color: colors.ink900, letterSpacing: 2.5},
  codeCopyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.terracotta600, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  codeCopyText: {fontSize: 13, fontWeight: '700', color: '#fff'},
  expireNote: {fontSize: 12, color: colors.ink400, textAlign: 'center'},
});
