import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import type { DailyPrice, PriceChange, MAData, PercentileData } from '@/types';
import {
  calculatePriceChange,
  calculatePeriodChange,
  calculateMA,
  calculatePercentile,
  getTopGainers,
  getTopLosers,
  filterPricesByDateRange,
  filterPricesByFruits,
  filterPricesByMarkets,
} from '@/utils/priceUtils';

export interface UsePriceDataOptions {
  fruitId?: string;
  marketId?: string;
  maPeriods?: number[];
}

export const usePriceData = (options: UsePriceDataOptions = {}) => {
  const { fruitId, marketId, maPeriods = [5, 10, 20] } = options;
  const { dailyPrices, filters, isLoading, error } = useDataStore();

  const filteredPrices = useMemo(() => {
    let prices = dailyPrices;
    if (filters.selectedFruits.length > 0) {
      prices = filterPricesByFruits(prices, filters.selectedFruits);
    }
    if (filters.selectedMarkets.length > 0) {
      prices = filterPricesByMarkets(prices, filters.selectedMarkets);
    }
    prices = filterPricesByDateRange(prices, filters.dateRange.start, filters.dateRange.end);
    return prices;
  }, [dailyPrices, filters]);

  const singleSeriesPrices = useMemo(() => {
    if (!fruitId || !marketId) return [];
    return filteredPrices
      .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPrices, fruitId, marketId]);

  const priceChange = useMemo((): PriceChange | null => {
    if (!fruitId || !marketId) return null;
    return calculatePriceChange(dailyPrices, fruitId, marketId);
  }, [dailyPrices, fruitId, marketId]);

  const periodChange = useMemo((): PriceChange | null => {
    if (!fruitId || !marketId) return null;
    const days = filters.timePeriod === '7d' ? 7 : filters.timePeriod === '30d' ? 30 : 90;
    return calculatePeriodChange(dailyPrices, fruitId, marketId, days);
  }, [dailyPrices, fruitId, marketId, filters.timePeriod]);

  const maData = useMemo((): Record<number, MAData[]> => {
    if (!fruitId || !marketId) return {};
    const result: Record<number, MAData[]> = {};
    maPeriods.forEach((period) => {
      result[period] = calculateMA(dailyPrices, fruitId, marketId, period);
    });
    return result;
  }, [dailyPrices, fruitId, marketId, maPeriods]);

  const percentile = useMemo((): PercentileData | null => {
    if (!fruitId || !marketId) return null;
    return calculatePercentile(dailyPrices, fruitId, marketId);
  }, [dailyPrices, fruitId, marketId]);

  const topGainers = useMemo(() => {
    return getTopGainers(filteredPrices, 5);
  }, [filteredPrices]);

  const topLosers = useMemo(() => {
    return getTopLosers(filteredPrices, 5);
  }, [filteredPrices]);

  const getPricesForFruitMarket = (
    targetFruitId: string,
    targetMarketId: string
  ): DailyPrice[] => {
    return filteredPrices
      .filter((p) => p.fruitId === targetFruitId && p.marketId === targetMarketId)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getLatestPrice = (
    targetFruitId: string,
    targetMarketId: string
  ): DailyPrice | null => {
    const prices = getPricesForFruitMarket(targetFruitId, targetMarketId);
    return prices.length > 0 ? prices[prices.length - 1] : null;
  };

  return {
    prices: filteredPrices,
    singleSeriesPrices,
    priceChange,
    periodChange,
    maData,
    percentile,
    topGainers,
    topLosers,
    isLoading,
    error,
    getPricesForFruitMarket,
    getLatestPrice,
  };
};
