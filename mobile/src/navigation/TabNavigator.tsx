import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppCategory } from '../types';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import IndicatorScreen from '../screens/IndicatorScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Category: { categoryId: AppCategory };
  Indicator: { indicatorId: string; categoryId: AppCategory };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER_STYLE = {
  headerStyle: { backgroundColor: '#1c1c26' },
  headerShadowVisible: false,
  headerTintColor: '#f4f4f5',
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17, color: '#f4f4f5' },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ ...HEADER_STYLE, contentStyle: { backgroundColor: '#0a0a0b' } }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'ArgMetrics', headerShown: false }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          title: CATEGORY_LABELS[route.params.categoryId] ?? route.params.categoryId,
          ...HEADER_STYLE,
        })}
      />
      <Stack.Screen
        name="Indicator"
        component={IndicatorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes', ...HEADER_STYLE }}
      />
    </Stack.Navigator>
  );
}

const CATEGORY_LABELS: Record<AppCategory, string> = {
  economicas: 'Económicas',
  sociales: 'Sociales',
  laborales: 'Laborales',
  fiscales: 'Fiscales',
};
