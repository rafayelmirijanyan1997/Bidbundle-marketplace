import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';
import {colors, radius, shadow} from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pad?: boolean;
}

export function Card({children, style, pad = true}: CardProps) {
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
  pad: {padding: 20},
});
