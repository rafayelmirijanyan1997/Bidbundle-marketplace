import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {colors, radius} from '../theme';

type ChipTone = 'terracotta' | 'sage' | 'gold' | 'neutral';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  dot?: boolean;
  style?: ViewStyle;
}

const toneBg: Record<ChipTone, string> = {
  terracotta: colors.terracotta50,
  sage: colors.sage50,
  gold: colors.gold50,
  neutral: colors.cream100,
};
const toneColor: Record<ChipTone, string> = {
  terracotta: colors.terracotta600,
  sage: colors.sage700,
  gold: colors.gold600,
  neutral: colors.ink700,
};

export function Chip({label, tone = 'neutral', dot, style}: ChipProps) {
  return (
    <View
      style={[
        styles.chip,
        {backgroundColor: toneBg[tone], borderColor: toneBg[tone] === colors.cream100 ? colors.border : toneBg[tone]},
        style,
      ]}>
      {dot && (
        <View style={[styles.dot, {backgroundColor: toneColor[tone]}]} />
      )}
      <Text style={[styles.label, {color: toneColor[tone]}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  label: {fontSize: 12, fontWeight: '600'},
});
