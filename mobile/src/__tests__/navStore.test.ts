import { describe, it, expect, beforeEach } from 'vitest';
import { useNavStore } from '../store/navStore';

// Zustand stores se pueden testear directamente accediendo al estado vía getState()
const store = useNavStore;

beforeEach(() => {
  // Resetear al estado inicial antes de cada test
  store.setState({
    navLevel: 0,
    activeCategoryId: null,
    activeIndicatorId: null,
    activeChipIds: [],
    activeTemporality: 'monthly',
    isRealEnabled: false,
    chartType: 'bars',
  });
});

describe('navigateHome', () => {
  it('resetea el estado al nivel 0', () => {
    store.getState().navigateToCategory('economicas');
    store.getState().navigateHome();

    const state = store.getState();
    expect(state.navLevel).toBe(0);
    expect(state.activeCategoryId).toBeNull();
    expect(state.activeIndicatorId).toBeNull();
    expect(state.activeChipIds).toEqual([]);
  });
});

describe('navigateToCategory', () => {
  it('establece nivel 1 y la categoría activa', () => {
    store.getState().navigateToCategory('sociales');

    const state = store.getState();
    expect(state.navLevel).toBe(1);
    expect(state.activeCategoryId).toBe('sociales');
    expect(state.activeIndicatorId).toBeNull();
  });

  it('resetea temporality al navegar a categoría', () => {
    store.setState({ activeTemporality: 'interanual', isRealEnabled: true });
    store.getState().navigateToCategory('laborales');

    const state = store.getState();
    expect(state.activeTemporality).toBe('monthly');
    expect(state.isRealEnabled).toBe(false);
  });
});

describe('navigateToIndicator', () => {
  it('establece nivel 2, categoría e indicador', () => {
    store.getState().navigateToIndicator('inflacion', 'economicas');

    const state = store.getState();
    expect(state.navLevel).toBe(2);
    expect(state.activeCategoryId).toBe('economicas');
    expect(state.activeIndicatorId).toBe('inflacion');
  });
});

describe('toggleChip', () => {
  it('agrega un chip si no estaba activo', () => {
    store.setState({ activeChipIds: ['chip_a'] });
    store.getState().toggleChip('chip_b');
    expect(store.getState().activeChipIds).toContain('chip_b');
  });

  it('elimina un chip si estaba activo', () => {
    store.setState({ activeChipIds: ['chip_a', 'chip_b'] });
    store.getState().toggleChip('chip_a');
    expect(store.getState().activeChipIds).not.toContain('chip_a');
    expect(store.getState().activeChipIds).toContain('chip_b');
  });

  it('no puede deseleccionar el último chip activo', () => {
    store.setState({ activeChipIds: ['chip_a'] });
    store.getState().toggleChip('chip_a');
    // Debe quedar 'chip_a' todavía
    expect(store.getState().activeChipIds).toEqual(['chip_a']);
  });
});

describe('setTemporality', () => {
  it('cambia el modo de temporalidad', () => {
    store.getState().setTemporality('interanual');
    expect(store.getState().activeTemporality).toBe('interanual');
  });
});

describe('toggleReal', () => {
  it('alterna isRealEnabled', () => {
    expect(store.getState().isRealEnabled).toBe(false);
    store.getState().toggleReal();
    expect(store.getState().isRealEnabled).toBe(true);
    store.getState().toggleReal();
    expect(store.getState().isRealEnabled).toBe(false);
  });
});

describe('setChartType', () => {
  it('cambia el tipo de gráfico', () => {
    store.getState().setChartType('line');
    expect(store.getState().chartType).toBe('line');
    store.getState().setChartType('bars');
    expect(store.getState().chartType).toBe('bars');
  });
});

describe('setActiveChips', () => {
  it('reemplaza la lista completa de chips activos', () => {
    store.setState({ activeChipIds: ['old_chip'] });
    store.getState().setActiveChips(['chip_1', 'chip_2']);
    expect(store.getState().activeChipIds).toEqual(['chip_1', 'chip_2']);
  });
});
