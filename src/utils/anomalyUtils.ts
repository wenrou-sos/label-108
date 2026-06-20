import type { DailyPrice, PriceAnomaly, AnomalySeverity, AnomalyType } from '@/types';

export const detectAnomalies = (
  prices: DailyPrice[],
  fruitId: string,
  marketId: string,
  sigmaThreshold: number = 3,
  changeThreshold: number = 20
): PriceAnomaly[] => {
  const filtered = prices
    .filter((p) => p.fruitId === fruitId && p.marketId === marketId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length < 30) return [];

  const anomalies: PriceAnomaly[] = [];
  const windowSize = 30;

  for (let i = windowSize; i < filtered.length; i++) {
    const current = filtered[i];
    const window = filtered.slice(i - windowSize, i);
    const avgPrices = window.map((p) => p.avgPrice);
    const mean = avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length;
    const variance =
      avgPrices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / avgPrices.length;
    const stdDev = Math.sqrt(variance);

    const previous = filtered[i - 1];
    const changePercent =
      previous.avgPrice === 0 ? 0 : ((current.avgPrice - previous.avgPrice) / previous.avgPrice) * 100;

    const zScore = stdDev === 0 ? 0 : Math.abs(current.avgPrice - mean) / stdDev;
    const isSigmaAnomaly = zScore >= sigmaThreshold;
    const isChangeAnomaly = Math.abs(changePercent) >= changeThreshold;

    if (isSigmaAnomaly || isChangeAnomaly) {
      const type: AnomalyType = changePercent > 0 ? 'spike' : 'drop';
      let severity: AnomalySeverity;

      if (zScore > 3 || Math.abs(changePercent) > 30) {
        severity = 'high';
      } else if (zScore > 2 || Math.abs(changePercent) > changeThreshold) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      anomalies.push({
        id: `${fruitId}-${marketId}-${current.date}`,
        date: current.date,
        fruitId,
        marketId,
        type,
        changePercent,
        severity,
        possibleReason: generatePossibleReason(type, severity),
        description: generateDescription(type, current.avgPrice, changePercent),
      });
    }
  }

  return anomalies;
};

const generatePossibleReason = (type: AnomalyType, severity: AnomalySeverity): string => {
  const spikeReasons = [
    '供应减少',
    '需求激增',
    '运输成本上升',
    '天气影响产区',
    '节假日因素',
  ];
  const dropReasons = [
    '集中上市',
    '需求疲软',
    '进口冲击',
    '产能过剩',
    '替代品类增加',
  ];

  const reasons = type === 'spike' ? spikeReasons : dropReasons;
  const idx = severity === 'high' ? 4 : severity === 'medium' ? 2 : 0;
  return reasons[idx % reasons.length];
};

const generateDescription = (
  type: AnomalyType,
  price: number,
  changePercent: number
): string => {
  const typeText = type === 'spike' ? '暴涨' : '暴跌';
  const absPercent = Math.abs(changePercent).toFixed(2);
  return `价格${typeText}至${price.toFixed(2)}元/公斤，单日变动${absPercent}%`;
};

export const filterAnomaliesBySeverity = (
  anomalies: PriceAnomaly[],
  severities: AnomalySeverity[]
): PriceAnomaly[] => {
  if (severities.length === 0) return anomalies;
  return anomalies.filter((a) => severities.includes(a.severity));
};

export const filterAnomaliesByType = (
  anomalies: PriceAnomaly[],
  types: AnomalyType[]
): PriceAnomaly[] => {
  if (types.length === 0) return anomalies;
  return anomalies.filter((a) => types.includes(a.type));
};

export const getSeverityColor = (severity: AnomalySeverity): string => {
  const map: Record<AnomalySeverity, string> = {
    low: 'severity.low',
    medium: 'severity.medium',
    high: 'severity.high',
  };
  return map[severity];
};

export const getAnomalyTypeColor = (type: AnomalyType): string => {
  return type === 'spike' ? 'price.up' : 'price.down';
};

export const groupAnomaliesByDate = (
  anomalies: PriceAnomaly[]
): Map<string, PriceAnomaly[]> => {
  const grouped = new Map<string, PriceAnomaly[]>();
  anomalies.forEach((a) => {
    if (!grouped.has(a.date)) {
      grouped.set(a.date, []);
    }
    grouped.get(a.date)!.push(a);
  });
  return grouped;
};
