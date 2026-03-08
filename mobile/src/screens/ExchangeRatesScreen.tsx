import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useMetricsStore } from '../store/metricsStore';

export default function ExchangeRatesScreen() {
  const { usdRates, isLoadingLive, fetchUSDRates, error } = useMetricsStore();

  useEffect(() => {
    fetchUSDRates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tipo de Cambio</Text>
      <Text style={styles.subtitle}>Actualizado en tiempo real</Text>

      {isLoadingLive && !usdRates ? (
        <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
      ) : (
        <>
          {/* Official USD */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.rateHeader}>
                <Text style={styles.rateName}>Dólar Oficial</Text>
                <Text style={styles.rateSource}>BCRA</Text>
              </View>
              <View style={styles.ratePrices}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Compra</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.official.buy.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Venta</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.official.sell.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={styles.updated}>
                Actualizado: {formatDate(usdRates?.official.updatedAt || '')}
              </Text>
            </Card.Content>
          </Card>

          {/* Blue USD */}
          <Card style={[styles.card, styles.blueCard]}>
            <Card.Content>
              <View style={styles.rateHeader}>
                <Text style={styles.rateName}>Dólar Blue</Text>
                <Text style={styles.rateSource}>Mercado Informal</Text>
              </View>
              <View style={styles.ratePrices}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Compra</Text>
                  <Text style={[styles.priceValue, styles.blueText]}>
                    ${usdRates?.blue.buy.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Venta</Text>
                  <Text style={[styles.priceValue, styles.blueText]}>
                    ${usdRates?.blue.sell.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={styles.updated}>
                Actualizado: {formatDate(usdRates?.blue.updatedAt || '')}
              </Text>
            </Card.Content>
          </Card>

          {/* MEP */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.rateHeader}>
                <Text style={styles.rateName}>Dólar MEP</Text>
                <Text style={styles.rateSource}>Rava / Ámbito</Text>
              </View>
              <View style={styles.ratePrices}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Compra</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.mep.buy.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Venta</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.mep.sell.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={styles.updated}>
                Actualizado: {formatDate(usdRates?.mep.updatedAt || '')}
              </Text>
            </Card.Content>
          </Card>

          {/* CCL */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.rateHeader}>
                <Text style={styles.rateName}>Dólar CCL</Text>
                <Text style={styles.rateSource}>Contado con Liqui</Text>
              </View>
              <View style={styles.ratePrices}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Compra</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.ccl.buy.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Venta</Text>
                  <Text style={styles.priceValue}>
                    ${usdRates?.ccl.sell.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={styles.updated}>
                Actualizado: {formatDate(usdRates?.ccl.updatedAt || '')}
              </Text>
            </Card.Content>
          </Card>

          {/* Brecha */}
          <Card style={[styles.card, styles.brechaCard]}>
            <Card.Content>
              <Text style={styles.rateName}>Brecha Cambiaria</Text>
              <Text style={styles.brechaValue}>
                {usdRates?.brecha.value.toFixed(1)}%
              </Text>
              <Text style={styles.brechaDescription}>
                Diferencia entre dólar oficial y blue
              </Text>
            </Card.Content>
          </Card>
        </>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: '#161B22',
    marginBottom: 16,
    borderRadius: 12,
  },
  blueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  brechaCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateName: {
    color: '#F0F6FC',
    fontSize: 18,
    fontWeight: '600',
  },
  rateSource: {
    color: '#8B949E',
    fontSize: 12,
  },
  ratePrices: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#8B949E',
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    color: '#F0F6FC',
    fontSize: 24,
    fontWeight: '700',
  },
  blueText: {
    color: '#22C55E',
  },
  updated: {
    color: '#8B949E',
    fontSize: 11,
    textAlign: 'center',
  },
  brechaValue: {
    color: '#F59E0B',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 8,
  },
  brechaDescription: {
    color: '#8B949E',
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
