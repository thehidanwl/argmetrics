import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import AppNavigator from './src/navigation/TabNavigator';
import CustomBottomBar from './src/navigation/CustomBottomBar';
import { RootStackParamList } from './src/navigation/TabNavigator';

export const navRef = createNavigationContainerRef<RootStackParamList>();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <View style={eb.c}>
          <Text style={eb.t}>ERROR DE RENDER</Text>
          <ScrollView>
            <Text style={eb.m}>{String(this.state.error)}</Text>
            <Text style={eb.s}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}
const eb = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#1c1c26', padding: 20, paddingTop: 60 },
  t: { color: '#ef4444', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  m: { color: '#f4f4f5', fontSize: 13, marginBottom: 10 },
  s: { color: '#a1a1aa', fontSize: 10 },
});

export default function App() {
  const [navReady, setNavReady] = useState(false);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0a0a0b' }}>
          <NavigationContainer ref={navRef} onReady={() => setNavReady(true)}>
            <AppNavigator />
          </NavigationContainer>
          {navReady && <CustomBottomBar navRef={navRef} />}
          <StatusBar style="light" />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
