import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { List, Text, Divider, Switch } from 'react-native-paper';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <List.Item
          title="Modo Oscuro"
          description="Tema oscuro para la app"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          right={() => (
            <Switch value={darkMode} onValueChange={setDarkMode} color="#6366F1" />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>
        <List.Item
          title="Notificaciones"
          description="Alertas cuando hay nuevos datos"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color="#6366F1"
            />
          )}
        />
        <List.Item
          title="Auto-actualizar"
          description="Actualizar datos automáticamente"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          right={() => (
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              color="#6366F1"
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        <List.Item
          title="Versión"
          description="1.0.0"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
        />
        <List.Item
          title="Fuentes de Datos"
          description="INDEC, BCRA, Ámbito, Bluelytics"
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => {}}
        />
        <List.Item
          title="Términos y Condiciones"
          titleStyle={styles.listTitle}
          onPress={() => Linking.openURL('https://argmetrics.com/terms')}
        />
        <List.Item
          title="Política de Privacidad"
          titleStyle={styles.listTitle}
          onPress={() => Linking.openURL('https://argmetrics.com/privacy')}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>ArgMetrics © 2024</Text>
        <Text style={styles.footerText}>Datos con fines informativos</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    color: '#8B949E',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listTitle: {
    color: '#F0F6FC',
  },
  listDescription: {
    color: '#8B949E',
  },
  divider: {
    backgroundColor: '#30363D',
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#8B949E',
    fontSize: 12,
    marginBottom: 4,
  },
});
