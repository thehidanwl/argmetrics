import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainerRef } from '@react-navigation/native';
import { useNavStore } from '../store/navStore';
import { INDICATORS_BY_CATEGORY } from '../data/indicators';
import { AppCategory } from '../types';
import { RootStackParamList } from './TabNavigator';

const CATEGORIES: { id: AppCategory; label: string; icon: string }[] = [
  { id: 'economicas', label: 'Económ.', icon: 'trending-up' },
  { id: 'sociales', label: 'Sociales', icon: 'people' },
  { id: 'laborales', label: 'Laborales', icon: 'briefcase' },
  { id: 'fiscales', label: 'Fiscales', icon: 'library' },
];

interface Props {
  navRef: React.RefObject<NavigationContainerRef<RootStackParamList>>;
}

export default function CustomBottomBar({ navRef }: Props) {
  const insets = useSafeAreaInsets();
  const {
    navLevel,
    activeCategoryId,
    activeIndicatorId,
    navigateToCategory,
    navigateToIndicator,
    navigateHome,
  } = useNavStore();

  const barHeight = 60 + insets.bottom;

  function goHome() {
    navigateHome();
    navRef.current?.navigate('Home');
  }

  function goCategory(categoryId: AppCategory) {
    navigateToCategory(categoryId);
    navRef.current?.navigate('Category', { categoryId });
  }

  function goIndicator(indicatorId: string) {
    if (!activeCategoryId) return;
    navigateToIndicator(indicatorId, activeCategoryId);
    navRef.current?.navigate('Indicator', { indicatorId, categoryId: activeCategoryId });
  }

  // ─── Nivel 0: 4 categorías ───────────────────────────────────────────────
  if (navLevel === 0) {
    return (
      <View style={[styles.bar, { height: barHeight, paddingBottom: insets.bottom }]}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.tab}
            onPress={() => goCategory(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
          >
            <Icon name={cat.icon} size={22} color="#52525a" />
            <Text style={styles.tabLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ─── Nivel 1 y 2: Home + indicadores de la categoría activa ─────────────
  const categoryIndicators = activeCategoryId
    ? (INDICATORS_BY_CATEGORY[activeCategoryId] ?? []).slice(0, 3)
    : [];

  return (
    <View style={[styles.bar, { height: barHeight, paddingBottom: insets.bottom }]}>
      {/* Botón Home */}
      <TouchableOpacity
        style={styles.tab}
        onPress={goHome}
        accessibilityRole="button"
        accessibilityLabel="Inicio"
      >
        <Icon name="home" size={22} color="#818cf8" />
        <Text style={[styles.tabLabel, styles.tabLabelHome]}>Inicio</Text>
      </TouchableOpacity>

      {/* Indicadores de la categoría */}
      {categoryIndicators.map((ind) => {
        const isActive = ind.id === activeIndicatorId;
        return (
          <TouchableOpacity
            key={ind.id}
            style={styles.tab}
            onPress={() => goIndicator(ind.id)}
            accessibilityRole="button"
            accessibilityLabel={ind.label}
          >
            {isActive && <View style={[styles.activeDot, { backgroundColor: ind.color }]} />}
            <Icon
              name={ind.icon}
              size={22}
              color={isActive ? ind.color : '#52525a'}
            />
            <Text
              style={[styles.tabLabel, isActive && { color: ind.color }]}
              numberOfLines={1}
            >
              {ind.labelShort}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Relleno si hay menos de 3 indicadores */}
      {categoryIndicators.length < 3 &&
        Array.from({ length: 3 - categoryIndicators.length }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.tab} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#1c1c26',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#52525a',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelHome: {
    color: '#818cf8',
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
