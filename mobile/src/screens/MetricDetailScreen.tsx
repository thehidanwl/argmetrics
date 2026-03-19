import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMetricsStore } from '../store/metricsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MetricDataPoint } from '../types';
import { RootStackParamList } from '../navigation/TabNavigator';

type Period = '1M' | '3M' | '6M' | '1A' | 'MAX';

const METRIC_COLORS: Record<string, string> = {
  inflation:    '#f59e0b',
  usd_official: '#a1a1aa',
  usd_blue:     '#10b981',
  interest_rate:'#818cf8',
  reserves:     '#3b82f6',
  gdp:          '#6366f1',
  country_risk: '#ef4444',
  poverty:      '#ef4444',
  unemployment: '#f59e0b',
};

const METRIC_UNITS: Record<string, string> = {
  inflation:    '%',
  usd_official: 'ARS',
  usd_blue:     'ARS',
  interest_rate:'%',
  reserves:     'USD M',
  gdp:          'ARS B',
  country_risk: 'pts',
  poverty:      '%',
  unemployment: '%',
};

function filterByPeriod(series: MetricDataPoint[], period: Period): MetricDataPoint[] {
  if (period === 'MAX' || series.length === 0) return series;
  const months = { '1M': 1, '3M': 3, '6M': 6, '1A': 12 }[period];
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  const filtered = series.filter(p => new Date(p.date) >= cutoff);
  return filtered.length > 0 ? filtered : series;
}

function AreaChart({ data, color }: { data: MetricDataPoint[]; color: string }) {
  const H = 140;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingHorizontal: 2 }}>
      {data.map((point, i) => {
        const heightPct = (point.value - min) / range;
        const barH = Math.max(4, Math.round(heightPct * (H - 16)));
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: barH,
              backgroundColor: color,
              opacity: 0.3 + 0.7 * heightPct,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }}
          />
        );
      })}
    </View>
  );
}

export default function MetricDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'MetricDetail'>>();
  const { metricName, metricLabel, metricColor } = route.params;
  const { selectedMetric, isLoadingMetrics, fetchMetricByName } = useMetricsStore();
  const [period, setPeriod] = useState<Period>('6M');
  const insets = useSafeAreaInsets();

  useEffect(() => { fetchMetricByName(metricName); }, [metricName]);

  const color = metricColor ?? METRIC_COLORS[metricName] ?? '#6366f1';
  const unit  = METRIC_UNITS[metricName] ?? '';

  const filteredSeries = selectedMetric ? filterByPeriod(selectedMetric.series ?? [], period) : [];
  const latestValue  = selectedMetric?.latest?.value ?? 0;
  const variation    = selectedMetric?.latest?.variation ?? 0;
  const variationPos = variation >= 0;

  const vals    = filteredSeries.map(d => d.value);
  const statMin = vals.length ? Math.min(...vals) : 0;
  const statMax = vals.length ? Math.max(...vals) : 0;
  const statAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

  const n = filteredSeries.length;
  const dateLabels = n >= 2 ? [
    filteredSeries[0].date.slice(0, 7),
    filteredSeries[Math.floor(n / 2)].date.slice(0, 7),
    filteredSeries[n - 1].date.slice(0, 7),
  ] : [];

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.content, { paddingBottom: 24 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {isLoadingMetrics ? (
        <ActivityIndicator size="large" color={color} style={{ marginTop: 80 }} />
      ) : selectedMetric ? (
        <>
          {/* Hero */}
          <View style={[s.hero, { borderLeftColor: color }]}>
            <Text style={s.heroLabel}>
              {(metricLabel ?? metricName).toUpperCase()}
            </Text>
            <View style={s.heroValueRow}>
              <Text style={[s.heroValue, { color }]}>
                {latestValue.toLocaleString('es-AR')} {unit}
              </Text>
              <View style={[s.varBadge, {
                backgroundColor: variationPos ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              }]}>
                <Text style={[s.varText, { color: variationPos ? '#ef4444' : '#10b981' }]}>
                  {variationPos ? '▲' : '▼'} {Math.abs(variation).toFixed(1)}%
                </Text>
              </View>
            </View>
            {selectedMetric.description ? (
              <Text style={s.heroSub}>{selectedMetric.description}</Text>
            ) : null}
          </View>

          {/* Chart */}
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>Evolución histórica</Text>
              <Text style={s.chartCount}>{filteredSeries.length} registros</Text>
            </View>

            <View style={s.periodRow}>
              {(['1M', '3M', '6M', '1A', 'MAX'] as Period[]).map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[s.periodBtn, period === p && { backgroundColor: color + '22', borderColor: color + '55' }]}
                >
                  <Text style={[s.periodLabel, period === p && { color }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredSeries.length > 0 ? (
              <>
                <AreaChart data={filteredSeries} color={color} />
                {dateLabels.length > 0 && (
                  <View style={s.dateRow}>
                    {dateLabels.map((l, i) => (
                      <Text key={i} style={s.dateLabel}>{l}</Text>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={s.empty}>
                <Text style={s.emptyText}>Sin datos para este período</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: 'Mínimo',   value: statMin.toLocaleString('es-AR'), color: '#10b981' },
              { label: 'Promedio', value: statAvg.toFixed(1),              color: '#818cf8' },
              { label: 'Máximo',   value: statMax.toLocaleString('es-AR'), color: '#ef4444' },
            ].map(stat => (
              <View key={stat.label} style={s.statCard}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Meta */}
          <View style={s.metaCard}>
            {[
              { key: 'Unidad',    val: selectedMetric.unit ?? unit ?? '—' },
              { key: 'Categoría', val: selectedMetric.category },
              { key: 'Descripción', val: selectedMetric.description || '—' },
            ].map((row, i, arr) => (
              <View key={row.key} style={[s.metaRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.metaKey}>{row.key}</Text>
                <Text style={s.metaVal}>{row.val}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={s.empty}>
          <Text style={s.emptyText}>No se encontraron datos para esta métrica</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c26' },
  content:   { padding: 14 },

  hero: {
    backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderLeftWidth: 3, borderRadius: 16, padding: 16, marginBottom: 14,
  },
  heroLabel:    { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#71717a', marginBottom: 8 },
  heroValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  heroValue:    { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  varBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  varText:      { fontSize: 12, fontWeight: '700' },
  heroSub:      { fontSize: 11, color: '#71717a' },

  chartCard: {
    backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16, padding: 16, marginBottom: 14,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle:  { fontSize: 13, fontWeight: '700', color: '#f4f4f5' },
  chartCount:  { fontSize: 10, color: '#71717a' },
  periodRow:   { flexDirection: 'row', gap: 6, marginBottom: 14 },
  periodBtn:   { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  periodLabel: { fontSize: 11, fontWeight: '700', color: '#52525a' },
  dateRow:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  dateLabel:   { fontSize: 9, color: '#52525a' },

  empty:     { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#52525a', fontSize: 12 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: '#23232f', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 14, alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a' },

  metaCard: {
    backgroundColor: '#23232f', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)', borderRadius: 14, overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metaKey: { fontSize: 12, color: '#71717a' },
  metaVal: { fontSize: 12, fontWeight: '600', color: '#f4f4f5' },
});
