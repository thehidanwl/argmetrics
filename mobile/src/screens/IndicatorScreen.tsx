import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useMetricsStore } from '../store/metricsStore';
import { useNavStore } from '../store/navStore';
import { getIndicator } from '../data/indicators';
import { getMandatoForDate, MANDATOS } from '../data/mandatos';
import { RootStackParamList } from '../navigation/TabNavigator';
import { DataPoint, TemporalityMode } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Indicator'>;
type Route = RouteProp<RootStackParamList, 'Indicator'>;

const TEMPORALITY_LABELS: Record<TemporalityMode, string> = {
  monthly: 'M',
  interanual: 'IA',
  acumulado: 'Acum',
  mandato: 'Mandato',
};

// ─── Cálculos de series derivadas ────────────────────────────────────────────

function calcInteranual(data: DataPoint[]): DataPoint[] {
  return data
    .map((point, idx) => {
      const sameMonthLastYear = data.find((p) => {
        const d1 = new Date(p.date);
        const d2 = new Date(point.date);
        return (
          d1.getMonth() === d2.getMonth() &&
          d1.getFullYear() === d2.getFullYear() - 1
        );
      });
      if (!sameMonthLastYear) return null;
      const variation =
        ((point.value - sameMonthLastYear.value) / Math.abs(sameMonthLastYear.value)) * 100;
      return { date: point.date, value: parseFloat(variation.toFixed(2)) };
    })
    .filter(Boolean) as DataPoint[];
}

function calcAcumulado(data: DataPoint[]): DataPoint[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const firstYear = new Date(sorted[0].date).getFullYear();
  let acum = 1;
  let lastYear = firstYear;

  return sorted.map((point) => {
    const year = new Date(point.date).getFullYear();
    if (year !== lastYear) {
      acum = 1;
      lastYear = year;
    }
    acum *= 1 + point.value / 100;
    return { date: point.date, value: parseFloat(((acum - 1) * 100).toFixed(2)) };
  });
}

// ─── Componente ViewChart (sin SVG) ──────────────────────────────────────────

interface ChartSeries {
  label: string;
  color: string;
  data: DataPoint[];
}

function ViewChart({
  series,
  height = 180,
  type = 'bars',
}: {
  series: ChartSeries[];
  height?: number;
  type?: 'bars' | 'line';
}) {
  const [containerWidth, setContainerWidth] = useState(0);

  const allData = series.flatMap((s) => s.data);
  if (allData.length === 0) return null;

  const allValues = allData.map((d) => d.value);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const longest = series.reduce((a, b) => (a.data.length > b.data.length ? a : b));
  const labels = longest.data.slice(-24);

  // Mandate bands
  const mandateBands: { startIdx: number; endIdx: number; color: string }[] = [];
  let lastMandato: string | null = null;
  let bandStart = 0;
  labels.forEach((point, idx) => {
    const mandato = getMandatoForDate(point.date);
    const mandatoId = mandato?.id ?? 'none';
    if (mandatoId !== lastMandato) {
      if (lastMandato !== null) {
        const prevMandato = MANDATOS.find((m) => m.id === lastMandato);
        mandateBands.push({ startIdx: bandStart, endIdx: idx - 1, color: prevMandato?.color ?? '#333' });
      }
      bandStart = idx;
      lastMandato = mandatoId;
    }
    if (idx === labels.length - 1) {
      const currMandato = MANDATOS.find((m) => m.id === mandatoId);
      mandateBands.push({ startIdx: bandStart, endIdx: idx, color: currMandato?.color ?? '#333' });
    }
  });

  const MandateBands = () => (
    <View style={StyleSheet.absoluteFill}>
      {mandateBands.map((band, i) => {
        const leftPct = band.startIdx / labels.length;
        const widthPct = (band.endIdx - band.startIdx + 1) / labels.length;
        return (
          <View
            key={i}
            style={[StyleSheet.absoluteFill, {
              left: `${leftPct * 100}%` as any,
              width: `${widthPct * 100}%` as any,
              backgroundColor: band.color,
              opacity: 0.06,
            }]}
          />
        );
      })}
    </View>
  );

  const GridLines = () => (
    <>
      {[0.25, 0.5, 0.75].map((pct) => (
        <View key={pct} style={[styles.gridLine, { bottom: pct * height }]} />
      ))}
    </>
  );

  const XLabels = () => (
    <View style={styles.xLabels}>
      {[0, Math.floor(labels.length / 2), labels.length - 1].map((idx) => {
        const point = labels[idx];
        if (!point) return null;
        const d = new Date(point.date);
        return (
          <Text key={idx} style={styles.xLabel}>
            {`${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`}
          </Text>
        );
      })}
    </View>
  );

  if (type === 'line') {
    const pLeft = 6, pRight = 6, pTop = 8, pBottom = 28;
    const chartW = Math.max(containerWidth - pLeft - pRight, 1);
    const chartH = height - pTop - pBottom;

    const getPoint = (s: ChartSeries, idx: number) => {
      const matchingPoint = s.data[s.data.length - labels.length + idx];
      if (!matchingPoint) return null;
      const x = pLeft + (chartW / Math.max(labels.length - 1, 1)) * idx;
      const normH = Math.max(4, ((matchingPoint.value - minVal) / range) * (chartH - 4));
      const y = pTop + (chartH - normH);
      return { x, y };
    };

    return (
      <View
        style={[styles.chartWrap, { height }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <MandateBands />
        <GridLines />

        {containerWidth > 0 && series.map((s) => {
          const points = labels.map((_, idx) => getPoint(s, idx));
          return (
            <React.Fragment key={s.label}>
              {points.map((p, idx) => {
                if (!p || idx === 0) return null;
                const prev = points[idx - 1];
                if (!prev) return null;
                const dx = p.x - prev.x;
                const dy = p.y - prev.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                return (
                  <View
                    key={`line-${idx}`}
                    style={{
                      position: 'absolute',
                      width: length,
                      height: 2,
                      backgroundColor: s.color,
                      opacity: 0.85,
                      left: (prev.x + p.x) / 2 - length / 2,
                      top: (prev.y + p.y) / 2 - 1,
                      transform: [{ rotate: `${angle}deg` }],
                      borderRadius: 1,
                    }}
                  />
                );
              })}
              {points.map((p, idx) => p ? (
                <View
                  key={`dot-${idx}`}
                  style={{
                    position: 'absolute',
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: s.color,
                    left: p.x - 2.5,
                    top: p.y - 2.5,
                  }}
                />
              ) : null)}
            </React.Fragment>
          );
        })}

        <XLabels />
      </View>
    );
  }

  // Bars mode
  const barWidth = Math.max(2, Math.floor(300 / labels.length));
  const gap = Math.max(1, Math.floor(barWidth * 0.15));

  return (
    <View
      style={[styles.chartWrap, { height }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <MandateBands />
      <GridLines />

      <View style={styles.barsContainer}>
        {labels.map((point, idx) => (
          <View key={idx} style={[styles.barGroup, { gap }]}>
            {series.map((s) => {
              const matchingPoint = s.data[s.data.length - labels.length + idx];
              if (!matchingPoint) return <View key={s.label} style={{ width: barWidth }} />;
              const normalizedH = Math.max(
                2,
                Math.round(((matchingPoint.value - minVal) / range) * (height - 12)) + 2
              );
              return (
                <View
                  key={s.label}
                  style={{
                    width: barWidth,
                    height: normalizedH,
                    backgroundColor: s.color,
                    opacity: 0.85,
                    borderRadius: 1,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      <XLabels />
    </View>
  );
}

// ─── Tabla de datos (colapsable) ─────────────────────────────────────────────

function DataTable({ series }: { series: ChartSeries[] }) {
  const [open, setOpen] = useState(false);
  if (series.length === 0 || series[0].data.length === 0) return null;

  const main = series[0];
  const rows = [...main.data].reverse().slice(0, 24);

  return (
    <View style={styles.tableWrap}>
      <TouchableOpacity
        style={styles.tableToggle}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Ocultar tabla' : 'Ver tabla de datos'}
      >
        <Text style={styles.tableToggleText}>▼ Ver tabla de datos</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#52525a" />
      </TouchableOpacity>

      {open && (
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Fecha</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Valor</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Var. %</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Fuente</Text>
          </View>
          {rows.map((row, i) => {
            const prev = rows[i + 1];
            const variation =
              prev && prev.value !== 0
                ? (((row.value - prev.value) / Math.abs(prev.value)) * 100).toFixed(1)
                : '—';
            const d = new Date(row.date);
            const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
            return (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <Text style={styles.tableCell}>{label}</Text>
                <Text style={[styles.tableCell, { color: '#f4f4f5' }]}>
                  {row.value.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { color: parseFloat(variation) > 0 ? '#ef4444' : '#10b981' },
                  ]}
                >
                  {variation !== '—' ? `${parseFloat(variation) > 0 ? '+' : ''}${variation}%` : '—'}
                </Text>
                <Text style={styles.tableCell}>{row.source ?? main.label}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function IndicatorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { indicatorId, categoryId } = route.params;

  const indicator = getIndicator(indicatorId);
  const { metrics, isLoadingMetrics, fetchMetrics } = useMetricsStore();
  const {
    activeChipIds,
    activeTemporality,
    isRealEnabled,
    chartType,
    toggleChip,
    setTemporality,
    toggleReal,
    setActiveChips,
    navigateToIndicator,
  } = useNavStore();

  // Inicializar chips por defecto
  useEffect(() => {
    if (!indicator) return;
    navigateToIndicator(indicatorId, categoryId);
    const defaultChips = indicator.chips
      .filter((c) => c.isDefault)
      .map((c) => c.id);
    setActiveChips(defaultChips.length > 0 ? defaultChips : [indicator.chips[0]?.id]);
    fetchMetrics({ limit: 200 });
  }, [indicatorId]);

  // Construir series a partir de datos de la DB
  const series: ChartSeries[] = useMemo(() => {
    if (!indicator) return [];
    const SERIES_COLORS = ['#2563EB', '#E85D3A', '#16A34A', '#D97706', '#DB2777', '#0D9488'];

    return activeChipIds
      .map((chipId, idx) => {
        const chip = indicator.chips.find((c) => c.id === chipId);
        if (!chip) return null;

        const raw = metrics
          ?.filter((m) => m.name === chip.metricName)
          .map((m) => ({ date: m.date, value: m.value, source: m.source }))
          .sort((a, b) => a.date.localeCompare(b.date)) ?? [];

        let data: DataPoint[] = raw;

        if (activeTemporality === 'interanual') {
          data = calcInteranual(raw);
        } else if (activeTemporality === 'acumulado') {
          data = calcAcumulado(raw);
        }

        return {
          label: chip.label,
          color: SERIES_COLORS[idx % SERIES_COLORS.length],
          data,
        };
      })
      .filter(Boolean) as ChartSeries[];
  }, [indicator, activeChipIds, metrics, activeTemporality]);

  if (!indicator) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Indicador no encontrado</Text>
      </View>
    );
  }

  const hasReal = indicator.toggles.some((t) => t.id === 'real');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={24} color="#f4f4f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{indicator.label}</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Opciones avanzadas"
        >
          <Icon name="settings-outline" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chips multi-select */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {indicator.chips.map((chip) => {
            const isActive = activeChipIds.includes(chip.id);
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleChip(chip.id)}
                accessibilityRole="button"
                accessibilityLabel={`${chip.label}${isActive ? ' seleccionado' : ''}`}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Temporalidad + toggle Real */}
        <View style={styles.controlsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.temporalityRow}
          >
            {indicator.temporalities.map((mode) => {
              const isActive = activeTemporality === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => setTemporality(mode)}
                  accessibilityRole="button"
                  accessibilityLabel={TEMPORALITY_LABELS[mode]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {TEMPORALITY_LABELS[mode]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {hasReal && (
            <TouchableOpacity
              style={[styles.realToggle, isRealEnabled && styles.realToggleActive]}
              onPress={toggleReal}
              accessibilityRole="checkbox"
              accessibilityLabel="Valor real ajustado por inflación"
            >
              <Text style={[styles.realToggleText, isRealEnabled && styles.realToggleTextActive]}>
                Real
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Leyenda de series (si hay más de una) */}
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

        {/* Gráfico */}
        {isLoadingMetrics ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#818cf8" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : series.some((s) => s.data.length > 0) ? (
          <>
            <ViewChart series={series} height={200} type={chartType} />
            <View style={styles.mandateLegend}>
              {MANDATOS.slice(-4).map((m) => (
                <View key={m.id} style={styles.mandateLegendItem}>
                  <View style={[styles.mandateDot, { backgroundColor: m.color }]} />
                  <Text style={styles.mandateLegendText} numberOfLines={1}>
                    {m.presidente.split(' ')[0]}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="bar-chart-outline" size={36} color="#3f3f46" />
            <Text style={styles.emptyText}>Sin datos disponibles</Text>
            <Text style={styles.emptySubtext}>
              Los datos se cargarán cuando se ejecute la ingesta
            </Text>
          </View>
        )}

        {/* Info de la fuente */}
        <View style={styles.sourceRow}>
          {indicator.chips
            .filter((c) => activeChipIds.includes(c.id))
            .map((c) => (
              <Text key={c.id} style={styles.sourceText}>
                {c.label}: {c.source}
              </Text>
            ))}
        </View>

        {/* Tabla de datos */}
        <DataTable series={series} />

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1c1c26',
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#f4f4f5', fontWeight: '700', fontSize: 17 },
  headerBtn: { width: 40, alignItems: 'flex-end' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Chips
  chipsScroll: { marginTop: 14 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2c2c2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: '#3730a3',
    borderColor: '#818cf8',
  },
  chipText: { fontSize: 13, color: '#8e8e93', fontWeight: '500' },
  chipTextActive: { color: '#e0e7ff', fontWeight: '600' },

  // Temporalidad
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  temporalityRow: { gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
  },
  pillActive: { backgroundColor: '#1e3a5f' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  pillTextActive: { color: '#60a5fa' },
  realToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  realToggleActive: {
    backgroundColor: '#14532d',
    borderColor: '#16a34a',
  },
  realToggleText: { fontSize: 12, fontWeight: '600', color: '#71717a' },
  realToggleTextActive: { color: '#4ade80' },

  // Leyenda de series
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#a1a1aa' },

  // Chart
  chartWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingBottom: 28,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  xLabels: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: { fontSize: 9, color: '#52525a' },

  // Mandate legend
  mandateLegend: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 12,
    flexWrap: 'wrap',
  },
  mandateLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mandateDot: { width: 8, height: 8, borderRadius: 4 },
  mandateLegendText: { fontSize: 10, color: '#71717a' },

  // Loading / empty
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  loadingText: { color: '#52525a', fontSize: 13 },
  emptyChart: {
    margin: 16,
    paddingVertical: 40,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyText: { color: '#71717a', fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: '#3f3f46', fontSize: 12, textAlign: 'center', paddingHorizontal: 30 },

  // Source info
  sourceRow: {
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 2,
  },
  sourceText: { fontSize: 11, color: '#52525a' },

  // Table
  tableWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  tableToggleText: { flex: 1, color: '#8e8e93', fontSize: 13, fontWeight: '500' },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#252528',
  },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 9 },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tableCell: { flex: 1, fontSize: 12, color: '#71717a' },
  tableCellHeader: { color: '#52525a', fontWeight: '600', fontSize: 11, letterSpacing: 0.3 },
});
