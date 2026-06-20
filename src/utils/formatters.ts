import { format, parseISO } from 'date-fns';
import type { AnomalySeverity, WeatherSeverity, WeatherType } from '@/types';

export const formatPrice = (price: number, unit: string = '元/公斤'): string => {
  return `${price.toFixed(2)} ${unit}`;
};

export const formatPriceShort = (price: number): string => {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(2)}万`;
  }
  return price.toFixed(2);
};

export const formatPercent = (percent: number, showSign: boolean = true): string => {
  const sign = showSign && percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

export const formatPercentAbs = (percent: number): string => {
  return `${Math.abs(percent).toFixed(2)}%`;
};

export const formatDate = (dateStr: string, pattern: string = 'yyyy-MM-dd'): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, pattern);
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => {
  return formatDate(dateStr, 'MM/dd');
};

export const formatDateCN = (dateStr: string): string => {
  return formatDate(dateStr, 'yyyy年MM月dd日');
};

export const formatVolume = (volume: number): string => {
  if (volume >= 10000) {
    return `${(volume / 10000).toFixed(2)}万吨`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}千吨`;
  }
  return `${volume.toFixed(2)}吨`;
};

export const formatVolumeShort = (volume: number): string => {
  if (volume >= 10000) {
    return `${(volume / 10000).toFixed(1)}万`;
  }
  return volume.toFixed(0);
};

export const getSeverityLabel = (severity: AnomalySeverity | WeatherSeverity): string => {
  const map: Record<AnomalySeverity | WeatherSeverity, string> = {
    low: '低',
    medium: '中',
    high: '高',
    light: '轻微',
    moderate: '中等',
    severe: '严重',
  };
  return map[severity] || severity;
};

export const getWeatherTypeLabel = (type: WeatherType): string => {
  const map: Record<WeatherType, string> = {
    frost: '霜冻',
    hail: '冰雹',
    typhoon: '台风',
    rain: '暴雨',
    drought: '干旱',
    heatwave: '高温',
  };
  return map[type] || type;
};

export const getAnomalyTypeLabel = (type: 'spike' | 'drop'): string => {
  return type === 'spike' ? '暴涨' : '暴跌';
};
