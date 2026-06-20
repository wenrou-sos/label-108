import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import type { TimePeriod } from '@/types';

export const useFilters = () => {
  const {
    filters,
    fruits,
    markets,
    setSelectedFruits,
    setSelectedMarkets,
    setDateRange,
    setTimePeriod,
    resetFilters,
  } = useDataStore();

  const fruitOptions = useMemo(() => {
    return fruits.map((f) => ({
      value: f.id,
      label: f.name,
      category: f.category,
      isImported: f.isImported,
    }));
  }, [fruits]);

  const marketOptions = useMemo(() => {
    return markets.map((m) => ({
      value: m.id,
      label: m.name,
      city: m.city,
      province: m.province,
    }));
  }, [markets]);

  const timePeriodOptions: { value: TimePeriod; label: string; days: number }[] = [
    { value: '7d', label: '近7天', days: 7 },
    { value: '30d', label: '近30天', days: 30 },
    { value: '90d', label: '近90天', days: 90 },
  ];

  const toggleFruit = (fruitId: string) => {
    const newSelected = filters.selectedFruits.includes(fruitId)
      ? filters.selectedFruits.filter((id) => id !== fruitId)
      : [...filters.selectedFruits, fruitId];
    setSelectedFruits(newSelected);
  };

  const toggleMarket = (marketId: string) => {
    const newSelected = filters.selectedMarkets.includes(marketId)
      ? filters.selectedMarkets.filter((id) => id !== marketId)
      : [...filters.selectedMarkets, marketId];
    setSelectedMarkets(newSelected);
  };

  const selectAllFruits = () => {
    setSelectedFruits(fruits.map((f) => f.id));
  };

  const selectAllMarkets = () => {
    setSelectedMarkets(markets.map((m) => m.id));
  };

  const clearFruits = () => {
    setSelectedFruits([]);
  };

  const clearMarkets = () => {
    setSelectedMarkets([]);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.selectedFruits.length > 0 ||
      filters.selectedMarkets.length > 0 ||
      filters.timePeriod !== '30d'
    );
  }, [filters]);

  const selectedFruitNames = useMemo(() => {
    return filters.selectedFruits
      .map((id) => fruits.find((f) => f.id === id)?.name)
      .filter(Boolean) as string[];
  }, [filters.selectedFruits, fruits]);

  const selectedMarketNames = useMemo(() => {
    return filters.selectedMarkets
      .map((id) => markets.find((m) => m.id === id)?.name)
      .filter(Boolean) as string[];
  }, [filters.selectedMarkets, markets]);

  return {
    filters,
    fruitOptions,
    marketOptions,
    timePeriodOptions,
    selectedFruitNames,
    selectedMarketNames,
    hasActiveFilters,
    setSelectedFruits,
    setSelectedMarkets,
    setDateRange,
    setTimePeriod,
    toggleFruit,
    toggleMarket,
    selectAllFruits,
    selectAllMarkets,
    clearFruits,
    clearMarkets,
    resetFilters,
  };
};
