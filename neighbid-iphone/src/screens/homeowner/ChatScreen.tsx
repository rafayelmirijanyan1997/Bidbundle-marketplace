import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {
  Sparkles, MapPin, Users, MessageCircle,
  ChevronRight, Send, ArrowLeft,
} from 'lucide-react-native';
import {colors, radius, shadow} from '../../theme';
import {
  homeownerApi, Conversation, GroupChannel,
  NeighbourhoodChannel, ChatMessage, NeighbourhoodMessage,
} from '../../api/homeowner';
import {aiApi} from '../../api/ai';

type ChatTarget =
  | {type: 'ai'; name: string}
  | {type: 'neighbourhood'; channelId: number; name: string}
  | {type: 'group'; channelId: number; name: string}
  | {type: 'dm'; convId: number; name: string};

interface AiMessage {id: string; role: 'user' | 'assistant'; text: string; loading?: boolean;}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
}
function initials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}
function bubbleColor(name: string) {
  const palette = [colors.terracotta500, colors.sage600, '#6F8DB8', '#B07AA0', colors.gold500];
  let h = 0; for (const c of name) {h += c.charCodeAt(0);}
  return palette[h % palette.length];
}

// ── AI Chat screen ──────────────────────────────────────────────────────────
function AiChatScreen({onBack}: {onBack: () => void}) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AiMessage[]>([
    {id: '0', role: 'assistant', text: 'Hi! I\'m BidBundle AI. I can help you with your service requests, review bids, and answer questions about your neighbourhood groups. What can I help you with?'},
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  async function send() {
    if (!text.trim() || loading) {return;}
    const userMsg: AiMessage = {id: Date.now().toString(), role: 'user', text: text.trim()};
    const loadingMsg: AiMessage = {id: 'loading', role: 'assistant', text: '', loading: true};
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setText('');
    setLoading(true);
    setTimeout(() => flatRef.current?.scrollToEnd({animated: true}), 100);
    try {
      const res = await aiApi.chat(userMsg.text);
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {id: (Date.now() + 1).toString(), role: 'assistant', text: res.reply},
      ]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {id: (Date.now() + 1).toString(), role: 'assistant', text: 'Sorry, I\'m having trouble connecting. Please try again.'},
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({animated: true}), 100);
    }
  }

  const quickPrompts = [
    'What are my active requests?',
    'Show me my pending bids',
    'What\'s the best bid I have?',
  ];

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View style={ai.header}>
        <TouchableOpacity onPress={onBack} style={ai.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowLeft size={20} color={colors.ink700} strokeWidth={2} />
        </TouchableOpacity>
        <View style={ai.headerIcon}>
          <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
        </View>
        <View>
          <Text style={ai.headerName}>BidBundle AI</Text>
          <Text style={ai.headerSub}>Powered by gpt-4o-mini</Text>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={[ai.list, {paddingBottom: 140}]}
        style={ai.listSurface}
        renderItem={({item}) => {
          if (item.role === 'user') {
            return (
              <View style={ai.userRow}>
                <View style={ai.userBubble}>
                  <Text style={ai.userText}>{item.text}</Text>
                </View>
              </View>
            );
          }
          if (item.loading) {
            return (
              <View style={ai.aiBubbleRow}>
                <View style={ai.aiAvatar}><Sparkles size={12} color={colors.terracotta600} strokeWidth={2} /></View>
                <View style={ai.aiBubble}>
                  <ActivityIndicator size="small" color={colors.terracotta600} />
                </View>
              </View>
            );
          }
          return (
            <View style={ai.aiBubbleRow}>
              <View style={ai.aiAvatar}><Sparkles size={12} color={colors.terracotta600} strokeWidth={2} /></View>
              <View style={ai.aiBubble}>
                <Text style={ai.aiText}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={messages.length <= 1 ? (
          <View style={ai.quickPromptsWrap}>
            {quickPrompts.map(p => (
              <TouchableOpacity key={p} style={ai.quickPrompt} onPress={() => {setText(p);}}>
                <Text style={ai.quickPromptText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      />

      <View style={[ai.inputBar, {paddingBottom: Math.max(insets.bottom, 10) + 84}]}>
        <TextInput
          style={ai.input}
          value={text}
          onChangeText={setText}
          placeholder="Ask about your requests, bids, savings…"
          placeholderTextColor={colors.ink300}
          multiline
          returnKeyType="send"
          onSubmitEditing={send}
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={send}
          disabled={!text.trim() || loading}
          style={[ai.sendBtn, (!text.trim() || loading) && ai.sendBtnDisabled]}>
          <Send size={16} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Message thread screen ───────────────────────────────────────────────────
function ThreadScreen({
  target, onBack,
}: {target: ChatTarget & {type: 'neighbourhood' | 'group' | 'dm'}; onBack: () => void}) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<(ChatMessage | NeighbourhoodMessage)[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        let msgs: any[] = [];
        if (target.type === 'neighbourhood') {msgs = await homeownerApi.getNeighbourhoodMessages(target.channelId);}
        else if (target.type === 'group') {msgs = await homeownerApi.getChannelMessages(target.channelId);}
        else {msgs = await homeownerApi.getDmMessages(target.convId);}
        setMessages(msgs);
        setTimeout(() => flatRef.current?.scrollToEnd({animated: false}), 100);
      } catch (e: any) {Alert.alert('Error', e.message);}
    })();
  }, []);

  async function sendMessage() {
    if (!text.trim()) {return;}
    const t = text.trim(); setText('');
    setSending(true);
    try {
      if (target.type === 'neighbourhood') {await homeownerApi.sendNeighbourhoodMessage(target.channelId, t); setMessages(await homeownerApi.getNeighbourhoodMessages(target.channelId));}
      else if (target.type === 'group') {await homeownerApi.sendChannelMessage(target.channelId, t); setMessages(await homeownerApi.getChannelMessages(target.channelId));}
      else {await homeownerApi.sendDm(target.convId, t); setMessages(await homeownerApi.getDmMessages(target.convId));}
      setTimeout(() => flatRef.current?.scrollToEnd({animated: true}), 100);
    } catch (e: any) {Alert.alert('Error', e.message);}
    finally {setSending(false);}
  }

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View style={thread.header}>
        <TouchableOpacity onPress={onBack} style={thread.backBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <ArrowLeft size={20} color={colors.ink700} strokeWidth={2} />
        </TouchableOpacity>
        <View style={[thread.avatar, {backgroundColor: bubbleColor(target.name)}]}>
          <Text style={thread.avatarTxt}>{initials(target.name)}</Text>
        </View>
        <View>
          <Text style={thread.headerName}>{target.name}</Text>
          <Text style={thread.headerSub}>
            {target.type === 'neighbourhood' ? 'Neighbourhood channel' : target.type === 'group' ? 'Group channel' : 'Direct message'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => String(m.id)}
        contentContainerStyle={[thread.list, {paddingBottom: 140}]}
        style={thread.listSurface}
        renderItem={({item}) => {
          const isNb = 'content' in item;
          const sender = isNb ? (item as NeighbourhoodMessage).sender_name : (item as ChatMessage).sender_name;
          const body = isNb ? (item as NeighbourhoodMessage).content : (item as ChatMessage).text;
          const isAi = body.startsWith('[BidBundle AI]');
          return (
            <View style={thread.msgRow}>
              <View style={[thread.msgAvatar, {backgroundColor: isAi ? colors.terracotta50 : bubbleColor(sender)}]}>
                {isAi ? <Sparkles size={11} color={colors.terracotta600} strokeWidth={2} /> : <Text style={thread.msgAvatarTxt}>{initials(sender)}</Text>}
              </View>
              <View style={{flex: 1}}>
                <View style={thread.msgMeta}>
                  <Text style={thread.msgSender}>{isAi ? 'BidBundle AI' : sender}</Text>
                  <Text style={thread.msgTime}>{formatTime(item.created_at)}</Text>
                </View>
                <View style={[thread.bubble, isAi && thread.bubbleAi]}>
                  <Text style={[thread.bubbleText, isAi && thread.bubbleTextAi]}>{isAi ? body.replace('[BidBundle AI] ', '') : body}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={thread.empty}>
            <View style={thread.emptyBadge}>
              <Users size={18} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <Text style={thread.emptyTitle}>No messages yet</Text>
            <Text style={thread.emptyTxt}>Say hello to the group and start the thread.</Text>
          </View>
        }
      />

      <View style={[thread.inputBar, {paddingBottom: Math.max(insets.bottom, 10) + 84}]}>
        <TextInput
          style={thread.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={colors.ink300}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit
        />
        <TouchableOpacity onPress={sendMessage} disabled={!text.trim() || sending} style={[thread.sendBtn, (!text.trim() || sending) && thread.sendBtnOff]}>
          <Send size={15} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Main chat list ──────────────────────────────────────────────────────────
export default function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [nbChannel, setNbChannel] = useState<NeighbourhoodChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTarget, setActiveTarget] = useState<ChatTarget | null>(null);

  const load = useCallback(async () => {
    try {
      const [convs, chans, nb] = await Promise.all([
        homeownerApi.getConversations(),
        homeownerApi.getChannels(),
        homeownerApi.getNeighbourhoodChannel().catch(() => null),
      ]);
      setConversations(convs);
      setChannels(chans.filter(c => !c.archived));
      setNbChannel(nb);
    } catch (e: any) {console.warn('Chat error:', e.message);}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useEffect(() => {load();}, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (activeTarget !== null) {
    if ((activeTarget as any).type === 'ai') {
      return <SafeAreaView style={{flex:1,backgroundColor:colors.bgCard}} edges={['top']}><AiChatScreen onBack={() => setActiveTarget(null)} /></SafeAreaView>;
    }
    return <SafeAreaView style={{flex:1,backgroundColor:colors.bgCard}} edges={['top']}><ThreadScreen target={activeTarget as any} onBack={() => {setActiveTarget(null); load();}} /></SafeAreaView>;
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0) + channels.reduce((s, c) => s + c.unread_count, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <View style={styles.headerCard}>
          <View style={styles.headerGlow} />
          <View style={styles.headerTop}>
            <View style={styles.headerPill}>
              <MessageCircle size={11} color={colors.terracotta400} strokeWidth={2} />
              <Text style={styles.headerPillText}>Inbox</Text>
            </View>
            {totalUnread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{totalUnread} unread</Text></View>}
          </View>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>Neighbourhood, group, and direct conversations in one place.</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.terracotta600} /></View>
      ) : (
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={colors.terracotta600} />}
          contentContainerStyle={styles.listContent}
          data={[
            {key: 'ai'},
            ...(nbChannel ? [{key: 'nb', nb: nbChannel}] : []),
            ...channels.map(c => ({key: `ch-${c.id}`, ch: c})),
            ...conversations.map(c => ({key: `dm-${c.id}`, conv: c})),
          ]}
          keyExtractor={item => item.key}
          ListHeaderComponent={
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <MessageCircle size={18} color={colors.terracotta600} strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.heroTitle}>Stay close to the job</Text>
                <Text style={styles.heroSub}>Open your group channels to coordinate access, timing, and shared updates.</Text>
              </View>
            </View>
          }
          renderItem={({item}) => {
            // AI Chat row
            if (item.key === 'ai') {
              return (
                <TouchableOpacity style={[styles.row, styles.aiRow]} onPress={() => setActiveTarget({type: 'ai', name: 'BidBundle AI'})}>
                  <View style={[styles.rowAvatar, {backgroundColor: colors.terracotta50, borderWidth: 1, borderColor: colors.terracotta100}]}>
                    <Sparkles size={20} color={colors.terracotta600} strokeWidth={2} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>BidBundle AI</Text>
                    <Text style={styles.rowSub}>Ask about requests, bids, and savings</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <ChevronRight size={16} color={colors.ink300} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            }
            // Neighbourhood channel
            if ('nb' in item && item.nb) {
              const nb = item.nb;
              return (
                <TouchableOpacity style={styles.row} onPress={() => setActiveTarget({type: 'neighbourhood', channelId: nb.id, name: nb.neighbourhood_name})}>
                  <View style={[styles.rowAvatar, {backgroundColor: colors.sage50, borderWidth: 1, borderColor: colors.sage100}]}>
                    <MapPin size={18} color={colors.sage700} strokeWidth={2} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{nb.neighbourhood_name}</Text>
                    <Text style={styles.rowSub}>{nb.member_count} neighbours · General channel</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <ChevronRight size={16} color={colors.ink300} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            }
            // Group channel
            if ('ch' in item) {
              const ch = item.ch;
              return (
                <TouchableOpacity style={styles.row} onPress={() => setActiveTarget({type: 'group', channelId: ch.id, name: ch.request_title})}>
                  <View style={[styles.rowAvatar, {backgroundColor: colors.terracotta50, borderWidth: 1, borderColor: colors.terracotta100}]}>
                    <Users size={18} color={colors.terracotta600} strokeWidth={2} />
                  </View>
                  <View style={styles.rowInfo}>
                    <View style={styles.rowNameRow}>
                      <Text style={styles.rowName} numberOfLines={1}>{ch.request_title}</Text>
                      {ch.unread_count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{ch.unread_count}</Text></View>}
                    </View>
                    <Text style={styles.rowSub} numberOfLines={1}>{ch.member_count} members · {ch.last_message ?? 'No messages'}</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <ChevronRight size={16} color={colors.ink300} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            }
            // DM
            if ('conv' in item) {
              const conv = item.conv;
              return (
                <TouchableOpacity style={styles.row} onPress={() => setActiveTarget({type: 'dm', convId: conv.id, name: conv.other_user_name})}>
                  <View style={[styles.rowAvatar, {backgroundColor: bubbleColor(conv.other_user_name)}]}>
                    <Text style={styles.rowAvatarText}>{initials(conv.other_user_name)}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <View style={styles.rowNameRow}>
                      <Text style={styles.rowName}>{conv.other_user_name}</Text>
                      {conv.unread_count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{conv.unread_count}</Text></View>}
                    </View>
                    <Text style={styles.rowSub} numberOfLines={1}>{conv.last_message ?? 'No messages'}</Text>
                  </View>
                  <View style={styles.chevronWrap}>
                    <ChevronRight size={16} color={colors.ink300} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            }
            return null;
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageCircle size={40} color={colors.ink200} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptySub}>Your neighbourhood channel and group conversations will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── AI screen styles ───
const ai = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard},
  backBtn: {padding: 4},
  headerIcon: {width: 36, height: 36, borderRadius: 10, backgroundColor: colors.terracotta50, alignItems: 'center', justifyContent: 'center'},
  headerName: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  headerSub: {fontSize: 12, color: colors.ink400},
  listSurface: {backgroundColor: colors.bgApp},
  list: {padding: 16, gap: 12},
  userRow: {alignItems: 'flex-end'},
  userBubble: {backgroundColor: colors.terracotta600, borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%'},
  userText: {color: '#fff', fontSize: 15, lineHeight: 21},
  aiBubbleRow: {flexDirection: 'row', gap: 8, alignItems: 'flex-start'},
  aiAvatar: {width: 30, height: 30, borderRadius: 15, backgroundColor: colors.terracotta50, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  aiBubble: {backgroundColor: colors.bgCard, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '82%', minHeight: 40, justifyContent: 'center'},
  aiText: {color: colors.ink900, fontSize: 15, lineHeight: 22},
  quickPromptsWrap: {gap: 8, marginTop: 8},
  quickPrompt: {backgroundColor: colors.cream100, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12},
  quickPromptText: {fontSize: 14, color: colors.ink700, fontWeight: '500'},
  inputBar: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgCard, ...shadow.md},
  input: {flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: colors.cream100, borderRadius: 21, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.ink900, borderWidth: 1, borderColor: colors.border},
  sendBtn: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.terracotta600, alignItems: 'center', justifyContent: 'center'},
  sendBtnDisabled: {backgroundColor: colors.terracotta100},
});

// ─── Thread styles ───
const thread = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard},
  backBtn: {padding: 4},
  avatar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  avatarTxt: {color: '#fff', fontSize: 13, fontWeight: '700'},
  headerName: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  headerSub: {fontSize: 12, color: colors.ink400},
  listSurface: {backgroundColor: colors.bgApp},
  list: {padding: 14, gap: 14},
  msgRow: {flexDirection: 'row', gap: 8, alignItems: 'flex-start'},
  msgAvatar: {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  msgAvatarTxt: {color: '#fff', fontSize: 10, fontWeight: '700'},
  msgMeta: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
  msgSender: {fontSize: 12, fontWeight: '700', color: colors.ink700},
  msgTime: {fontSize: 10, color: colors.ink300},
  bubble: {backgroundColor: colors.bgCard, borderRadius: 14, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', maxWidth: '90%'},
  bubbleAi: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  bubbleText: {fontSize: 14, color: colors.ink900, lineHeight: 20},
  bubbleTextAi: {color: colors.terracotta600},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10},
  emptyBadge: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.terracotta50, borderWidth: 1, borderColor: colors.terracotta100, alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  emptyTxt: {fontSize: 14, color: colors.ink400, textAlign: 'center', lineHeight: 20},
  inputBar: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgCard, ...shadow.md},
  input: {flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: colors.cream100, borderRadius: 21, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.ink900, borderWidth: 1, borderColor: colors.border},
  sendBtn: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.terracotta600, alignItems: 'center', justifyContent: 'center'},
  sendBtnOff: {backgroundColor: colors.terracotta100},
});

// ─── List styles ───
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headerWrap: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4},
  headerCard: {
    backgroundColor: colors.warmDark, borderRadius: radius.xl,
    padding: 18, overflow: 'hidden', marginBottom: 12, ...shadow.lg,
  },
  headerGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    right: -60, top: -70, backgroundColor: 'rgba(194,85,43,0.16)',
  },
  headerTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  headerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    height: 24, paddingHorizontal: 10, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerPillText: {fontSize: 11, fontWeight: '700', color: colors.terracotta400, letterSpacing: 0.6},
  title: {fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5},
  subtitle: {fontSize: 14, color: colors.cream300, marginTop: 4, lineHeight: 20},
  unreadBadge: {backgroundColor: colors.terracotta500, borderRadius: radius.pill, paddingHorizontal: 10, height: 24, alignItems: 'center', justifyContent: 'center'},
  unreadBadgeText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  listContent: {paddingHorizontal: 16, paddingBottom: 130},
  heroCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    ...shadow.md,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.terracotta50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900},
  heroSub: {fontSize: 13, color: colors.ink500, marginTop: 4, lineHeight: 18},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: 10,
    ...shadow.md,
  },
  aiRow: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  rowAvatar: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  rowAvatarText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  rowInfo: {flex: 1},
  rowNameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  rowName: {fontSize: 15, fontWeight: '600', color: colors.ink900, flex: 1},
  rowSub: {fontSize: 13, color: colors.ink400, marginTop: 2},
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cream100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {backgroundColor: colors.terracotta600, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 6},
  badgeText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  empty: {alignItems: 'center', paddingTop: 80, gap: 12},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 14, color: colors.ink400, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20},
});
