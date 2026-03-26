import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { useMetricsStore } from '../store/metricsStore';
import { useNavStore } from '../store/navStore';
import { RootStackParamList } from '../navigation/TabNavigator';
import { AppCategory } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const CATEGORIES: { id: AppCategory; label: string; icon: string; color: string }[] = [
  { id: 'economicas', label: 'Económicas', icon: 'trending-up', color: '#10b981' },
  { id: 'sociales', label: 'Sociales', icon: 'people', color: '#e879f9' },
  { id: 'laborales', label: 'Laborales', icon: 'briefcase', color: '#fb923c' },
  { id: 'fiscales', label: 'Fiscales', icon: 'library', color: '#67e8f9' },
];

function genSparkline(base: number, points = 8): number[] {
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const delta = (Math.random() - 0.48) * base * 0.04;
    data.push(Math.max(0, data[i - 1] + delta));
  }
  return data;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: 50, height: 22, gap: 2 }}>
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(2, Math.round(((v - min) / range) * 18) + 2),
            backgroundColor: color,
            opacity: 0.4 + 0.6 * (i / (data.length - 1)),
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { usdRates, countryRisk, metrics, fetchUSDRates, fetchCountryRisk, fetchMetrics } = useMetricsStore();
  const { navigateToCategory, navigateHome } = useNavStore();

  useEffect(() => {
    navigateHome();
    fetchUSDRates();
    fetchCountryRisk();
    fetchMetrics({ limit: 20 });
  }, []);

  const inflation = metrics?.find((m) => m.name === 'inflation');
  const blueRate = usdRates?.blue ?? usdRates?.oficial;
  const risk = countryRisk;

  function goCategory(categoryId: AppCategory) {
    navigateToCategory(categoryId);
    navigation.navigate('Category', { categoryId });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0b" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.headerTitle}>ArgMetrics</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Ajustes"
          accessibilityRole="button"
        >
          <Icon name="settings-outline" size={22} color="#71717a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI rápidos */}
        <Text style={styles.sectionLabel}>DATOS PRINCIPALES</Text>
        <View style={styles.kpiRow}>
          {/* Dólar Blue */}
          <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.kpiTitle}>Dólar Blue</Text>
            <Text style={styles.kpiValue}>
              ${blueRate?.sell?.toLocaleString('es-AR') ?? '—'}
            </Text>
            <MiniSparkline data={genSparkline(blueRate?.sell ?? 1200)} color="#10b981" />
            <Text style={styles.kpiSub}>venta • Bluelytics</Text>
          </View>

          {/* Inflación */}
          <View style={[styles.kpiCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.kpiTitle}>Inflación</Text>
            <Text style={styles.kpiValue}>
              {inflation?.value != null ? `${inflation.value.toFixed(1)}%` : '—'}
            </Text>
            <MiniSparkline data={genSparkline(inflation?.value ?? 4)} color="#ef4444" />
            <Text style={styles.kpiSub}>mensual • INDEC</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {/* Riesgo País */}
          <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.kpiTitle}>Riesgo País</Text>
            <Text style={styles.kpiValue}>
              {risk?.value != null ? `${risk.value.toLocaleString('es-AR')} pts` : '—'}
            </Text>
            <MiniSparkline data={genSparkline(risk?.value ?? 800)} color="#f59e0b" />
            <Text style={styles.kpiSub}>EMBI+ • JPMorgan</Text>
          </View>

          {/* Dólar Oficial */}
          <View style={[styles.kpiCard, { borderLeftColor: '#94a3b8' }]}>
            <Text style={styles.kpiTitle}>Dólar Oficial</Text>
            <Text style={styles.kpiValue}>
              ${(usdRates?.oficial ?? usdRates?.official)?.sell?.toLocaleString('es-AR') ?? '—'}
            </Text>
            <MiniSparkline
              data={genSparkline((usdRates?.oficial ?? usdRates?.official)?.sell ?? 1000)}
              color="#94a3b8"
            />
            <Text style={styles.kpiSub}>venta • BCRA</Text>
          </View>
        </View>

        {/* CTA Comparar gobiernos */}
        <TouchableOpacity
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Comparar gobiernos"
        >
          <Icon name="git-compare" size={20} color="#818cf8" />
          <Text style={styles.ctaText}>Comparar gobiernos</Text>
          <Icon name="chevron-forward" size={16} color="#52525a" />
        </TouchableOpacity>

        {/* Categorías */}
        <Text style={styles.sectionLabel}>EXPLORAR</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryRow}
            onPress={() => goCategory(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
              <Icon name={cat.icon} size={20} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
            <Icon name="chevron-forward" size={16} color="#52525a" />
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: 'white', fontWeight: '800', fontSize: 15 },
  headerTitle: { color: '#f4f4f5', fontWeight: '700', fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52525a',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 6,
  },
  kpiTitle: { fontSize: 11, color: '#8e8e93', fontWeight: '600', letterSpacing: 0.3 },
  kpiValue: { fontSize: 22, color: '#f4f4f5', fontWeight: '700', letterSpacing: -0.5 },
  kpiSub: { fontSize: 10, color: '#52525a', marginTop: 2 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.2)',
  },
  ctaText: { flex: 1, color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { flex: 1, color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
});
