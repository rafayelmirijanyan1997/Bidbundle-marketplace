import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Bell, X} from 'lucide-react-native';
import {colors, radius} from '../theme';

export function NotificationCard({
  title,
  body,
  onDismiss,
}: {
  title: string;
  body: string;
  onDismiss: () => void;
}) {
  return (
    <View style={s.card}>
      <View style={s.left}>
        <Bell size={14} color={colors.terracotta600} strokeWidth={2} />
        <View style={s.text}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <Text style={s.body} numberOfLines={2}>{body}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <X size={16} color={colors.ink300} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.terracotta50,
    borderWidth: 1,
    borderColor: colors.terracotta100,
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  left: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1},
  text: {flex: 1},
  title: {fontSize: 13, fontWeight: '700', color: colors.terracotta600},
  body: {fontSize: 12, color: colors.ink700, marginTop: 1, lineHeight: 16},
});
