import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Droplets, Zap, Wind, Leaf, Sparkles,
  Paintbrush, Home, Shield, Wrench, Bug, Hammer, Scissors,
} from 'lucide-react-native';
import {colors} from '../theme';

type IconComponent = React.ComponentType<{size: number; color: string; strokeWidth: number}>;

interface CategoryConfig {
  icon: IconComponent;
  color: string;
  bg: string;
}

const CONFIG: Record<string, CategoryConfig> = {
  Plumbing:       {icon: Droplets,   color: '#2563EB', bg: '#DBEAFE'},
  Electrical:     {icon: Zap,        color: '#D97706', bg: '#FEF3C7'},
  HVAC:           {icon: Wind,       color: '#0891B2', bg: '#CFFAFE'},
  Landscaping:    {icon: Leaf,       color: colors.sage700,      bg: colors.sage50},
  Lawn:           {icon: Scissors,   color: colors.sage600,      bg: colors.sage50},
  Cleaning:       {icon: Sparkles,   color: '#7C3AED', bg: '#EDE9FE'},
  Painting:       {icon: Paintbrush, color: '#BE185D', bg: '#FCE7F3'},
  Roofing:        {icon: Home,       color: colors.terracotta600, bg: colors.terracotta50},
  Gutter:         {icon: Home,       color: colors.gold600,      bg: colors.gold50},
  'Pest Control': {icon: Bug,        color: '#92400E', bg: '#FEF3C7'},
  Security:       {icon: Shield,     color: '#1D4ED8', bg: '#DBEAFE'},
  Handyman:       {icon: Hammer,     color: colors.ink500, bg: colors.cream200},
};

const DEFAULT: CategoryConfig = {icon: Wrench, color: colors.ink500, bg: colors.cream200};

function resolve(category: string): CategoryConfig {
  if (CONFIG[category]) {return CONFIG[category];}
  const c = category.toLowerCase();
  if (c.includes('plumb')) {return CONFIG.Plumbing;}
  if (c.includes('elect')) {return CONFIG.Electrical;}
  if (c.includes('hvac') || c.includes('heat') || c.includes('cool')) {return CONFIG.HVAC;}
  if (c.includes('lawn') || c.includes('garden') || c.includes('landscape')) {return CONFIG.Landscaping;}
  if (c.includes('clean')) {return CONFIG.Cleaning;}
  if (c.includes('paint')) {return CONFIG.Painting;}
  if (c.includes('roof')) {return CONFIG.Roofing;}
  if (c.includes('gutter')) {return CONFIG.Gutter;}
  if (c.includes('pest') || c.includes('bug') || c.includes('rodent')) {return CONFIG['Pest Control'];}
  if (c.includes('security') || c.includes('alarm')) {return CONFIG.Security;}
  if (c.includes('handyman') || c.includes('repair') || c.includes('fix')) {return CONFIG.Handyman;}
  return DEFAULT;
}

interface Props {
  category: string;
  size?: number;
}

export function ServiceCategoryBadge({category, size = 40}: Props) {
  const cfg = resolve(category);
  const Icon = cfg.icon;
  const iconSize = Math.round(size * 0.46);
  const br = Math.round(size * 0.30);

  return (
    <View style={[s.wrap, {width: size, height: size, borderRadius: br, backgroundColor: cfg.bg}]}>
      <Icon size={iconSize} color={cfg.color} strokeWidth={2} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
});
