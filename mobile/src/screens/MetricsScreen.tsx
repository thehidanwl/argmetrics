import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Chip } from 'react-native-paper';
import { useMetricsStore } from '../store/metricsStore';
import { Category } from '../types';

const CATEGORIES: { key: string | null; label: string }[] = [
  { key: null, label: 'Todas' },
  { key: 'economy', label: 'Economía' },
  { key: 'social', label: 'Social' },
  { key: 'consumption', label: 'Consumo' },
];

export default function MetricsScreen() {
  const { categories, isLoadingCategories, fetchCategories, error } = useMetricsStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const metricsList = [
    { name: 'inflation', category: 'economy' as Category, description: 'Inflación mensual (IPC)', unit: '%', source: 'INDEC' },
    { name: 'usd_official', category: 'economy' as Category, description: 'Dólar oficial', unit: '$', source: 'BCRA' },
    { name: 'usd_blue', category: 'economy' as Category, description: 'Dólar blue', unit: '$', source: 'Bluelytics' },
    { name: 'poverty', category: 'social' as Category, description: 'Pobreza', unit: '%', source: 'INDEC' },
    { name: 'unemployment', category: 'social' as Category, description: 'Desempleo', unit: '%', source: 'INDEC' },
    { name: 'gdp', category: 'economy' as Category, description: 'PBI', unit: 'M USD', source: 'INDEC' },
    { name: 'interest_rate', category: 'economy' as Category, description: 'Tasa de interés', unit: '%', source: 'BCRA' },
    { name: 'reserves', category: 'economy' as Category, description: 'Reservas BCRA', unit: 'M USD', source: 'BCRA' },
  ];

  const filteredMetrics = selectedCategory
    ? metricsList.filter((m) => m.category === selectedCategory)
    : metricsList;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Métricas</Text>
        
        {/* Category filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <Chip
              mode={selectedCategory === item.key ? 'flat' : 'outlined'}
              selected={selectedCategory === item.key}
              onPress={() => setSelectedCategory(item.key)}
              style={[
                styles.chip,
                selectedCategory === item.key && styles.chipSelected,
              ]}
              textStyle={[
                styles.chipText,
                selectedCategory === item.key && styles.chipTextSelected,
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      {isLoadingCategories ? (
        <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredMetrics}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.metricItem}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{item.description}</Text>
                <View style={styles.metricMeta}>
                  <Text style={styles.metricSource}>{item.source}</Text>
                  <Text style={styles.metricDivider}>•</Text>
                  <Text style={styles.metricUnit}>{item.unit}</Text>
                </View>
              </View>
              <Text style={styles.metricArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0F6FC',
    marginBottom: 16,
  },
  chipContainer: {
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#161B22',
    borderColor: '#30363D',
  },
  chipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  chipText: {
    color: '#8B949E',
  },
  chipTextSelected: {
    color: '#F0F6FC',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    color: '#F0F6FC',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricSource: {
    color: '#8B949E',
    fontSize: 12,
  },
  metricDivider: {
    color: '#8B949E',
    marginHorizontal: 6,
  },
  metricUnit: {
    color: '#8B949E',
    fontSize: 12,
  },
  metricArrow: {
    color: '#6366F1',
    fontSize: 24,
    fontWeight: '300',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
