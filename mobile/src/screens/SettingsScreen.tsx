import React, { useState } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AlertItem { id: number; name: string; enabled: boolean; }

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode]     = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [wifiOnly, setWifiOnly]     = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, name: 'Dólar oficial > $1,500', enabled: true },
    { id: 2, name: 'Dólar blue > $1,600',   enabled: false },
    { id: 3, name: 'Inflación mensual > 5%', enabled: false },
    { id: 4, name: 'Riesgo país > 2,000 pts',enabled: false },
  ]);

  const toggleAlert = (id: number) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));

  const SectionHead = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
    <View style={st.sectionHead}>
      <Ionicons name={icon} size={13} color="#818cf8" />
      <Text style={st.sectionHeadText}>{label}</Text>
    </View>
  );

  const RowDivider = () => <View style={st.divider} />;

  const SettingRow = ({
    label, value, onToggle, isSwitch = true,
    onPress, rightText,
  }: {
    label: string; value?: boolean; onToggle?: () => void;
    isSwitch?: boolean; onPress?: () => void; rightText?: string;
  }) => (
    <TouchableOpacity
      style={st.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !onToggle}
    >
      <Text style={st.rowLabel}>{label}</Text>
      {isSwitch && onToggle != null ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(255,255,255,0.12)', true: '#4f46e5' }}
          thumbColor="white"
          ios_backgroundColor="rgba(255,255,255,0.12)"
        />
      ) : rightText ? (
        <Text style={st.rowRight}>{rightText}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#71717a" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={[st.content, { paddingBottom: 24 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Alerts */}
      <SectionHead icon="notifications-outline" label="Alertas" />
      <View style={st.card}>
        {alerts.map((alert, idx) => (
          <View key={alert.id}>
            <View style={st.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <Ionicons name="warning-outline" size={14} color="#f59e0b" />
                <Text style={[st.rowLabel, { flex: 1 }]}>{alert.name}</Text>
              </View>
              <Switch
                value={alert.enabled}
                onValueChange={() => toggleAlert(alert.id)}
                trackColor={{ false: 'rgba(255,255,255,0.12)', true: '#4f46e5' }}
                thumbColor="white"
                ios_backgroundColor="rgba(255,255,255,0.12)"
              />
            </View>
            {idx < alerts.length - 1 && <RowDivider />}
          </View>
        ))}
      </View>

      {/* Appearance */}
      <SectionHead icon="moon-outline" label="Apariencia" />
      <View style={st.card}>
        <SettingRow label="Modo oscuro" value={darkMode} onToggle={() => setDarkMode(p => !p)} />
        <RowDivider />
        <SettingRow label="Moneda preferida" isSwitch={false} rightText="USD" />
      </View>

      {/* Data */}
      <SectionHead icon="refresh-outline" label="Datos" />
      <View style={st.card}>
        <SettingRow label="Auto-actualizar" value={autoRefresh} onToggle={() => setAutoRefresh(p => !p)} />
        <RowDivider />
        <SettingRow label="Solo WiFi" value={wifiOnly} onToggle={() => setWifiOnly(p => !p)} />
      </View>

      {/* About */}
      <SectionHead icon="information-circle-outline" label="Acerca de" />
      <View style={st.card}>
        <SettingRow label="Versión" isSwitch={false} rightText="1.0.0" />
        <RowDivider />
        <SettingRow label="Fuentes de datos" isSwitch={false} rightText="INDEC · BCRA" />
        <RowDivider />
        <SettingRow label="Términos y Condiciones" isSwitch={false} onPress={() => Linking.openURL('https://argmetrics.com/terms')} />
        <RowDivider />
        <SettingRow label="Política de Privacidad" isSwitch={false} onPress={() => Linking.openURL('https://argmetrics.com/privacy')} />
      </View>

      <View style={st.footer}>
        <Text style={st.footerText}>ArgMetrics © 2026</Text>
        <Text style={st.footerText}>Datos con fines informativos únicamente</Text>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c26' },
  content:   { padding: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8, marginTop: 8 },
  sectionHeadText: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#71717a', textTransform: 'uppercase' },
  card: { backgroundColor: '#23232f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  row:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 14, color: '#f4f4f5', fontWeight: '500' },
  rowRight: { fontSize: 12, color: '#71717a' },
  divider:  { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  footer:   { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 11, color: '#52525b', marginBottom: 3 },
});
