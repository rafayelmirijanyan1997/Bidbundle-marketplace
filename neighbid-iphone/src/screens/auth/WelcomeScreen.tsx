import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Clock, Users, Tag, Award, Hammer, Droplets, Home} from 'lucide-react-native';
import {Button} from '../../components/Button';
import {colors, radius, shadow} from '../../theme';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

const brandMark = require('../../assets/bidbundle-mark.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const stats = [
  {big: '2,400+', label: 'Homes', tone: 'terracotta'},
  {big: '$310', label: 'Saved', tone: 'sage'},
  {big: '47', label: 'Pros', tone: 'gold'},
] as const;

export default function WelcomeScreen({navigation}: Props) {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const orbitLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbit, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbit, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    driftLoop.start();
    pulseLoop.start();
    shimmerLoop.start();
    orbitLoop.start();
    return () => {
      driftLoop.stop();
      pulseLoop.stop();
      shimmerLoop.stop();
      orbitLoop.stop();
    };
  }, [drift, intro, orbit, pulse, shimmer]);

  const leftChipMotion = {
    transform: [
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 3],
        }),
      },
    ],
  };

  const rightChipMotion = {
    transform: [
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
      },
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        rotate: drift.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-2deg'],
        }),
      },
    ],
  };

  const badgePulse = {
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
    ],
  };

  const heroBob = {
    transform: [
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
  };

  const ctaPulse = {
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.025],
        }),
      },
    ],
  };

  const statsPulse = {
    transform: [
      {
        translateY: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  const introUp = {
    opacity: intro,
    transform: [
      {
        translateY: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  };

  const introSoft = {
    opacity: intro.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const shimmerMotion = {
    transform: [
      {
        translateX: shimmer.interpolate({
          inputRange: [0, 1],
          outputRange: [-220, 260],
        }),
      },
      {rotate: '-16deg'},
    ],
    opacity: shimmer.interpolate({
      inputRange: [0, 0.15, 0.5, 0.85, 1],
      outputRange: [0, 0.18, 0.28, 0.12, 0],
    }),
  };

  const orbOneMotion = {
    transform: [
      {
        translateY: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        translateX: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        scale: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
    ],
  };

  const orbTwoMotion = {
    transform: [
      {
        translateY: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
      },
      {
        translateX: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      },
      {
        scale: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.94],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.bgOrbOne, orbOneMotion]}>
          <Hammer size={150} color={colors.terracotta600} strokeWidth={1} />
        </Animated.View>
        <Animated.View style={[styles.bgOrbTwo, orbTwoMotion]}>
          <Droplets size={120} color={colors.sage700} strokeWidth={1} />
        </Animated.View>

        <Animated.View style={[styles.brandRow, introSoft]}>
          <View style={styles.brandMark}>
            <Image source={brandMark} style={styles.brandImage} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>BidBundle</Text>
            <Text style={styles.brandSub}>Neighbourhood group savings</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.heroVisual, introUp]}>
          <Animated.View style={[styles.showcaseCard, heroBob]}>
            <View style={styles.showcaseGlow} />
            <Animated.View style={[styles.showcaseShimmer, shimmerMotion]} />
            <View style={styles.showcaseTop}>
              <View>
                <Text style={styles.showcaseEyebrow}>WEST ADAMS</Text>
                <Text style={styles.showcaseTitle}>Bundle cleaning</Text>
              </View>
              <Animated.View style={[styles.saveBadge, badgePulse]}>
                <Text style={styles.saveBadgeText}>Save $84</Text>
              </Animated.View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineIconNode}>
                <Home size={9} color={colors.terracotta600} strokeWidth={2.5} />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineIconNodeSoft}>
                <Users size={9} color={colors.sage700} strokeWidth={2.5} />
              </View>
              <View style={styles.timelineLineSoft} />
              <View style={styles.timelineIconNodeWarm}>
                <Award size={9} color={colors.gold600} strokeWidth={2.5} />
              </View>
            </View>

            <View style={styles.miniGrid}>
              <View style={styles.miniCard}>
                <Clock size={13} color={colors.ink500} strokeWidth={2} />
                <Text style={styles.miniValue}>72h</Text>
                <Text style={styles.miniLabel}>window</Text>
              </View>
              <View style={styles.miniCard}>
                <Users size={13} color={colors.ink500} strokeWidth={2} />
                <Text style={styles.miniValue}>4</Text>
                <Text style={styles.miniLabel}>joined</Text>
              </View>
              <View style={styles.miniCardAccent}>
                <Tag size={13} color={colors.terracotta600} strokeWidth={2} />
                <Text style={styles.miniValueAccent}>Best bid</Text>
                <Text style={styles.miniPrice}>$250-$410</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.heroCopy, introSoft]}>
          <Text style={styles.kicker}>Neighbourhood group bids</Text>
          <Text style={styles.headline}>{'Bid together.\nSave more.'}</Text>
          <Text style={styles.sub}>Join neighbours. Unlock lower quotes.</Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, introSoft, statsPulse]}>
          {stats.map(s => (
            <View key={s.label} style={[
              styles.statCard,
              s.tone === 'terracotta' ? styles.statCardTerracotta
                : s.tone === 'sage' ? styles.statCardSage
                : styles.statCardGold,
            ]}>
              <Text
                style={[
                  styles.statBig,
                  s.tone === 'sage'
                    ? styles.statBigSage
                    : s.tone === 'gold'
                      ? styles.statBigGold
                      : styles.statBigTerracotta,
                ]}>
                {s.big}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.actions, introUp]}>
          <Animated.View style={ctaPulse}>
            <Button
              label="Get started free"
              onPress={() => navigation.navigate('Register')}
              style={styles.primaryBtn}
            />
          </Animated.View>
          <Button
            label="Sign in"
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.signInBtn}
          />
          <Button
            label="Join via invite code"
            variant="quiet"
            onPress={() => navigation.navigate('InviteSignUp')}
            style={styles.inviteBtn}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  bgOrbOne: {
    position: 'absolute',
    top: 100,
    right: -55,
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.09,
  },
  bgOrbTwo: {
    position: 'absolute',
    top: 250,
    left: -65,
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.08,
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  brandImage: {width: 42, height: 42},
  brandName: {fontSize: 24, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5},
  brandSub: {fontSize: 13, color: colors.ink500, marginTop: 2},
  heroVisual: {marginTop: 20, marginBottom: 14},
  showcaseCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.lg,
    overflow: 'hidden',
  },
  showcaseGlow: {
    position: 'absolute',
    top: -12,
    right: -22,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.terracotta50,
  },
  showcaseShimmer: {
    position: 'absolute',
    top: -18,
    bottom: -18,
    width: 120,
    backgroundColor: colors.terracotta100,
  },
  showcaseTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  showcaseEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.terracotta600,
    letterSpacing: 1.2,
  },
  showcaseTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: colors.ink900,
    marginTop: 4,
    maxWidth: 180,
  },
  saveBadge: {
    backgroundColor: colors.sage50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.sage100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveBadgeText: {fontSize: 13, fontWeight: '700', color: colors.sage700},
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 14,
  },
  timelineIconNode: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.terracotta50,
    borderWidth: 1.5, borderColor: colors.terracotta600,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineIconNodeSoft: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.sage50,
    borderWidth: 1.5, borderColor: colors.sage600,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineIconNodeWarm: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.gold50,
    borderWidth: 1.5, borderColor: colors.gold600,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: {flex: 1, height: 2, borderRadius: 99, backgroundColor: colors.terracotta100, marginHorizontal: 5},
  timelineLineSoft: {flex: 1, height: 2, borderRadius: 99, backgroundColor: colors.sage100, marginHorizontal: 5},
  miniGrid: {flexDirection: 'row', gap: 8},
  miniCard: {
    flex: 1,
    backgroundColor: colors.cream200,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniCardAccent: {
    flex: 1.15,
    backgroundColor: colors.terracotta50,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.terracotta100,
  },
  miniValue: {fontSize: 16, fontWeight: '800', color: colors.ink900},
  miniValueAccent: {fontSize: 12, fontWeight: '700', color: colors.terracotta600, letterSpacing: 0.4},
  miniLabel: {fontSize: 11, fontWeight: '600', color: colors.ink500, marginTop: 2},
  miniPrice: {fontSize: 18, fontWeight: '800', color: colors.ink900, marginTop: 4},
  heroCopy: {marginBottom: 16},
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.terracotta600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headline: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.ink900,
    letterSpacing: -1.4,
    lineHeight: 42,
  },
  sub: {
    fontSize: 17,
    color: colors.ink500,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 320,
  },
  statsRow: {flexDirection: 'row', gap: 8, marginBottom: 18},
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    ...shadow.sm,
  },
  statCardTerracotta: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  statCardSage:       {backgroundColor: colors.sage50,       borderColor: colors.sage100},
  statCardGold:       {backgroundColor: colors.gold50,       borderColor: colors.gold100},
  statBig: {fontSize: 20, fontWeight: '800', letterSpacing: -0.4},
  statBigTerracotta: {color: colors.terracotta600},
  statBigSage: {color: colors.sage700},
  statBigGold: {color: colors.gold600},
  statLabel: {fontSize: 11, fontWeight: '600', color: colors.ink500, marginTop: 3},
  actions: {marginTop: 'auto'},
  primaryBtn: {
    height: 56,
    borderRadius: 24,
    ...shadow.md,
  },
  signInBtn: {
    marginTop: 12,
    height: 54,
    borderRadius: 24,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.ink300,
  },
  inviteBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 24,
  },
});
