import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { useMetricsStore } from '../store/metricsStore';
import { useNavStore } from '../store/navStore';
import { INDICATORS_BY_CATEGORY } from '../data/indicators';
import { RootStackParamList } from '../navigation/TabNavigator';
import { AppCategory, IndicatorDef } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Category'>;
type Route = RouteProp<RootStackParamList, 'Category'>;

const CATEGORY_LABELS: Record<AppCategory, string> = {
  economicas: 'Económicas',
  sociales: 'Sociales',
  laborales: 'Laborales',
  fiscales: 'Fiscales',
};

function genSparkline(base: number, points = 8): number[] {
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const delta = (Math.random() - 0.48) * Math.max(base, 1) * 0.05;
    data.push(Math.max(0, data[i - 1] + delta));
  }
  return data;
}

function MiniSparkline({ color }: { color: string }) {
  const data = genSparkline(50 + Math.random() * 50);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: 56, height: 24, gap: 2 }}>
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(2, Math.round(((v - min) / range) * 20) + 2),
            backgroundColor: color,
            opacity: 0.35 + 0.65 * (i / (data.length - 1)),
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

function IndicatorCard({ indicator, onPress }: { indicator: IndicatorDef; onPress: () => void }) {
  const { metrics } = useMetricsStore();
  const defaultChip = indicator.chips.find((c) => c.isDefault) ?? indicator.chips[0];
  const latestMetric = metrics?.find((m) => m.name === defaultChip?.metricName);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${indicator.label}`}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.iconWrap, { backgroundColor: `${indicator.color}18` }]}>
          <Icon name={indicator.icon} size={20} color={indicator.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{indicator.label}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {indicator.chips.map((c) => c.label).join(' · ')}
          </Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <MiniSparkline color={indicator.color} />
        {latestMetric != null ? (
          <Text style={[styles.cardValue, { color: indicator.color }]}>
            {latestMetric.value.toFixed(latestMetric.value < 100 ? 1 : 0)}
            {indicator.unit === '%' ? '%' : ''}
          </Text>
        ) : (
          <Text style={styles.cardValueEmpty}>—</Text>
        )}
        <Icon name="chevron-forward" size={14} color="#52525a" />
      </View>
    </TouchableOpacity>
  );
}

export default function CategoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { categoryId } = route.params;
  const { navigateToIndicator } = useNavStore();
  const { fetchMetrics } = useMetricsStore();

  const indicators = INDICATORS_BY_CATEGORY[categoryId] ?? [];

  useEffect(() => {
    fetchMetrics({ limit: 50 });
  }, [categoryId]);

  function goIndicator(indicatorId: string) {
    navigateToIndicator(indicatorId, categoryId);
    navigation.navigate('Indicator', { indicatorId, categoryId });
  }

  return (
    <View style={styles.root}>
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
        <Text style={styles.headerTitle}>{CATEGORY_LABELS[categoryId]}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.countLabel}>
          {indicators.length} indicador{indicators.length !== 1 ? 'es' : ''}
        </Text>
        {indicators.map((ind) => (
          <IndicatorCard
            key={ind.id}
            indicator={ind}
            onPress={() => goIndicator(ind.id)}
          />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0b' },
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  countLabel: { fontSize: 11, color: '#52525a', fontWeight: '600', letterSpacing: 0.5, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
  cardSub: { color: '#52525a', fontSize: 11, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardValue: { fontSize: 15, fontWeight: '700' },
  cardValueEmpty: { fontSize: 15, color: '#52525a' },
});
