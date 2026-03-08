import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useMetricsStore } from '../store/metricsStore';

export default function DashboardScreen() {
  const {
    usdRates,
    countryRisk,
    isLoadingLive,
    fetchUSDRates,
    fetchCountryRisk,
    error,
  } = useMetricsStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchUSDRates();
    fetchCountryRisk();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUSDRates(), fetchCountryRisk()]);
    setRefreshing(false);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
      }
    >
      <Text style={styles.sectionTitle}>Economía Argentina</Text>

      {/* USD Rates Card */}
      <Card style={styles.card}>
        <Card.Title title="Dólar" titleStyle={styles.cardTitle} />
        <Card.Content>
          {isLoadingLive && !usdRates ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <View style={styles.ratesContainer}>
              <View style={styles.rateItem}>
                <Text style={styles.rateLabel}>Oficial</Text>
                <Text style={styles.rateValue}>
                  ${usdRates?.official.sell.toFixed(2)}
                </Text>
              </View>
              <View style={styles.rateItem}>
                <Text style={styles.rateLabel}>Blue</Text>
                <Text style={[styles.rateValue, styles.blueValue]}>
                  ${usdRates?.blue.sell.toFixed(2)}
                </Text>
              </View>
              <View style={styles.rateItem}>
                <Text style={styles.rateLabel}>MEP</Text>
                <Text style={styles.rateValue}>
                  ${usdRates?.mep.sell.toFixed(2)}
                </Text>
              </View>
              <View style={styles.rateItem}>
                <Text style={styles.rateLabel}>CCL</Text>
                <Text style={styles.rateValue}>
                  ${usdRates?.ccl.sell.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Country Risk Card */}
      <Card style={styles.card}>
        <Card.Title title="Riesgo País" titleStyle={styles.cardTitle} />
        <Card.Content>
          {isLoadingLive && !countryRisk ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <View style={styles.riskContainer}>
              <Text style={styles.riskValue}>
                {countryRisk?.value.toLocaleString()} pts
              </Text>
              <Text
                style={[
                  styles.riskVariation,
                  (countryRisk?.variation || 0) < 0
                    ? styles.positiveVariation
                    : styles.negativeVariation,
                ]}
              >
                {(countryRisk?.variation || 0) > 0 ? '+' : ''}
                {countryRisk?.variation} pts
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <Text style={styles.sectionTitle}>Categorías</Text>
      <View style={styles.categoriesGrid}>
        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text style={styles.categoryTitle}>Economía</Text>
            <Text style={styles.categoryCount}>12 métricas</Text>
          </Card.Content>
        </Card>
        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text style={styles.categoryTitle}>Social</Text>
            <Text style={styles.categoryCount}>5 métricas</Text>
          </Card.Content>
        </Card>
        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text style={styles.categoryTitle}>Consumo</Text>
            <Text style={styles.categoryCount}>4 métricas</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F6FC',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#161B22',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F0F6FC',
    fontSize: 16,
    fontWeight: '600',
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateItem: {
    alignItems: 'center',
  },
  rateLabel: {
    color: '#8B949E',
    fontSize: 12,
    marginBottom: 4,
  },
  rateValue: {
    color: '#F0F6FC',
    fontSize: 16,
    fontWeight: '600',
  },
  blueValue: {
    color: '#22C55E',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskValue: {
    color: '#F0F6FC',
    fontSize: 32,
    fontWeight: '700',
  },
  riskVariation: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  positiveVariation: {
    color: '#EF4444',
  },
  negativeVariation: {
    color: '#22C55E',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#161B22',
    marginBottom: 12,
    borderRadius: 12,
  },
  categoryTitle: {
    color: '#F0F6FC',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCount: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
