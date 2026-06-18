import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {CalendarDays, CircleCheckBig, CircleDashed, CircleX, ChevronRight} from 'lucide-react-native';
import {providerApi, ProviderBid} from '../../api/provider';
import {colors, radius, shadow} from '../../theme';
import {Chip} from '../../components/Chip';

function formatCurrency(amount: number) {
  return `$${Math.round(amount / 100).toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function toneForStatus(status: string): 'sage' | 'gold' | 'terracotta' | 'neutral' {
  if (status === 'accepted') {return 'sage';}
  if (status === 'pending') {return 'gold';}
  if (status === 'declined') {return 'terracotta';}
  return 'neutral';
}

function iconForStatus(status: string) {
  if (status === 'accepted') {return <CircleCheckBig size={16} color={colors.sage700} strokeWidth={2} />;}
  if (status === 'pending') {return <CircleDashed size={16} color={colors.gold600} strokeWidth={2} />;}
  return <CircleX size={16} color={colors.terracotta600} strokeWidth={2} />;
}

export default function ProviderBidsScreen() {
  const [bids, setBids] = useState<ProviderBid[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setBids(await providerApi.getBids());
    } catch (error: any) {
      console.warn('Provider bids error:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const accepted = bids.filter(bid => bid.status === 'accepted');
  const pending = bids.filter(bid => bid.status === 'pending');
  const declined = bids.filter(bid => bid.status === 'declined');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.terracotta600}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>My bids</Text>
          <Text style={styles.sub}>Track live offers, wins, and declined jobs in one place.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, {backgroundColor: colors.gold50, borderColor: colors.gold100}]}>
            <Text style={styles.summaryEyebrow}>LIVE</Text>
            <Text style={[styles.summaryValue, {color: colors.gold600}]}>{pending.length}</Text>
            <Text style={styles.summaryLabel}>awaiting response</Text>
          </View>
          <View style={[styles.summaryCard, {backgroundColor: colors.sage50, borderColor: colors.sage100}]}>
            <Text style={styles.summaryEyebrow}>WON</Text>
            <Text style={[styles.summaryValue, {color: colors.sage700}]}>{accepted.length}</Text>
            <Text style={styles.summaryLabel}>accepted by homeowners</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>TOTAL</Text>
            <Text style={styles.summaryValue}>{bids.length}</Text>
            <Text style={styles.summaryLabel}>bids submitted</Text>
          </View>
        </View>

        {bids.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No bids yet</Text>
            <Text style={styles.emptySub}>Open the job feed and send your first offer to start building your pipeline.</Text>
          </View>
        ) : (
          bids.map(bid => (
            <View key={bid.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardTitleWrap}>
                  <View style={styles.iconWrap}>
                    {iconForStatus(bid.status)}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{bid.request_title}</Text>
                    <Text style={styles.cardMeta}>{bid.request_neighborhood} · {bid.request_category}</Text>
                  </View>
                </View>
                <Chip label={bid.status} tone={toneForStatus(bid.status)} />
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Your price</Text>
                  <Text style={styles.metricValue}>{formatCurrency(bid.amount)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Timeline</Text>
                  <Text style={styles.metricValue}>{bid.estimated_days} day{bid.estimated_days === 1 ? '' : 's'}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Request</Text>
                  <Text style={styles.metricValue}>{bid.request_status}</Text>
                </View>
              </View>

              {bid.work_days.length > 0 && (
                <View style={styles.daysCard}>
                  <CalendarDays size={14} color={colors.ink400} strokeWidth={2} />
                  <Text style={styles.daysText}>
                    {bid.work_days.map(formatDate).join(' · ')}
                  </Text>
                </View>
              )}

              <TouchableOpacity activeOpacity={0.85} style={styles.footerBtn}>
                <Text style={styles.footerBtnText}>
                  {bid.status === 'accepted' ? 'Won job' : bid.status === 'pending' ? 'Bid sent' : 'Closed bid'}
                </Text>
                <ChevronRight size={14} color={colors.ink300} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  container: {paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120},
  header: {marginBottom: 18},
  title: {fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5},
  sub: {fontSize: 14, color: colors.ink400, marginTop: 4, lineHeight: 20},
  summaryRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  summaryCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.sm,
  },
  summaryEyebrow: {fontSize: 10, fontWeight: '700', color: colors.ink400, letterSpacing: 0.9},
  summaryValue: {fontSize: 28, fontWeight: '700', color: colors.ink900, marginTop: 8},
  summaryLabel: {fontSize: 12, color: colors.ink500, marginTop: 4},
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    ...shadow.sm,
  },
  emptyTitle: {fontSize: 20, fontWeight: '700', color: colors.ink900},
  emptySub: {fontSize: 14, color: colors.ink400, textAlign: 'center', marginTop: 8, lineHeight: 20},
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...shadow.md,
  },
  cardTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  cardTitleWrap: {flexDirection: 'row', gap: 12, flex: 1},
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.cream100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900, lineHeight: 22},
  cardMeta: {fontSize: 13, color: colors.ink400, marginTop: 4},
  metricsRow: {flexDirection: 'row', gap: 10, marginTop: 14},
  metric: {
    flex: 1,
    backgroundColor: colors.cream50,
    borderRadius: radius.md,
    padding: 12,
  },
  metricLabel: {fontSize: 11, color: colors.ink400, fontWeight: '600'},
  metricValue: {fontSize: 14, fontWeight: '700', color: colors.ink900, marginTop: 4},
  daysCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.sky50,
    borderWidth: 1,
    borderColor: colors.sky100,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  daysText: {fontSize: 13, color: colors.ink700, flex: 1},
  footerBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.cream100,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerBtnText: {fontSize: 13, fontWeight: '700', color: colors.ink700},
});
