import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavStore } from '../store/navStore';
import { getIndicator } from '../data/indicators';
import { getMandatoForDate, MANDATOS } from '../data/mandatos';
import { metricsApi } from '../api/metrics';
import { RootStackParamList } from '../navigation/TabNavigator';
import { DataPoint, TemporalityMode } from '../types';
import { calcInteranual, calcAcumulado } from '../utils/calculations';
import { formatDateShort, formatDateLong, formatValue, formatVariation } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Indicator'>;
type Route = RouteProp<RootStackParamList, 'Indicator'>;

const TEMPORALITY_LABELS: Record<TemporalityMode, string> = {
  monthly: 'M',
  interanual: 'IA',
  acumulado: 'Acum',
  mandato: 'Mandato',
};

const SERIES_COLORS = ['#818cf8', '#fb923c', '#34d399', '#fbbf24', '#f472b6', '#38bdf8'];

const DATE_RANGES = [
  { label: '6M', months: 6 },
  { label: '1A', months: 12 },
  { label: '3A', months: 36 },
  { label: 'Max', months: 0 },
];

function getFromDate(months: number): string | undefined {
  if (months === 0) return undefined;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split('T')[0];
}

function normalizeDate(dateStr: string): string {
  return dateStr?.split('T')[0] ?? '';
}

// ─── Chart ────────────────────────────────────────────────────────────────────

interface ChartSeries {
  label: string;
  color: string;
  data: DataPoint[];
}

function ViewChart({
  series,
  height = 200,
  type,
  unit,
}: {
  series: ChartSeries[];
  height?: number;
  type: 'bars' | 'line';
  unit: string;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  if (allValues.length === 0) return null;

  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;
  const midVal = (minVal + maxVal) / 2;

  const longest = series.reduce((a, b) => (a.data.length > b.data.length ? a : b));
  const labels = longest.data.slice(-48);
  const total = labels.length;

  // Mandate bands
  const bands: { s: number; e: number; color: string }[] = [];
  let lastId: string | null = null, bandStart = 0;
  labels.forEach((pt, i) => {
    const m = getMandatoForDate(pt.date);
    const id = m?.id ?? 'none';
    if (id !== lastId) {
      if (lastId !== null) {
        const prev = MANDATOS.find((x) => x.id === lastId);
        bands.push({ s: bandStart, e: i - 1, color: prev?.color ?? '#333' });
      }
      bandStart = i; lastId = id;
    }
    if (i === labels.length - 1) {
      const curr = MANDATOS.find((x) => x.id === id);
      bands.push({ s: bandStart, e: i, color: curr?.color ?? '#333' });
    }
  });

  const YPAD_T = 20, YPAD_B = 24, XPAD_L = 46, XPAD_R = 8;
  const chartH = height - YPAD_T - YPAD_B;
  const toY = (v: number) => YPAD_T + (chartH - Math.max(4, ((v - minVal) / range) * (chartH - 4)));
  const toBarH = (v: number) => Math.max(2, Math.round(((v - minVal) / range) * (chartH - 4)) + 2);

  const tooltipItems = selectedIdx !== null
    ? series.map((s) => {
        const pt = s.data[s.data.length - total + selectedIdx];
        return pt ? { label: s.label, value: pt.value, date: pt.date, color: s.color } : null;
      }).filter(Boolean)
    : [];

  return (
    <View style={styles.chartOuter}>
      {/* Tooltip */}
      {tooltipItems.length > 0 && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>{formatDateLong(tooltipItems[0]!.date)}</Text>
          {tooltipItems.map((t) => (
            <View key={t!.label} style={styles.tooltipRow}>
              <View style={[styles.tooltipDot, { backgroundColor: t!.color }]} />
              <Text style={styles.tooltipLabel}>{t!.label}:</Text>
              <Text style={styles.tooltipValue}>{formatValue(t!.value, unit)}</Text>
            </View>
          ))}
        </View>
      )}

      <View
        style={[styles.chartWrap, { height }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Mandate bands */}
        <View style={[StyleSheet.absoluteFill, { left: XPAD_L }]}>
          {bands.map((b, i) => {
            const avail = Math.max(containerWidth - XPAD_L - XPAD_R, 1);
            return (
              <View key={i} style={[StyleSheet.absoluteFill, {
                left: (b.s / total) * avail,
                width: ((b.e - b.s + 1) / total) * avail,
                right: undefined,
                backgroundColor: b.color,
                opacity: 0.07,
              }]} />
            );
          })}
        </View>

        {/* Y-axis grid + labels */}
        {[{ pct: 0, val: minVal }, { pct: 0.5, val: midVal }, { pct: 1, val: maxVal }].map(({ pct, val }) => {
          const bottom = YPAD_B + pct * chartH;
          return (
            <React.Fragment key={pct}>
              <View style={[styles.gridLine, { bottom, left: XPAD_L }]} />
              <Text style={[styles.yLabel, { bottom: bottom - 7 }]}>
                {formatValue(val, unit)}
              </Text>
            </React.Fragment>
          );
        })}

        {/* Selected highlight */}
        {selectedIdx !== null && containerWidth > 0 && (
          <View style={{
            position: 'absolute',
            top: YPAD_T, bottom: YPAD_B,
            left: XPAD_L + ((containerWidth - XPAD_L - XPAD_R) / total) * selectedIdx,
            width: (containerWidth - XPAD_L - XPAD_R) / total,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
        )}

        {type === 'line' && containerWidth > 0 ? (
          series.map((s) => {
            const pts = labels.map((_, i) => {
              const pt = s.data[s.data.length - total + i];
              if (!pt) return null;
              const avail = containerWidth - XPAD_L - XPAD_R;
              return { x: XPAD_L + (avail / Math.max(total - 1, 1)) * i, y: toY(pt.value), pt };
            });
            return (
              <React.Fragment key={s.label}>
                {pts.map((p, i) => {
                  if (!p || i === 0) return null;
                  const prev = pts[i - 1];
                  if (!prev) return null;
                  const dx = p.x - prev.x, dy = p.y - prev.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                  return (
                    <View key={`l${i}`} style={{
                      position: 'absolute',
                      width: len, height: 2,
                      backgroundColor: s.color, opacity: 0.9,
                      left: (prev.x + p.x) / 2 - len / 2,
                      top: (prev.y + p.y) / 2 - 1,
                      transform: [{ rotate: `${angle}deg` }],
                      borderRadius: 1,
                    }} />
                  );
                })}
                {pts.map((p, i) => p ? (
                  <TouchableOpacity key={`d${i}`}
                    onPress={() => setSelectedIdx(selectedIdx === i ? null : i)}
                    style={{ position: 'absolute', width: 20, height: 20, left: p.x - 10, top: p.y - 10, alignItems: 'center', justifyContent: 'center' }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: selectedIdx === i ? 9 : 5,
                      height: selectedIdx === i ? 9 : 5,
                      borderRadius: 5,
                      backgroundColor: s.color,
                      borderWidth: selectedIdx === i ? 2 : 0,
                      borderColor: '#0a0a0b',
                    }} />
                  </TouchableOpacity>
                ) : null)}
              </React.Fragment>
            );
          })
        ) : (
          <View style={[styles.barsArea, { left: XPAD_L, right: XPAD_R, bottom: YPAD_B, top: YPAD_T }]}>
            {labels.map((_, idx) => (
              <TouchableOpacity key={idx}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 1 }}
                onPress={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                activeOpacity={0.7}
              >
                {series.map((s) => {
                  const pt = s.data[s.data.length - total + idx];
                  if (!pt) return <View key={s.label} style={{ flex: 1 }} />;
                  return (
                    <View key={s.label} style={{
                      flex: 1, height: toBarH(pt.value),
                      backgroundColor: s.color,
                      opacity: selectedIdx === null || selectedIdx === idx ? 0.85 : 0.3,
                      borderRadius: 1,
                    }} />
                  );
                })}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* X labels */}
        <View style={[styles.xLabels, { left: XPAD_L, right: XPAD_R }]}>
          {[0, Math.floor(total / 2), total - 1].map((i) => {
            const pt = labels[i];
            return pt ? <Text key={i} style={styles.xLabel}>{formatDateShort(pt.date)}</Text> : null;
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────

function DataTable({ series, unit }: { series: ChartSeries[]; unit: string }) {
  const [open, setOpen] = useState(false);
  if (series.length === 0) return null;

  const dateMap = new Map<string, Record<string, DataPoint>>();
  for (const s of series) {
    for (const pt of s.data) {
      const d = normalizeDate(pt.date);
      if (!dateMap.has(d)) dateMap.set(d, {});
      dateMap.get(d)![s.label] = pt;
    }
  }
  const dates = [...dateMap.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 36);

  return (
    <View style={styles.tableWrap}>
      <TouchableOpacity style={styles.tableToggle} onPress={() => setOpen((o) => !o)} accessibilityRole="button">
        <Text style={styles.tableToggleText}>Ver tabla de datos</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#52525a" />
      </TouchableOpacity>
      {open && (
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>Fecha</Text>
            {series.map((s) => (
              <View key={s.label} style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.color }} />
                <Text style={[styles.tableCell, styles.headerCell]} numberOfLines={1}>{s.label}</Text>
              </View>
            ))}
            <Text style={[styles.tableCell, styles.headerCell]}>Var.</Text>
          </View>
          {dates.map((date, i) => {
            const row = dateMap.get(date)!;
            const prevDate = dates[i + 1];
            const prevRow = prevDate ? dateMap.get(prevDate) : null;
            const s0 = series[0];
            const curr = s0 ? row[s0.label] : null;
            const prev = s0 && prevRow ? prevRow[s0.label] : null;
            const varNum = curr && prev && prev.value !== 0
              ? ((curr.value - prev.value) / Math.abs(prev.value)) * 100
              : null;
            return (
              <View key={date} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{formatDateLong(date)}</Text>
                {series.map((s) => {
                  const pt = row[s.label];
                  return (
                    <Text key={s.label} style={[styles.tableCell, { color: '#e4e4e7' }]}>
                      {pt ? formatValue(pt.value, unit) : '—'}
                    </Text>
                  );
                })}
                <Text style={[styles.tableCell, {
                  color: varNum == null ? '#52525a' : varNum > 0 ? '#ef4444' : '#10b981',
                }]}>
                  {formatVariation(varNum)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function IndicatorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { indicatorId, categoryId } = route.params;

  const indicator = useMemo(() => getIndicator(indicatorId), [indicatorId]);

  const {
    activeChipIds, activeTemporality, isRealEnabled, chartType,
    toggleChip, setTemporality, toggleReal, setActiveChips, setChartType, navigateToIndicator,
  } = useNavStore();

  const [metricData, setMetricData] = useState<Record<string, DataPoint[]>>({});
  const [loading, setLoading] = useState(false);
  const [dateRangeIdx, setDateRangeIdx] = useState(1); // default 1A

  const fromDate = DATE_RANGES[dateRangeIdx].months === 0
    ? undefined
    : getFromDate(DATE_RANGES[dateRangeIdx].months);

  useEffect(() => {
    if (!indicator) return;
    navigateToIndicator(indicatorId, categoryId);
    const defaults = indicator.chips.filter((c) => c.isDefault).map((c) => c.id);
    setActiveChips(defaults.length > 0 ? defaults : [indicator.chips[0]?.id]);
  }, [indicatorId]);

  useEffect(() => {
    if (!indicator) return;
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      const names = [...new Set(
        indicator.chips.map((c) => c.metricName).filter((n) => n !== 'usd_brecha')
      )];
      // brecha needs oficial+blue regardless of chip selection
      if (indicator.chips.some((c) => c.metricName === 'usd_brecha')) {
        if (!names.includes('usd_oficial')) names.push('usd_oficial');
        if (!names.includes('usd_blue')) names.push('usd_blue');
      }

      const results: Record<string, DataPoint[]> = {};
      await Promise.all(names.map(async (name) => {
        try {
          const resp: any = await metricsApi.getMetricByName(name, { from: fromDate, limit: 1000 });
          const items: any[] = Array.isArray(resp.data) ? resp.data : [];
          results[name] = items
            .map((m) => ({ date: normalizeDate(m.date), value: m.value, source: m.source }))
            .sort((a, b) => a.date.localeCompare(b.date));
        } catch {
          results[name] = [];
        }
      }));

      if (!cancelled) { setMetricData(results); setLoading(false); }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [indicatorId, fromDate]);

  const brechaData = useMemo((): DataPoint[] => {
    const blue = metricData['usd_blue'] ?? [];
    const oficial = metricData['usd_oficial'] ?? [];
    const oMap = new Map(oficial.map((d) => [d.date, d.value]));
    return blue
      .filter((d) => oMap.has(d.date) && oMap.get(d.date)! > 0)
      .map((d) => ({
        date: d.date,
        value: parseFloat(((d.value - oMap.get(d.date)!) / oMap.get(d.date)! * 100).toFixed(2)),
        source: 'Cálculo propio',
      }));
  }, [metricData]);

  const series: ChartSeries[] = useMemo(() => {
    if (!indicator) return [];
    return activeChipIds
      .map((chipId, idx) => {
        const chip = indicator.chips.find((c) => c.id === chipId);
        if (!chip) return null;
        const raw = chip.metricName === 'usd_brecha' ? brechaData : (metricData[chip.metricName] ?? []);
        let data: DataPoint[] = raw;
        if (activeTemporality === 'interanual') data = calcInteranual(raw);
        else if (activeTemporality === 'acumulado') data = calcAcumulado(raw);
        if (data.length === 0) return null;
        return { label: chip.label, color: SERIES_COLORS[idx % SERIES_COLORS.length], data };
      })
      .filter(Boolean) as ChartSeries[];
  }, [indicator, activeChipIds, metricData, brechaData, activeTemporality]);

  if (!indicator) {
    return <View style={styles.centered}><Text style={styles.errorText}>Indicador no encontrado</Text></View>;
  }

  const hasReal = indicator.toggles.some((t) => t.id === 'real');
  const chartUnit = activeTemporality === 'interanual' || activeTemporality === 'acumulado' ? '%' : indicator.unit;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Volver">
          <Icon name="chevron-back" size={24} color="#f4f4f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{indicator.label}</Text>
        <View style={styles.chartTypeToggle}>
          <TouchableOpacity
            style={[styles.chartTypeBtn, chartType === 'bars' && styles.chartTypeBtnActive]}
            onPress={() => setChartType('bars')} accessibilityRole="button" accessibilityLabel="Barras"
          >
            <Icon name="bar-chart-outline" size={15} color={chartType === 'bars' ? '#818cf8' : '#52525a'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeBtn, chartType === 'line' && styles.chartTypeBtnActive]}
            onPress={() => setChartType('line')} accessibilityRole="button" accessibilityLabel="Línea"
          >
            <Icon name="analytics" size={15} color={chartType === 'line' ? '#818cf8' : '#52525a'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
          {indicator.chips.map((chip) => {
            const isActive = activeChipIds.includes(chip.id);
            return (
              <TouchableOpacity key={chip.id} style={[styles.chip, isActive && styles.chipActive]} onPress={() => toggleChip(chip.id)} accessibilityRole="button">
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Temporalidad + Real */}
        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            {indicator.temporalities.map((mode) => {
              const isActive = activeTemporality === mode;
              return (
                <TouchableOpacity key={mode} style={[styles.pill, isActive && styles.pillActive]} onPress={() => setTemporality(mode)} accessibilityRole="button">
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{TEMPORALITY_LABELS[mode]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {hasReal && (
            <TouchableOpacity style={[styles.realToggle, isRealEnabled && styles.realToggleActive]} onPress={toggleReal} accessibilityRole="checkbox">
              <Text style={[styles.realToggleText, isRealEnabled && styles.realToggleTextActive]}>Real</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date range */}
        <View style={styles.dateRangeRow}>
          {DATE_RANGES.map((r, idx) => (
            <TouchableOpacity key={r.label} style={[styles.dateBtn, dateRangeIdx === idx && styles.dateBtnActive]} onPress={() => setDateRangeIdx(idx)} accessibilityRole="button">
              <Text style={[styles.dateBtnText, dateRangeIdx === idx && styles.dateBtnTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        {series.length > 1 && (
          <View style={styles.legend}>
            {series.map((s) => (
              <View key={s.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text style={styles.legendLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Chart */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#818cf8" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : series.length > 0 ? (
          <>
            <ViewChart series={series} height={200} type={chartType} unit={chartUnit} />
            <View style={styles.mandateLegend}>
              {MANDATOS.slice(-4).map((m) => (
                <View key={m.id} style={styles.mandateLegendItem}>
                  <View style={[styles.mandateDot, { backgroundColor: m.color }]} />
                  <Text style={styles.mandateLegendText} numberOfLines={1}>{m.presidente.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="bar-chart-outline" size={36} color="#3f3f46" />
            <Text style={styles.emptyText}>Sin datos disponibles</Text>
            <Text style={styles.emptySubtext}>Seleccioná un rango más amplio o esperá la próxima ingesta</Text>
          </View>
        )}

        {/* Sources */}
        <View style={styles.sourceRow}>
          {indicator.chips.filter((c) => activeChipIds.includes(c.id)).map((c) => (
            <Text key={c.id} style={styles.sourceText}>{c.label}: {c.source}</Text>
          ))}
        </View>

        {/* Table */}
        <DataTable series={series} unit={chartUnit} />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0b' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0b' },
  errorText: { color: '#ef4444', fontSize: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1c1c26',
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#f4f4f5', fontWeight: '700', fontSize: 17 },
  chartTypeToggle: { flexDirection: 'row', gap: 2, backgroundColor: '#2c2c2e', borderRadius: 8, padding: 3 },
  chartTypeBtn: { padding: 5, borderRadius: 6 },
  chartTypeBtnActive: { backgroundColor: '#1e1e3f' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  chipsScroll: { marginTop: 14 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#2c2c2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: '#3730a3', borderColor: '#818cf8' },
  chipText: { fontSize: 13, color: '#8e8e93', fontWeight: '500' },
  chipTextActive: { color: '#e0e7ff', fontWeight: '600' },

  controlsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 10, gap: 10 },
  pillsRow: { gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#2c2c2e' },
  pillActive: { backgroundColor: '#1e3a5f' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  pillTextActive: { color: '#60a5fa' },
  realToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#2c2c2e', borderWidth: 1, borderColor: 'transparent' },
  realToggleActive: { backgroundColor: '#14532d', borderColor: '#16a34a' },
  realToggleText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  realToggleTextActive: { color: '#4ade80' },

  dateRangeRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 10, gap: 6 },
  dateBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, backgroundColor: '#2c2c2e', borderWidth: 1, borderColor: 'transparent' },
  dateBtnActive: { backgroundColor: '#1c1c3a', borderColor: '#818cf8' },
  dateBtnText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  dateBtnTextActive: { color: '#818cf8' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 10, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#a1a1aa' },

  chartOuter: { marginHorizontal: 16, marginTop: 14 },
  tooltip: { backgroundColor: '#1c1c2e', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', marginBottom: 6, gap: 4 },
  tooltipDate: { fontSize: 11, color: '#8e8e93', marginBottom: 2 },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipDot: { width: 7, height: 7, borderRadius: 3.5 },
  tooltipLabel: { fontSize: 12, color: '#a1a1aa', flex: 1 },
  tooltipValue: { fontSize: 13, color: '#f4f4f5', fontWeight: '700' },

  chartWrap: { backgroundColor: '#1c1c1e', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  barsArea: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end' },
  gridLine: { position: 'absolute', right: 8, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  yLabel: { position: 'absolute', left: 4, fontSize: 9, color: '#52525a', width: 40, textAlign: 'right' },
  xLabels: { position: 'absolute', bottom: 4, flexDirection: 'row', justifyContent: 'space-between' },
  xLabel: { fontSize: 9, color: '#52525a' },

  mandateLegend: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8, gap: 12, flexWrap: 'wrap' },
  mandateLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mandateDot: { width: 8, height: 8, borderRadius: 4 },
  mandateLegendText: { fontSize: 10, color: '#71717a' },

  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  loadingText: { color: '#52525a', fontSize: 13 },
  emptyChart: { margin: 16, paddingVertical: 40, backgroundColor: '#1c1c1e', borderRadius: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  emptyText: { color: '#71717a', fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: '#3f3f46', fontSize: 12, textAlign: 'center', paddingHorizontal: 30 },

  sourceRow: { paddingHorizontal: 16, marginTop: 10, gap: 2 },
  sourceText: { fontSize: 11, color: '#52525a' },

  tableWrap: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#1c1c1e', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  tableToggle: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  tableToggleText: { flex: 1, color: '#8e8e93', fontSize: 13, fontWeight: '500' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', backgroundColor: '#252528', gap: 4 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9, gap: 4 },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tableCell: { flex: 1, fontSize: 12, color: '#71717a' },
  headerCell: { color: '#52525a', fontWeight: '600', fontSize: 11, letterSpacing: 0.3 },
});
