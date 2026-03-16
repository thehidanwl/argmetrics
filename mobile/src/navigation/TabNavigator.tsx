import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ExchangeRatesScreen from '../screens/ExchangeRatesScreen';
import MetricsScreen from '../screens/MetricsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  MetricDetail: { metricName: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Exchange: undefined;
  Metrics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#52525a',
        tabBarStyle: {
          backgroundColor: '#1c1c26',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: '#1c1c26',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
        } as any,
        headerShadowVisible: false,
        headerTintColor: '#f4f4f5',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: '#f4f4f5',
        },
        headerLeft: () => (
          <View style={{
            width: 34, height: 34, borderRadius: 10, marginLeft: 16,
            backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>A</Text>
          </View>
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: 'ArgMetrics',
        }}
      />
      <Tab.Screen
        name="Exchange"
        component={ExchangeRatesScreen}
        options={{
          tabBarLabel: 'Cambio',
          tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" size={size} color={color} />,
          headerTitle: 'Tipo de Cambio',
        }}
      />
      <Tab.Screen
        name="Metrics"
        component={MetricsScreen}
        options={{
          tabBarLabel: 'Métricas',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
          headerTitle: 'Indicadores',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          headerTitle: 'Ajustes',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
