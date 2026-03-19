import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { useMetricsStore } from '../store/metricsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Period = '1D' | '7D' | '30D' | '90D' | '1A';

function generateChartData(oficialSell: number, blueSell: number, period: Period) {
  const points = { '1D': 12, '7D': 7, '30D': 30, '90D': 18, '1A': 12 }[period];
  const oficial: { value: number }[] = [];
  const blue: { value: number }[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = 0.93 + 0.07 * t;
    oficial.push({ value: Math.round(oficialSell * trend * (1 + 0.004 * Math.sin(i * 1.7 + 0.3))) });
    blue.push({ value: Math.round(blueSell * trend * (1 + 0.007 * Math.sin(i * 1.2 + 1.1))) });
  }
  return { oficial, blue };
}

function MiniBarChart({ oficial, blue }: { oficial: { value: number }[]; blue: { value: number }[] }) {
  const allVals = [...oficial, ...blue].map(d => d.value);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const H = 140;
  return (
    <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end', gap: 3, paddingHorizontal: 2 }}>
      {oficial.map((o, i) => {
        const b = blue[i];
        const oH = Math.max(4, Math.round(((o.value - min) / range) * (H - 12)));
        const bH = Math.max(4, Math.round(((b.value - min) / range) * (H - 12)));
        return (
          <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 1 }}>
            <View style={{ flex: 1, height: oH, backgroundColor: 'rgba(161,161,170,0.45)', borderRadius: 2 }} />
            <View style={{ flex: 1, height: bH, backgroundColor: 'rgba(16,185,129,0.6)', borderRadius: 2 }} />
          </View>
        );
      })}
    </View>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 }}>
      <View style={{ width: 3, height: 14, borderRadius: 99, backgroundColor: color }} />
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#71717a', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

export default function ExchangeRatesScreen() {
  const { usdRates, isLoadingLive, fetchUSDRates } = useMetricsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30D');
  const insets = useSafeAreaInsets();
  const periods: Period[] = ['1D', '7D', '30D', '90D', '1A'];

  useEffect(() => { fetchUSDRates(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchUSDRates(); setRefreshing(false); };

  const rates = usdRates;
  const brecha    = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw = Number(rates?.brecha?.value ?? 0);

  const chartData = useMemo(() => {
    if (!rates) return { oficial: [], blue: [] };
    return generateChartData(rates?.official?.sell ?? 1441, rates?.blue?.sell ?? 1425, selectedPeriod);
  }, [rates, selectedPeriod]);

  const RATE_CARDS = [
    { title: 'Oficial', buy: rates?.official?.buy ?? 0, sell: rates?.official?.sell ?? 0, color: '#a1a1aa', change: '+0.5%', pos: true },
    { title: 'Blue',    buy: rates?.blue?.buy    ?? 0, sell: rates?.blue?.sell    ?? 0, color: '#10b981', change: '+1.2%', pos: true },
    { title: 'MEP',     buy: rates?.mep?.buy     ?? 0, sell: rates?.mep?.sell     ?? 0, color: '#818cf8', change: '+0.3%', pos: true },
    { title: 'CCL',     buy: rates?.ccl?.buy     ?? 0, sell: rates?.ccl?.sell     ?? 0, color: '#f59e0b', change: '+0.8%', pos: true },
  ];

  return (
    <ScrollView
      style={ex.container}
      contentContainerStyle={[ex.content, { paddingBottom: 16 + insets.bottom }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      showsVerticalScrollIndicator={false}
    >
      {isLoadingLive && !rates ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 60 }} />
      ) : (
        <>
          {/* Period tabs */}
          <View style={ex.periodContainer}>
            {periods.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPeriod(p)}
                style={[ex.periodTab, selectedPeriod === p && ex.periodTabActive]}
              >
                <Text style={[ex.periodLabel, selectedPeriod === p && ex.periodLabelActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <View style={ex.chartCard}>
            <View style={ex.chartHeader}>
              <Text style={ex.chartTitle}>Evolución · {selectedPeriod}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {[{ l: 'Oficial', c: '#a1a1aa' }, { l: 'Blue', c: '#10b981' }].map(s => (
                  <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.c }} />
                    <Text style={{ fontSize: 10, color: '#71717a' }}>{s.l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {chartData.oficial.length > 0 && (
              <MiniBarChart oficial={chartData.oficial} blue={chartData.blue} />
            )}

            {/* Current prices */}
            <View style={ex.priceSummary}>
              {[
                { label: 'Oficial', value: rates?.official?.sell ?? 0, color: '#a1a1aa' },
                { label: 'Blue',    value: rates?.blue?.sell    ?? 0, color: '#10b981' },
                { label: 'MEP',     value: rates?.mep?.sell     ?? 0, color: '#818cf8' },
              ].map((item, i) => (
                <View key={item.label} style={[ex.priceSummaryItem, i === 1 && { alignItems: 'center' }, i === 2 && { alignItems: 'flex-end' }]}>
                  <Text style={[ex.priceSummaryLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={ex.priceSummaryValue}>${item.value.toLocaleString('es-AR')}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Brecha */}
          <View style={ex.brechaCard}>
            <View style={ex.brechaRow}>
              <View>
                <Text style={ex.brechaTitle}>Brecha cambiaria</Text>
                <Text style={ex.brechaSub}>Blue vs Oficial</Text>
              </View>
              <Text style={[ex.brechaValue, { color: brechaRaw >= 0 ? '#ef4444' : '#10b981' }]}>
                {brecha.toFixed(1)}%
              </Text>
            </View>
            <View style={ex.gaugeTrack}>
              <View style={[ex.gaugeFill, {
                width: `${Math.min(brecha, 100)}%` as `${number}%`,
                backgroundColor: brecha > 40 ? '#ef4444' : '#f59e0b',
              }]} />
            </View>
          </View>

          {/* Rate cards 2x2 */}
          <SectionHeader label="Dólares" color="#10b981" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            {RATE_CARDS.map(rate => (
              <View key={rate.title} style={ex.rateCard}>
                {/* Top accent */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: rate.color + '60', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <View style={ex.rateCardHeader}>
                  <Text style={[ex.rateCardTitle, { color: '#f4f4f5' }]}>{rate.title}</Text>
                  <View style={[ex.changeBadge, { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.25)' }]}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#10b981' }}>{rate.change}</Text>
                  </View>
                </View>
                <View style={ex.buySellRow}>
                  <View style={ex.buySellBox}>
                    <Text style={ex.buySellLabel}>Compra</Text>
                    <Text style={ex.buySellValue}>${rate.buy.toLocaleString('es-AR')}</Text>
                  </View>
                  <View style={ex.buySellBox}>
                    <Text style={ex.buySellLabel}>Venta</Text>
                    <Text style={[ex.buySellValue, { color: rate.color }]}>${rate.sell.toLocaleString('es-AR')}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const ex = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c26' },
  content:   { padding: 14 },

  periodContainer: { flexDirection: 'row', gap: 4, backgroundColor: '#262630', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 14 },
  periodTab:       { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodTabActive: { backgroundColor: '#4f46e5', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  periodLabel:     { fontSize: 12, fontWeight: '700', color: '#71717a' },
  periodLabelActive: { color: 'white' },

  chartCard: { backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 16, marginBottom: 14, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: '#f4f4f5' },

  priceSummary: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  priceSummaryItem: { flex: 1 },
  priceSummaryLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  priceSummaryValue: { fontSize: 13, fontWeight: '700', color: '#f4f4f5' },

  brechaCard: { backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 16, marginBottom: 14 },
  brechaRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  brechaTitle:{ fontSize: 13, fontWeight: '700', color: '#f4f4f5' },
  brechaSub:  { fontSize: 10, color: '#71717a', marginTop: 2 },
  brechaValue:{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  gaugeTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  gaugeFill:  { height: 5, borderRadius: 99 },

  rateCard: { width: '47%', backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden' },
  rateCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  rateCardTitle: { fontSize: 13, fontWeight: '700' },
  changeBadge: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  buySellRow: { flexDirection: 'row', gap: 6 },
  buySellBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 9, padding: 8 },
  buySellLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: '#71717a', marginBottom: 3 },
  buySellValue: { fontSize: 14, fontWeight: '700', color: '#f4f4f5' },
});
