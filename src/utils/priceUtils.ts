import type { DailyPrice, MAData, PercentileData, PriceChange } from '@/types';

export interface CorrelationResult {
  fruitIdA: string;
  fruitIdB: string;
  correlation: number;
  sampleSize: number;
}

export interface CorrelationMatrix {
  fruitIds: string[];
  matrix: (CorrelationResult | null)[][];
}

export const alignPriceSeries = (
  pricesA: DailyPrice[],
  pricesB: DailyPrice[]
): { valuesA: number[]; valuesB: number[]; sampleSize: number } => {
  const priceMapA = new Map<string, number>();
  const priceMapB = new Map<string, number>();

  pricesA.forEach((p) => priceMapA.set(p.date, p.avgPrice));
  pricesB.forEach((p) => priceMapB.set(p.date, p.avgPrice));

  const allDates = new Set<string>();
  priceMapA.forEach((_, date) => allDates.add(date));
  priceMapB.forEach((_, date) => allDates.add(date));

  const sortedDates = Array.from(allDates).sort();
  const valuesA: number[] = [];
  const valuesB: number[] = [];

  sortedDates.forEach((date) => {
    const vA = priceMapA.get(date);
    const vB = priceMapB.get(date);
    if (vA !== undefined && vB !== undefined) {
      valuesA.push(vA);
      valuesB.push(vB);
    }
  });

  return { valuesA, valuesB, sampleSize: valuesA.length };
};

export const calculatePearsonCorrelation = (
  x: number[],
  y: number[]
): number => {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
};

export const calculateFruitCorrelation = (
  prices: DailyPrice[],
  fruitIdA: string,
  fruitIdB: string,
  marketIds?: string[]
): CorrelationResult => {
  let pricesA = prices.filter((p) => p.fruitId === fruitIdA);
  let pricesB = prices.filter((p) => p.fruitId === fruitIdB);

  const avgByDate = (priceList: DailyPrice[]): DailyPrice[] => {
    const map = new Map<string, { total: number; count: number; date: string; fruitId: string; marketId: string; highPrice: number; lowPrice: number; openPrice: number; closePrice: number; volume: number }>();
    priceList.forEach((p) => {
      const existing = map.get(p.date);
      if (existing) {
        existing.total += p.avgPrice;
        existing.count += 1;
        existing.highPrice = Math.max(existing.highPrice, p.highPrice);
        existing.lowPrice = Math.min(existing.lowPrice, p.lowPrice);
        existing.volume += p.volume;
      } else {
        map.set(p.date, {
          total: p.avgPrice,
          count: 1,
          date: p.date,
          fruitId: p.fruitId,
          marketId: 'avg',
          highPrice: p.highPrice,
          lowPrice: p.lowPrice,
          openPrice: p.openPrice,
          closePrice: p.closePrice,
          volume: p.volume,
        });
      }
    });
    return Array.from(map.values()).map((e) => ({
      date: e.date,
      fruitId: e.fruitId,
      marketId: e.marketId,
      avgPrice: e.total / e.count,
      highPrice: e.highPrice,
      lowPrice: e.lowPrice,
      openPrice: e.openPrice,
      closePrice: e.closePrice,
      volume: e.volume,
    }));
  };

  if (marketIds && marketIds.length > 0) {
    pricesA = pricesA.filter((p) => marketIds.includes(p.marketId));
    pricesB = pricesB.filter((p) => marketIds.includes(p.marketId));
    if (marketIds.length > 1) {
      pricesA = avgByDate(pricesA);
      pricesB = avgByDate(pricesB);
    }
  } else {
    pricesA = avgByDate(pricesA);
    pricesB = avgByDate(pricesB);
  }

  pricesA.sort((a, b) => a.date.localeCompare(b.date));
  pricesB.sort((a, b) => a.date.localeCompare(b.date));

  const { valuesA, valuesB, sampleSize } = alignPriceSeries(pricesA, pricesB);

  return {
    fruitIdA,
    fruitIdB,
    correlation: calculatePearsonCorrelation(valuesA, valuesB),
    sampleSize,
  };
};

export const buildCorrelationMatrix = (
  prices: DailyPrice[],
  fruitIds: string[],
  marketIds?: string[]
): CorrelationMatrix => {
  const n = fruitIds.length;
  const matrix: (CorrelationResult | null)[][] = Array.from({ length: n }, () =>
    Array(n).fill(null)
  );

  const getDiagonalSampleSize = (fruitId: string): number => {
    let filtered = prices.filter((p) => p.fruitId === fruitId);
    if (marketIds && marketIds.length > 0) {
      filtered = filtered.filter((p) => marketIds.includes(p.marketId));
    }
    if (marketIds && marketIds.length > 1) {
      const uniqueDates = new Set(filtered.map((p) => p.date));
      return uniqueDates.size;
    }
    return filtered.length;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = {
          fruitIdA: fruitIds[i],
          fruitIdB: fruitIds[j],
          correlation: 1,
          sampleSize: getDiagonalSampleSize(fruitIds[i]),
        };
      } else {
        const result = calculateFruitCorrelation(prices, fruitIds[i], fruitIds[j], marketIds);
        matrix[i][j] = result;
        matrix[j][i] = { ...result, fruitIdA: fruitIds[j], fruitIdB: fruitIds[i] };
      }
    }
  }

  return { fruitIds, matrix };
};

export const getTopCorrelatedFruits = (
  prices: DailyPrice[],
  targetFruitId: string,
  allFruitIds: string[],
  marketIds?: string[],
  limit: number = 3
): { positive: CorrelationResult[]; negative: CorrelationResult[] } => {
  const otherFruitIds = allFruitIds.filter((id) => id !== targetFruitId);
  const validResults: CorrelationResult[] = [];

  otherFruitIds.forEach((id) => {
    const result = calculateFruitCorrelation(prices, targetFruitId, id, marketIds);
    if (result.sampleSize >= 3) {
      validResults.push(result);
    }
  });

  const positive = [...validResults]
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);

  const negative = [...validResults]
    .filter((r) => r.correlation < 0)
    .sort((a, b) => a.correlation - b.correlation)
    .slice(0, limit);

  return { positive, negative };
};

export const filterPricesByDays = (
  prices: DailyPrice[],
  days: number
): DailyPrice[] => {
  if (prices.length === 0) return [];
  const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const latestDate = sorted[sorted.length - 1].date;
  const endDate = new Date(latestDate);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days + 1);
  const startStr = startDate.toISOString().split('T')[0];
  return sorted.filter((p) => p.date >= startStr);
};

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
