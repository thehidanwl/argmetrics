import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMetricsStore } from '../store/metricsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/TabNavigator';

type TabCat = 'all' | 'economy' | 'social' | 'consumption';
const CAT_LABELS: Record<TabCat, string> = { all: 'Todos', economy: 'Economía', social: 'Social', consumption: 'Consumo' };

// Fallback metric list (same as before but enriched)
const METRICS_LIST = [
  { name: 'inflation',    category: 'economy',     label: 'Inflación IPC',  source: 'INDEC', period: 'Mensual',  icon: '%',  color: '#f59e0b' },
  { name: 'usd_official', category: 'economy',     label: 'Dólar Oficial',  source: 'BCRA',  period: 'Diario',   icon: '$',  color: '#a1a1aa' },
  { name: 'usd_blue',     category: 'economy',     label: 'Dólar Blue',     source: 'Bluelytics', period: 'Diario', icon: '$', color: '#10b981' },
  { name: 'interest_rate',category: 'economy',     label: 'Tasa BCRA',      source: 'BCRA',  period: 'Mensual',  icon: '%',  color: '#818cf8' },
  { name: 'reserves',     category: 'economy',     label: 'Reservas BCRA',  source: 'BCRA',  period: 'Diario',   icon: '$',  color: '#3b82f6' },
  { name: 'gdp',          category: 'economy',     label: 'PBI',            source: 'INDEC', period: 'Trimestral',icon: '↑', color: '#6366f1' },
  { name: 'country_risk', category: 'economy',     label: 'Riesgo País',    source: 'JPMorgan', period: 'Diario', icon: '⚠', color: '#ef4444' },
  { name: 'poverty',      category: 'social',      label: 'Pobreza',        source: 'INDEC', period: 'Semestral', icon: '%', color: '#ef4444' },
  { name: 'unemployment', category: 'social',      label: 'Desempleo',      source: 'INDEC', period: 'Trimestral',icon: '%', color: '#f59e0b' },
];

export default function MetricsScreen() {
  const { categories, isLoadingCategories, fetchCategories } = useMetricsStore();
  const [selectedCat, setSelectedCat] = useState<TabCat>('all');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => { fetchCategories(); }, []);

  const filtered = selectedCat === 'all'
    ? METRICS_LIST
    : METRICS_LIST.filter(m => m.category === selectedCat);

  return (
    <View style={m.container}>
      {/* Category tabs */}
      <View style={m.tabsWrapper}>
        <View style={m.tabsContainer}>
          {(['all', 'economy', 'social', 'consumption'] as TabCat[]).map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCat(cat)}
              style={[m.tab, selectedCat === cat && m.tabActive]}
            >
              <Text style={[m.tabLabel, selectedCat === cat && m.tabLabelActive]}>
                {CAT_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Count row */}
        {categories.length > 0 && (
          <View style={m.countRow}>
            {categories
              .filter(c => selectedCat === 'all' || c.name === selectedCat)
              .map(cat => (
                <View key={cat.name} style={m.countCard}>
                  <Text style={m.countNum}>{cat.metricsCount}</Text>
                  <Text style={m.countLabel}>{CAT_LABELS[cat.name as TabCat] ?? cat.name}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Section header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, paddingHorizontal: 14 }}>
          <View style={{ width: 3, height: 14, borderRadius: 99, backgroundColor: '#6366f1' }} />
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#71717a', textTransform: 'uppercase' }}>
            {filtered.length} métricas
          </Text>
        </View>
      </View>

      {isLoadingCategories ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.name}
          contentContainerStyle={[m.listContent, { paddingBottom: 16 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={m.metricRow}
                onPress={() => navigation.navigate('MetricDetail', {
                  metricName: item.name,
                  metricLabel: item.label,
                  metricColor: item.color,
                })}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={[m.metricIcon, { backgroundColor: item.color + '12', borderColor: item.color + '25' }]}>
                  <Text style={[m.metricIconText, { color: item.color }]}>{item.icon}</Text>
                </View>
                {/* Info */}
                <View style={m.metricInfo}>
                  <Text style={m.metricName}>{item.label}</Text>
                  <View style={m.metricMeta}>
                    <View style={m.sourceBadge}>
                      <Text style={m.sourceText}>{item.source}</Text>
                    </View>
                    <Text style={m.metaDot}>·</Text>
                    <Text style={m.metaPeriod}>{item.period}</Text>
                  </View>
                </View>
                {/* Arrow */}
                <Text style={[m.arrow, { color: item.color }]}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c26' },
  tabsWrapper: { backgroundColor: '#1c1c26', paddingTop: 10 },
  tabsContainer: { flexDirection: 'row', gap: 4, backgroundColor: '#262630', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginHorizontal: 14, marginBottom: 12 },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive:     { backgroundColor: '#4f46e5', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  tabLabel:      { fontSize: 11, fontWeight: '700', color: '#71717a' },
  tabLabelActive:{ color: 'white' },
  countRow:      { flexDirection: 'row', gap: 8, marginHorizontal: 14, marginBottom: 12 },
  countCard:     { flex: 1, backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 12, alignItems: 'center', paddingVertical: 10 },
  countNum:      { fontSize: 20, fontWeight: '800', color: '#f4f4f5' },
  countLabel:    { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginTop: 2 },
  listContent:   { paddingHorizontal: 14, paddingTop: 8 },
  metricRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 14, marginBottom: 8 },
  metricIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  metricIconText:{ fontSize: 16, fontWeight: '700' },
  metricInfo:    { flex: 1, minWidth: 0 },
  metricName:    { fontSize: 13, fontWeight: '600', color: '#f4f4f5', marginBottom: 4 },
  metricMeta:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sourceBadge:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
  sourceText:    { fontSize: 9, fontWeight: '600', color: '#71717a' },
  metaDot:       { color: '#71717a', fontSize: 10 },
  metaPeriod:    { fontSize: 9, color: '#71717a' },
  arrow:         { fontSize: 22, fontWeight: '300' },
});
