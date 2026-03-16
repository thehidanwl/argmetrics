import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useMetricsStore } from '../store/metricsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function genSparkline(base: number, points = 7): { value: number }[] {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.round(base * (0.96 + 0.04 * (i / (points - 1))) * (1 + 0.005 * Math.sin(i * 1.7 + (base % 3)))),
  }));
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={[s.sectionAccent, { backgroundColor: color }]} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

function Sparkline({ base, color }: { base: number; color: string }) {
  const data = genSparkline(base);
  return (
    <LineChart
      data={data}
      width={60}
      height={28}
      thickness={2}
      color={color}
      hideDataPoints
      hideRules
      hideAxesAndRules
      areaChart
      startFillColor={color + '30'}
      endFillColor={color + '00'}
      initialSpacing={0}
      endSpacing={0}
      curved
      yAxisOffset={Math.min(...data.map(d => d.value)) - 5}
    />
  );
}

export default function DashboardScreen() {
  const { usdRates, countryRisk, metrics, isLoadingLive, fetchUSDRates, fetchCountryRisk, fetchMetrics } = useMetricsStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchUSDRates();
    fetchCountryRisk();
    fetchMetrics({ limit: 20 });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUSDRates(), fetchCountryRisk(), fetchMetrics({ limit: 20 })]);
    setRefreshing(false);
  };

  const rates = usdRates;
  const brecha = Math.abs(Number(rates?.brecha?.value ?? 0));
  const brechaRaw = Number(rates?.brecha?.value ?? 0);

  const blueSell    = rates?.blue.sell    ?? 1425;
  const blueBuy     = rates?.blue.buy     ?? 1415;
  const oficialSell = rates?.official.sell ?? 1441;
  const mepSell     = rates?.mep.sell     ?? 1395;
  const cclSell     = rates?.ccl.sell     ?? 1412;
  const riesgo      = countryRisk?.value  ?? 1785;
  const inflationMetric = metrics.find(m => m.name.includes('inflation'));
  const inflation   = inflationMetric?.value ?? 4.2;

  const RATES = [
    { label: 'Oficial', value: oficialSell, color: '#a1a1aa' },
    { label: 'Blue',    value: blueSell,    color: '#10b981', badge: 'LIBRE' },
    { label: 'MEP',     value: mepSell,     color: '#818cf8' },
    { label: 'CCL',     value: cclSell,     color: '#f59e0b' },
  ];

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.content, { paddingBottom: 16 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
      showsVerticalScrollIndicator={false}
    >
      {isLoadingLive && !rates ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 60 }} />
      ) : (
        <>
          {/* ── HERO: USD Blue ── */}
          <View style={s.hero}>
            <View style={s.heroTopRow}>
              <View style={s.heroLabelContainer}>
                <View style={s.heroIcon}>
                  <Text style={s.heroIconText}>$</Text>
                </View>
                <Text style={s.heroLabel}>DÓLAR BLUE</Text>
              </View>
              <View style={s.liveBadge}>
                <View style={s.liveDot} />
                <Text style={s.liveBadgeText}>EN VIVO</Text>
              </View>
            </View>

            <View style={s.heroPriceRow}>
              <Text style={s.heroPrice}>
                ${blueSell.toLocaleString('es-AR')}
              </Text>
              <Sparkline base={blueSell} color="#10b981" />
            </View>

            <View style={s.heroDivider} />

            <View style={s.heroSubRow}>
              {[
                { label: 'Compra',  value: `$${blueBuy.toLocaleString('es-AR')}`, color: '#f4f4f5' },
                { label: 'Brecha',  value: `${brecha.toFixed(1)}%`,               color: brechaRaw >= 0 ? '#ef4444' : '#10b981' },
                { label: 'Oficial', value: `$${oficialSell.toLocaleString('es-AR')}`, color: '#a1a1aa' },
              ].map((item, i) => (
                <View key={item.label} style={[s.heroSubItem, i === 1 && s.heroSubItemCenter]}>
                  <Text style={s.heroSubLabel}>{item.label}</Text>
                  <Text style={[s.heroSubValue, { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── MACRO KPIs ── */}
          <SectionHeader label="Indicadores macro" color="#6366f1" />
          <View style={s.grid2}>
            {/* Riesgo País */}
            <View style={[s.kpiCard, { borderLeftWidth: 3, borderLeftColor: '#ef4444' }]}>
              <Text style={s.kpiLabel}>RIESGO PAÍS</Text>
              <Text style={[s.kpiValue, { color: '#ef4444' }]}>
                {riesgo.toLocaleString('es-AR')}
              </Text>
              <Text style={s.kpiSub}>pts · JPMorgan</Text>
            </View>
            {/* Inflación */}
            <View style={[s.kpiCard, { borderLeftWidth: 3, borderLeftColor: '#f59e0b' }]}>
              <Text style={s.kpiLabel}>INFLACIÓN IPC</Text>
              <Text style={[s.kpiValue, { color: '#f59e0b' }]}>
                {inflation.toFixed(1)}%
              </Text>
              <Text style={s.kpiSub}>mensual · INDEC</Text>
            </View>
          </View>

          {/* ── COTIZACIONES ── */}
          <SectionHeader label="Cotizaciones USD" color="#10b981" />
          <View style={s.grid2}>
            {RATES.map(rate => (
              <View key={rate.label} style={s.rateCard}>
                <View style={s.rateCardTop}>
                  <Text style={[s.rateCardLabel, { color: rate.color }]}>{rate.label}</Text>
                  {rate.badge && (
                    <View style={[s.rateBadge, { backgroundColor: rate.color + '18' }]}>
                      <Text style={[s.rateBadgeText, { color: rate.color }]}>{rate.badge}</Text>
                    </View>
                  )}
                </View>
                <View style={s.rateCardBottom}>
                  <View>
                    <Text style={[s.rateCardPrice, { color: rate.color }]}>
                      ${rate.value.toLocaleString('es-AR')}
                    </Text>
                    <Text style={s.rateCardSub}>Venta</Text>
                  </View>
                  <Sparkline base={rate.value} color={rate.color} />
                </View>
              </View>
            ))}
          </View>

          {/* ── BRECHA ── */}
          <View style={s.brechaCard}>
            <View style={s.brechaRow}>
              <View style={s.brechaLeft}>
                <View style={s.brechaIconBox}>
                  <Text style={s.brechaIconText}>⚡</Text>
                </View>
                <View>
                  <Text style={s.brechaTitle}>Brecha cambiaria</Text>
                  <Text style={s.brechaSub}>Blue vs Oficial</Text>
                </View>
              </View>
              <Text style={[s.brechaValue, { color: brechaRaw >= 0 ? '#ef4444' : '#10b981' }]}>
                {brecha.toFixed(1)}%
              </Text>
            </View>
            <View style={s.gaugeTrack}>
              <View style={[
                s.gaugeFill,
                {
                  width: `${Math.min(brecha, 100)}%` as `${number}%`,
                  backgroundColor: brecha > 40 ? '#ef4444' : '#f59e0b',
                }
              ]} />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1c1c26' },
  content:     { padding: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 },
  sectionAccent: { width: 3, height: 14, borderRadius: 99 },
  sectionLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#71717a', textTransform: 'uppercase' },

  // Hero
  hero: {
    backgroundColor: '#23232f',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.22)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heroLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroIcon:       { width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  heroIconText:   { color: '#10b981', fontWeight: '800', fontSize: 13 },
  heroLabel:      { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, color: '#10b981', textTransform: 'uppercase' },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  liveDot:        { width: 6, height: 6, borderRadius: 99, backgroundColor: '#10b981' },
  liveBadgeText:  { fontSize: 9, fontWeight: '700', color: '#71717a', letterSpacing: 0.5 },
  heroPriceRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  heroPrice:      { fontSize: 48, fontWeight: '800', color: '#ffffff', letterSpacing: -1, lineHeight: 52 },
  heroDivider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 12 },
  heroSubRow:     { flexDirection: 'row' },
  heroSubItem:    { flex: 1 },
  heroSubItemCenter: { alignItems: 'center' },
  heroSubLabel:   { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginBottom: 3 },
  heroSubValue:   { fontSize: 13, fontWeight: '700', color: '#f4f4f5' },

  // KPI grid
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  kpiCard: {
    flex: 1,
    backgroundColor: '#23232f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 14,
    minWidth: '45%',
  },
  kpiLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: '#71717a', textTransform: 'uppercase', marginBottom: 6 },
  kpiValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  kpiSub:   { fontSize: 10, color: '#71717a' },

  // Rate cards
  rateCard: {
    flex: 1,
    backgroundColor: '#23232f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 14,
    minWidth: '45%',
  },
  rateCardTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rateCardLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  rateBadge:     { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  rateBadgeText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  rateCardBottom:{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  rateCardPrice: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5, lineHeight: 22 },
  rateCardSub:   { fontSize: 9, color: '#71717a', marginTop: 3 },

  // Brecha
  brechaCard: {
    backgroundColor: '#23232f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  brechaRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  brechaLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brechaIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', alignItems: 'center', justifyContent: 'center' },
  brechaIconText:{ fontSize: 16 },
  brechaTitle:   { fontSize: 13, fontWeight: '700', color: '#f4f4f5' },
  brechaSub:     { fontSize: 10, color: '#71717a', marginTop: 2 },
  brechaValue:   { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  gaugeTrack:    { height: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  gaugeFill:     { height: 6, borderRadius: 99 },
});
