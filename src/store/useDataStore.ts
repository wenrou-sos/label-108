import { create } from 'zustand';
import type {
  Fruit,
  Market,
  DailyPrice,
  PriceAnomaly,
  WeatherEvent,
  FilterState,
  TimePeriod,
} from '@/types';
import { loadFruits, loadMarkets, loadDailyPrices, loadAnomalies, loadWeatherEvents } from '@/utils/csvLoader';

interface DataStoreState {
  fruits: Fruit[];
  markets: Market[];
  dailyPrices: DailyPrice[];
  anomalies: PriceAnomaly[];
  weatherEvents: WeatherEvent[];
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
  loadAllData: () => Promise<void>;
  setSelectedFruits: (fruitIds: string[]) => void;
  setSelectedMarkets: (marketIds: string[]) => void;
  setDateRange: (start: string, end: string) => void;
  setTimePeriod: (period: TimePeriod) => void;
  resetFilters: () => void;
}

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const defaultFilters: FilterState = {
  selectedFruits: [],
  selectedMarkets: [],
  dateRange: getDefaultDateRange(),
  timePeriod: '30d',
};

export const useDataStore = create<DataStoreState>((set) => ({
  fruits: [],
  markets: [],
  dailyPrices: [],
  anomalies: [],
  weatherEvents: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,

  loadAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [fruits, markets, dailyPrices, anomalies, weatherEvents] = await Promise.all([
        loadFruits(),
        loadMarkets(),
        loadDailyPrices(),
        loadAnomalies(),
        loadWeatherEvents(),
      ]);
      set({
        fruits,
        markets,
        dailyPrices,
        anomalies,
        weatherEvents,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '数据加载失败',
      });
    }
  },

  setSelectedFruits: (fruitIds) =>
    set((state) => ({
      filters: { ...state.filters, selectedFruits: fruitIds },
    })),

  setSelectedMarkets: (marketIds) =>
    set((state) => ({
      filters: { ...state.filters, selectedMarkets: marketIds },
    })),

  setDateRange: (start, end) =>
    set((state) => ({
      filters: { ...state.filters, dateRange: { start, end } },
    })),

  setTimePeriod: (period) => {
    const end = new Date();
    const start = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);
    set((state) => ({
      filters: {
        ...state.filters,
        timePeriod: period,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    }));
  },

  resetFilters: () =>
    set({
      filters: {
        ...defaultFilters,
        dateRange: getDefaultDateRange(),
      },
    }),
}));
