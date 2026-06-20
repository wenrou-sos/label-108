import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import type { PriceAnomaly, AnomalySeverity, AnomalyType } from '@/types';
import {
  filterAnomaliesBySeverity,
  filterAnomaliesByType,
  groupAnomaliesByDate,
  detectAnomalies,
} from '@/utils/anomalyUtils';

export interface UseAnomalyDataOptions {
  fruitId?: string;
  marketId?: string;
  severities?: AnomalySeverity[];
  types?: AnomalyType[];
}

export const useAnomalyData = (options: UseAnomalyDataOptions = {}) => {
  const { fruitId, marketId, severities = [], types = [] } = options;
  const { anomalies, dailyPrices, filters, isLoading, error } = useDataStore();

  const filteredAnomalies = useMemo(() => {
    let result = anomalies;

    if (fruitId) {
      result = result.filter((a) => a.fruitId === fruitId);
    }
    if (marketId) {
      result = result.filter((a) => a.marketId === marketId);
    }
    if (filters.selectedFruits.length > 0) {
      result = result.filter((a) => filters.selectedFruits.includes(a.fruitId));
    }
    if (filters.selectedMarkets.length > 0) {
      result = result.filter((a) => filters.selectedMarkets.includes(a.marketId));
    }
    if (severities.length > 0) {
      result = filterAnomaliesBySeverity(result, severities);
    }
    if (types.length > 0) {
      result = filterAnomaliesByType(result, types);
    }

    result = result.filter(
      (a) => a.date >= filters.dateRange.start && a.date <= filters.dateRange.end
    );

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [anomalies, fruitId, marketId, filters, severities, types]);

  const groupedByDate = useMemo(() => {
    return groupAnomaliesByDate(filteredAnomalies);
  }, [filteredAnomalies]);

  const stats = useMemo(() => {
    const total = filteredAnomalies.length;
    const spikes = filteredAnomalies.filter((a) => a.type === 'spike').length;
    const drops = filteredAnomalies.filter((a) => a.type === 'drop').length;
    const highSeverity = filteredAnomalies.filter((a) => a.severity === 'high').length;
    const mediumSeverity = filteredAnomalies.filter((a) => a.severity === 'medium').length;
    const lowSeverity = filteredAnomalies.filter((a) => a.severity === 'low').length;

    return {
      total,
      spikes,
      drops,
      highSeverity,
      mediumSeverity,
      lowSeverity,
    };
  }, [filteredAnomalies]);

  const recentAnomalies = useMemo(() => {
    return filteredAnomalies.slice(0, 10);
  }, [filteredAnomalies]);

  const detectNewAnomalies = (
    targetFruitId: string,
    targetMarketId: string,
    sigmaThreshold: number = 3,
    changeThreshold: number = 20
  ): PriceAnomaly[] => {
    return detectAnomalies(dailyPrices, targetFruitId, targetMarketId, sigmaThreshold, changeThreshold);
  };

  return {
    anomalies: filteredAnomalies,
    groupedByDate,
    stats,
    recentAnomalies,
    isLoading,
    error,
    detectNewAnomalies,
  };
};
