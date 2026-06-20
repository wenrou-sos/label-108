import type { DailyPrice, MAData, PercentileData, PriceChange } from '@/types';

export const calculatePriceChange = (
  prices: DailyPrice[],
  fruitId: string,
  marketId: string
): PriceChange | null => {
  const filtered = prices
    .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length < 2) return null;

  const current = filtered[filtered.length - 1];
  const previous = filtered[filtered.length - 2];
  const changeValue = current.avgPrice - previous.avgPrice;
  const changePercent = previous.avgPrice === 0 ? 0 : (changeValue / previous.avgPrice) * 100;

  return {
    fruitId,
    marketId,
    changePercent,
    changeValue,
    currentPrice: current.avgPrice,
    previousPrice: previous.avgPrice,
  };
};

export const calculatePeriodChange = (
  prices: DailyPrice[],
  fruitId: string,
  marketId: string,
  days: number = 7
): PriceChange | null => {
  const filtered = prices
    .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length < days) return null;

  const current = filtered[filtered.length - 1];
  const previous = filtered[filtered.length - days];
  const changeValue = current.avgPrice - previous.avgPrice;
  const changePercent = previous.avgPrice === 0 ? 0 : (changeValue / previous.avgPrice) * 100;

  return {
    fruitId,
    marketId,
    changePercent,
    changeValue,
    currentPrice: current.avgPrice,
    previousPrice: previous.avgPrice,
  };
};

export const calculateMA = (
  prices: DailyPrice[],
  fruitId: string,
  marketId: string,
  period: number = 5
): MAData[] => {
  const filtered = prices
    .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const result: MAData[] = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i < period - 1) continue;

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += filtered[j].avgPrice;
    }
    result.push({
      date: filtered[i].date,
      value: sum / period,
      period,
    });
  }

  return result;
};

export const calculatePercentile = (
  prices: DailyPrice[],
  fruitId: string,
  marketId: string
): PercentileData | null => {
  const filtered = prices
    .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) return null;

  const currentPrice = filtered[filtered.length - 1].avgPrice;
  const allPrices = filtered.map((p) => p.avgPrice).sort((a, b) => a - b);
  const minPrice = allPrices[0];
  const maxPrice = allPrices[allPrices.length - 1];
  const medianPrice =
    allPrices.length % 2 === 0
      ? (allPrices[allPrices.length / 2 - 1] + allPrices[allPrices.length / 2]) / 2
      : allPrices[Math.floor(allPrices.length / 2)];

  let count = 0;
  for (const p of allPrices) {
    if (p <= currentPrice) count++;
  }
  const percentile = (count / allPrices.length) * 100;

  return {
    currentPrice,
    percentile,
    minPrice,
    maxPrice,
    medianPrice,
  };
};

export const getTopGainers = (
  prices: DailyPrice[],
  limit: number = 5
): (PriceChange & { rank: number })[] => {
  const fruitMarketPairs = new Map<string, { fruitId: string; marketId: string }>();
  prices.forEach((p) => {
    const key = `${p.fruitId}-${p.marketId}`;
    fruitMarketPairs.set(key, { fruitId: p.fruitId, marketId: p.marketId });
  });

  const changes: PriceChange[] = [];
  fruitMarketPairs.forEach(({ fruitId, marketId }) => {
    const change = calculatePriceChange(prices, fruitId, marketId);
    if (change) changes.push(change);
  });

  return changes
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));
};

export const getTopLosers = (
  prices: DailyPrice[],
  limit: number = 5
): (PriceChange & { rank: number })[] => {
  const fruitMarketPairs = new Map<string, { fruitId: string; marketId: string }>();
  prices.forEach((p) => {
    const key = `${p.fruitId}-${p.marketId}`;
    fruitMarketPairs.set(key, { fruitId: p.fruitId, marketId: p.marketId });
  });

  const changes: PriceChange[] = [];
  fruitMarketPairs.forEach(({ fruitId, marketId }) => {
    const change = calculatePriceChange(prices, fruitId, marketId);
    if (change) changes.push(change);
  });

  return changes
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));
};

export const filterPricesByDateRange = (
  prices: DailyPrice[],
  startDate: string,
  endDate: string
): DailyPrice[] => {
  return prices.filter((p) => p.date >= startDate && p.date <= endDate);
};

export const filterPricesByFruits = (
  prices: DailyPrice[],
  fruitIds: string[]
): DailyPrice[] => {
  if (fruitIds.length === 0) return prices;
  return prices.filter((p) => fruitIds.includes(p.fruitId));
};

export const filterPricesByMarkets = (
  prices: DailyPrice[],
  marketIds: string[]
): DailyPrice[] => {
  if (marketIds.length === 0) return prices;
  return prices.filter((p) => marketIds.includes(p.marketId));
};
