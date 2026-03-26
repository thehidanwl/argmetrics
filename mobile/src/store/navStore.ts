import { create } from 'zustand';
import { AppCategory, TemporalityMode } from '../types';

interface NavState {
  navLevel: 0 | 1 | 2;
  activeCategoryId: AppCategory | null;
  activeIndicatorId: string | null;
  activeChipIds: string[];
  activeTemporality: TemporalityMode;
  isRealEnabled: boolean;

  chartType: 'bars' | 'line';

  setNavLevel: (level: 0 | 1 | 2) => void;
  setActiveCategory: (categoryId: AppCategory | null) => void;
  setActiveIndicator: (indicatorId: string | null) => void;
  setActiveChips: (chipIds: string[]) => void;
  toggleChip: (chipId: string) => void;
  setTemporality: (mode: TemporalityMode) => void;
  toggleReal: () => void;
  setChartType: (type: 'bars' | 'line') => void;
  navigateToCategory: (categoryId: AppCategory) => void;
  navigateToIndicator: (indicatorId: string, categoryId: AppCategory) => void;
  navigateHome: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  navLevel: 0,
  activeCategoryId: null,
  activeIndicatorId: null,
  activeChipIds: [],
  activeTemporality: 'monthly',
  isRealEnabled: false,
  chartType: 'bars',

  setNavLevel: (level) => set({ navLevel: level }),
  setActiveCategory: (categoryId) => set({ activeCategoryId: categoryId }),
  setActiveIndicator: (indicatorId) => set({ activeIndicatorId: indicatorId }),
  setActiveChips: (chipIds) => set({ activeChipIds: chipIds }),

  toggleChip: (chipId) => {
    const { activeChipIds } = get();
    if (activeChipIds.includes(chipId)) {
      // No deseleccionar si es el último activo
      if (activeChipIds.length === 1) return;
      set({ activeChipIds: activeChipIds.filter((id) => id !== chipId) });
    } else {
      set({ activeChipIds: [...activeChipIds, chipId] });
    }
  },

  setTemporality: (mode) => set({ activeTemporality: mode }),
  toggleReal: () => set((s) => ({ isRealEnabled: !s.isRealEnabled })),
  setChartType: (type) => set({ chartType: type }),

  navigateToCategory: (categoryId) => {
    set({
      navLevel: 1,
      activeCategoryId: categoryId,
      activeIndicatorId: null,
      activeChipIds: [],
      activeTemporality: 'monthly',
      isRealEnabled: false,
    });
  },

  navigateToIndicator: (indicatorId, categoryId) => {
    set({
      navLevel: 2,
      activeCategoryId: categoryId,
      activeIndicatorId: indicatorId,
      activeTemporality: 'monthly',
      isRealEnabled: false,
    });
  },

  navigateHome: () => {
    set({
      navLevel: 0,
      activeCategoryId: null,
      activeIndicatorId: null,
      activeChipIds: [],
    });
  },
}));
