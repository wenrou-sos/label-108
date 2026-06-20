import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import type { WeatherEvent, WeatherSeverity, WeatherType } from '@/types';

export interface UseWeatherDataOptions {
  fruitId?: string;
  region?: string;
  severities?: WeatherSeverity[];
  types?: WeatherType[];
}

export const useWeatherData = (options: UseWeatherDataOptions = {}) => {
  const { fruitId, region, severities = [], types = [] } = options;
  const { weatherEvents, dailyPrices, filters, isLoading, error, fruits } = useDataStore();

  const filteredEvents = useMemo(() => {
    let result = weatherEvents;

    if (fruitId) {
      result = result.filter((e) => e.affectedFruits.includes(fruitId));
    }
    if (region) {
      result = result.filter((e) => e.region === region);
    }
    if (filters.selectedFruits.length > 0) {
      result = result.filter((e) =>
        e.affectedFruits.some((f) => filters.selectedFruits.includes(f))
      );
    }
    if (severities.length > 0) {
      result = result.filter((e) => severities.includes(e.severity));
    }
    if (types.length > 0) {
      result = result.filter((e) => types.includes(e.type));
    }

    result = result.filter(
      (e) => e.date >= filters.dateRange.start && e.date <= filters.dateRange.end
    );

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [weatherEvents, fruitId, region, filters, severities, types]);

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const byType: Record<WeatherType, number> = {
      frost: 0,
      hail: 0,
      typhoon: 0,
      rain: 0,
      drought: 0,
      heatwave: 0,
    };
    const bySeverity: Record<WeatherSeverity, number> = {
      light: 0,
      moderate: 0,
      severe: 0,
    };

    filteredEvents.forEach((e) => {
      byType[e.type]++;
      bySeverity[e.severity]++;
    });

    return {
      total,
      byType,
      bySeverity,
    };
  }, [filteredEvents]);

  const recentEvents = useMemo(() => {
    return filteredEvents.slice(0, 10);
  }, [filteredEvents]);

  const getAffectedFruits = (event: WeatherEvent) => {
    return fruits.filter((f) => event.affectedFruits.includes(f.id));
  };

  const getWeatherImpactOnPrice = (
    event: WeatherEvent,
    targetFruitId: string,
    targetMarketId: string
  ): { before: number; after: number; changePercent: number } | null => {
    if (!event.affectedFruits.includes(targetFruitId)) return null;

    const eventDate = new Date(event.date);
    const beforeStart = new Date(eventDate);
    beforeStart.setDate(beforeStart.getDate() - 7);
    const afterEnd = new Date(eventDate);
    afterEnd.setDate(afterEnd.getDate() + event.impactDays);

    const format = (d: Date) => d.toISOString().split('T')[0];

    const beforePrices = dailyPrices.filter(
      (p) =>
        p.fruitId === targetFruitId &&
        p.marketId === targetMarketId &&
        p.date >= format(beforeStart) &&
        p.date < format(eventDate)
    );

    const afterPrices = dailyPrices.filter(
      (p) =>
        p.fruitId === targetFruitId &&
        p.marketId === targetMarketId &&
        p.date >= format(eventDate) &&
        p.date <= format(afterEnd)
    );

    if (beforePrices.length === 0 || afterPrices.length === 0) return null;

    const beforeAvg = beforePrices.reduce((sum, p) => sum + p.avgPrice, 0) / beforePrices.length;
    const afterAvg = afterPrices.reduce((sum, p) => sum + p.avgPrice, 0) / afterPrices.length;
    const changePercent = beforeAvg === 0 ? 0 : ((afterAvg - beforeAvg) / beforeAvg) * 100;

    return {
      before: beforeAvg,
      after: afterAvg,
      changePercent,
    };
  };

  return {
    events: filteredEvents,
    stats,
    recentEvents,
    isLoading,
    error,
    getAffectedFruits,
    getWeatherImpactOnPrice,
  };
};
