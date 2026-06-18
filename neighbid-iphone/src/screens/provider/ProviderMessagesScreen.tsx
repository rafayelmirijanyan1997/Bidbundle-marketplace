import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {ArrowLeft, MessageCircle, Send, Sparkles, Users} from 'lucide-react-native';
import {
  providerApi,
  ProviderConversation,
  ProviderGroupChannel,
  ProviderMessage,
} from '../../api/provider';
import {aiApi} from '../../api/ai';
import {colors, radius, shadow} from '../../theme';

type ChatTarget =
  | {type: 'ai'; name: string; sub: string}
  | {type: 'channel'; id: number; name: string; sub: string}
  | {type: 'dm'; id: number; name: string; sub: string};

interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
}

function renderInlineMarkdown(text: string, baseStyle: any, strongStyle: any) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={[baseStyle, strongStyle]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return (
      <Text key={index} style={baseStyle}>
        {part}
      </Text>
    );
  });
}

function renderAiMessageBody(text: string) {
  const lines = text.split('\n');
  return (
    <View style={ai.messageWrap}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
          return <View key={index} style={ai.spacer} />;
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <View key={index} style={ai.numberRow}>
              <Text style={ai.numberLabel}>{numberedMatch[1]}.</Text>
              <Text style={ai.lineText}>
                {renderInlineMarkdown(numberedMatch[2], ai.lineText, ai.lineTextStrong)}
              </Text>
            </View>
          );
        }

        const bulletMatch = line.match(/^[-•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <View key={index} style={ai.bulletRow}>
              <Text style={ai.bulletLabel}>•</Text>
              <Text style={ai.bulletText}>
                {renderInlineMarkdown(bulletMatch[1], ai.bulletText, ai.lineTextStrong)}
              </Text>
            </View>
          );
        }

        return (
          <Text key={index} style={ai.lineText}>
            {renderInlineMarkdown(line, ai.lineText, ai.lineTextStrong)}
          </Text>
        );
      })}
    </View>
  );
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) {return '';}
  return new Date(iso).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
}

function avatarColor(name: string) {
  const palette = [colors.terracotta500, colors.sage600, colors.sky600, '#B07AA0', colors.gold500];
  let hash = 0;
  for (const char of name) {hash += char.charCodeAt(0);}
  return palette[hash % palette.length];
}

function ProviderAiThread({target, onBack}: {target: Extract<ChatTarget, {type: 'ai'}>; onBack: () => void}) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi. I can help you review nearby jobs, think through pricing, and summarize your current bid pipeline.',
    },
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const quickPrompts = [
    'Which jobs should I focus on first?',
    'Help me price this week’s group jobs.',
    'Summarize my current bids and wins.',
  ];
  const composerPaddingBottom = Math.max(insets.bottom, 10) + tabBarHeight + 8;
  const listPaddingBottom = composerPaddingBottom + 76;

  async function sendMessage() {
    if (!text.trim() || sending) {return;}
    const body = text.trim();
    const userMessage: AiMessage = {id: Date.now().toString(), role: 'user', text: body};
    const loadingMessage: AiMessage = {id: 'loading', role: 'assistant', text: '', loading: true};
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setText('');
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
    try {
      const response = await aiApi.chat(body, 'provider');
      setMessages(prev => [
        ...prev.filter(message => message.id !== 'loading'),
        {id: `${Date.now()}-reply`, role: 'assistant', text: response.reply},
      ]);
    } catch (error: any) {
      console.warn('Provider AI chat error:', error.message);
      setMessages(prev => [
        ...prev.filter(message => message.id !== 'loading'),
        {id: `${Date.now()}-reply`, role: 'assistant', text: 'I could not reach the assistant right now. Try again in a moment.'},
      ]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
    }
  }

  return (
    <SafeAreaView style={thread.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
      <View style={thread.header}>
        <TouchableOpacity onPress={onBack} style={thread.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowLeft size={20} color={colors.ink700} strokeWidth={2} />
        </TouchableOpacity>
        <View style={[thread.avatar, {backgroundColor: colors.terracotta50}]}>
          <Sparkles size={16} color={colors.terracotta600} strokeWidth={2} />
        </View>
        <View style={{flex: 1}}>
          <Text style={thread.name}>{target.name}</Text>
          <Text style={thread.sub}>{target.sub}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        style={thread.listSurface}
        contentContainerStyle={[thread.list, {paddingBottom: listPaddingBottom, paddingTop: 12}]}
        renderItem={({item}) => item.role === 'user' ? (
          <View style={ai.userRow}>
            <View style={ai.userBubble}>
              <Text style={ai.userText}>{item.text}</Text>
            </View>
          </View>
        ) : (
          <View style={ai.aiRow}>
            <View style={ai.aiAvatar}>
              <Sparkles size={12} color={colors.terracotta600} strokeWidth={2} />
            </View>
            <View style={ai.aiBubble}>
              {item.loading
                ? <ActivityIndicator size="small" color={colors.terracotta600} />
                : renderAiMessageBody(item.text)}
            </View>
          </View>
        )}
        ListFooterComponent={messages.length <= 1 ? (
          <View style={ai.quickPromptWrap}>
            {quickPrompts.map(prompt => (
              <TouchableOpacity key={prompt} style={ai.quickPrompt} onPress={() => setText(prompt)}>
                <Text style={ai.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      />

      <View style={[thread.inputBar, {paddingBottom: composerPaddingBottom}]}>
        <TextInput
          style={thread.input}
          value={text}
          onChangeText={setText}
          placeholder="Ask about pricing, jobs, or your pipeline..."
          placeholderTextColor={colors.ink300}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          style={[thread.sendBtn, (!text.trim() || sending) && thread.sendBtnDisabled]}>
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Send size={16} color="#fff" strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProviderThread({
  target,
  onBack,
}: {
  target: Extract<ChatTarget, {type: 'channel' | 'dm'}>;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<ProviderMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const composerPaddingBottom = Math.max(insets.bottom, 10) + tabBarHeight + 8;
  const listPaddingBottom = composerPaddingBottom + 76;

  const loadMessages = useCallback(async () => {
    const data = target.type === 'channel'
      ? await providerApi.getChannelMessages(target.id)
      : await providerApi.getMessages(target.id);
    setMessages(data);
    setTimeout(() => listRef.current?.scrollToEnd({animated: false}), 120);
  }, [target.id, target.type]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function sendMessage() {
    if (!text.trim() || sending) {return;}
    const body = text.trim();
    setText('');
    setSending(true);
    try {
      if (target.type === 'channel') {
        await providerApi.sendChannelMessage(target.id, body);
      } else {
        await providerApi.sendMessage(target.id, body);
      }
      await loadMessages();
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 120);
    } catch (error: any) {
      console.warn('Provider thread send error:', error.message);
      setText(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={thread.safe} edges={['top']}>
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <View style={thread.header}>
        <TouchableOpacity onPress={onBack} style={thread.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ArrowLeft size={20} color={colors.ink700} strokeWidth={2} />
        </TouchableOpacity>
        <View style={[thread.avatar, {backgroundColor: avatarColor(target.name)}]}>
          <Text style={thread.avatarText}>{initials(target.name)}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={thread.name}>{target.name}</Text>
          <Text style={thread.sub}>{target.sub}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        style={thread.listSurface}
        contentContainerStyle={[thread.list, {paddingBottom: listPaddingBottom, paddingTop: 12}]}
        renderItem={({item}) => (
          <View style={thread.messageRow}>
            <View style={[thread.messageAvatar, {backgroundColor: avatarColor(item.sender_name)}]}>
              <Text style={thread.messageAvatarText}>{initials(item.sender_name)}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={thread.messageMeta}>
                <Text style={thread.sender}>{item.sender_name}</Text>
                <Text style={thread.time}>{formatTime(item.created_at)}</Text>
              </View>
              <View style={thread.bubble}>
                <Text style={thread.bubbleText}>{item.text}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={thread.emptyWrap}>
            <View style={thread.emptyBadge}>
              {target.type === 'channel'
                ? <Users size={18} color={colors.terracotta600} strokeWidth={2} />
                : <MessageCircle size={18} color={colors.terracotta600} strokeWidth={2} />}
            </View>
            <Text style={thread.emptyTitle}>No messages yet</Text>
            <Text style={thread.emptySub}>Start the conversation so the homeowner group can reply here.</Text>
          </View>
        }
      />

      <View style={[thread.inputBar, {paddingBottom: composerPaddingBottom}]}>
        <TextInput
          style={thread.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.ink300}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          style={[thread.sendBtn, (!text.trim() || sending) && thread.sendBtnDisabled]}>
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Send size={16} color="#fff" strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ProviderMessagesScreen() {
  const [channels, setChannels] = useState<ProviderGroupChannel[]>([]);
  const [conversations, setConversations] = useState<ProviderConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTarget, setActiveTarget] = useState<ChatTarget | null>(null);

  const load = useCallback(async () => {
    try {
      const [channelData, conversationData] = await Promise.all([
        providerApi.getChannels(),
        providerApi.getConversations(),
      ]);
      setChannels(channelData);
      setConversations(conversationData);
    } catch (error: any) {
      console.warn('Provider messages error:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (activeTarget) {
    if (activeTarget.type === 'ai') {
      return <ProviderAiThread target={activeTarget} onBack={() => setActiveTarget(null)} />;
    }
    return <ProviderThread target={activeTarget} onBack={() => setActiveTarget(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={[{key: 'content'}]}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.terracotta600}
          />
        }
        contentContainerStyle={styles.container}
        renderItem={() => (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Messages</Text>
              <Text style={styles.sub}>Group chats from won jobs and direct homeowner conversations.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI assistant</Text>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => setActiveTarget({
                  type: 'ai',
                  name: 'Provider AI',
                  sub: 'Bid pricing and job strategy',
                })}
                style={styles.aiCard}>
                <View style={styles.aiIcon}>
                  <Sparkles size={18} color={colors.terracotta600} strokeWidth={2} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>Provider AI</Text>
                  <Text style={styles.rowSub}>Ask for pricing help, job prioritization, and bid summaries.</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Group channels</Text>
              {channels.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No group channels yet</Text>
                  <Text style={styles.emptySub}>Accepted group jobs will appear here so you can coordinate with the homeowners.</Text>
                </View>
              ) : (
                channels.map(channel => (
                  <TouchableOpacity
                    key={channel.id}
                    activeOpacity={0.86}
                    onPress={() => setActiveTarget({
                      type: 'channel',
                      id: channel.id,
                      name: channel.request_title,
                      sub: `${channel.member_count} members · Group channel`,
                    })}
                    style={styles.rowCard}>
                    <View style={[styles.rowAvatar, {backgroundColor: colors.sage50}]}>
                      <Users size={18} color={colors.sage700} strokeWidth={2} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{channel.request_title}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {channel.last_message ?? 'No messages yet'}
                      </Text>
                    </View>
                    <View style={styles.rowMeta}>
                      {channel.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{channel.unread_count}</Text>
                        </View>
                      )}
                      <Text style={styles.timeText}>{formatTime(channel.last_message_at)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Direct messages</Text>
              {conversations.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No direct messages</Text>
                  <Text style={styles.emptySub}>When a homeowner messages you one to one, it will show up here.</Text>
                </View>
              ) : (
                conversations.map(conversation => (
                  <TouchableOpacity
                    key={conversation.id}
                    activeOpacity={0.86}
                    onPress={() => setActiveTarget({
                      type: 'dm',
                      id: conversation.id,
                      name: conversation.other_user_name,
                      sub: 'Direct message',
                    })}
                    style={styles.rowCard}>
                    <View style={[styles.rowAvatar, {backgroundColor: avatarColor(conversation.other_user_name)}]}>
                      <Text style={styles.rowAvatarText}>{initials(conversation.other_user_name)}</Text>
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{conversation.other_user_name}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {conversation.last_message ?? 'No messages yet'}
                      </Text>
                    </View>
                    <View style={styles.rowMeta}>
                      {conversation.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{conversation.unread_count}</Text>
                        </View>
                      )}
                      <Text style={styles.timeText}>{formatTime(conversation.last_message_at)}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120},
  header: {marginBottom: 20},
  title: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
  sub: {fontSize: 14, color: colors.ink400, marginTop: 4, lineHeight: 20},
  section: {marginBottom: 22},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900, marginBottom: 10},
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadow.sm,
  },
  emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 13, color: colors.ink400, marginTop: 6, lineHeight: 19},
  aiCard: {
    backgroundColor: colors.terracotta50,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow.sm,
  },
  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow.sm,
  },
  rowAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarText: {fontSize: 14, fontWeight: '700', color: colors.white},
  rowBody: {flex: 1},
  rowTitle: {fontSize: 15, fontWeight: '700', color: colors.ink900},
  rowSub: {fontSize: 13, color: colors.ink400, marginTop: 3},
  rowMeta: {alignItems: 'flex-end', gap: 6},
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.terracotta600,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {color: colors.white, fontSize: 11, fontWeight: '700'},
  timeText: {fontSize: 11, color: colors.ink300},
});

const thread = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  backBtn: {paddingRight: 2},
  avatar: {width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 14, fontWeight: '700', color: colors.white},
  name: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  sub: {fontSize: 12, color: colors.ink400, marginTop: 2},
  listSurface: {flex: 1, backgroundColor: colors.bgApp},
  list: {paddingHorizontal: 18, paddingTop: 18},
  messageRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  messageAvatar: {width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2},
  messageAvatarText: {fontSize: 12, fontWeight: '700', color: colors.white},
  messageMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4},
  sender: {fontSize: 12, fontWeight: '700', color: colors.ink700},
  time: {fontSize: 11, color: colors.ink300},
  bubble: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...shadow.sm,
  },
  bubbleText: {fontSize: 14, color: colors.ink900, lineHeight: 20},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
  emptyBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta50,
    marginBottom: 12,
  },
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 14, color: colors.ink400, marginTop: 6, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24},
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: colors.cream50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink900,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.terracotta600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {opacity: 0.45},
});

const ai = StyleSheet.create({
  userRow: {alignItems: 'flex-end', marginBottom: 14},
  userBubble: {
    maxWidth: '84%',
    backgroundColor: colors.terracotta600,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userText: {fontSize: 14, color: colors.white, lineHeight: 20},
  aiRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.terracotta50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...shadow.sm,
  },
  aiText: {fontSize: 14, color: colors.ink900, lineHeight: 20},
  messageWrap: {gap: 6},
  spacer: {height: 4},
  lineText: {fontSize: 14, color: colors.ink900, lineHeight: 21},
  lineTextStrong: {fontWeight: '700', color: colors.ink900},
  numberRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  numberLabel: {fontSize: 14, fontWeight: '700', color: colors.ink700, lineHeight: 21},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingLeft: 2},
  bulletLabel: {fontSize: 14, fontWeight: '700', color: colors.ink400, lineHeight: 21},
  bulletText: {flex: 1, fontSize: 14, color: colors.ink700, lineHeight: 21},
  quickPromptWrap: {marginTop: 10, gap: 8},
  quickPrompt: {
    backgroundColor: colors.cream100,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  quickPromptText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
});
