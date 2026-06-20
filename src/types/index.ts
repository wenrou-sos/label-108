export interface Fruit {
  id: string;
  name: string;
  category: string;
  isImported: boolean;
  domesticCounterpart?: string;
  mainOrigins: string[];
}

export interface Market {
  id: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
}

export interface DailyPrice {
  date: string;
  fruitId: string;
  marketId: string;
  highPrice: number;
  lowPrice: number;
  avgPrice: number;
  openPrice: number;
  closePrice: number;
  volume: number;
}

export type AnomalyType = 'spike' | 'drop';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface PriceAnomaly {
  id: string;
  date: string;
  fruitId: string;
  marketId: string;
  type: AnomalyType;
  changePercent: number;
  severity: AnomalySeverity;
  possibleReason: string;
  description: string;
}

export type WeatherType = 'frost' | 'hail' | 'typhoon' | 'rain' | 'drought' | 'heatwave';
export type WeatherSeverity = 'light' | 'moderate' | 'severe';

export interface WeatherEvent {
  id: string;
  date: string;
  region: string;
  type: WeatherType;
  severity: WeatherSeverity;
  affectedFruits: string[];
  description: string;
  impactDays: number;
}

export type TimePeriod = '7d' | '30d' | '90d';

export interface FilterState {
  selectedFruits: string[];
  selectedMarkets: string[];
  dateRange: { start: string; end: string };
  timePeriod: TimePeriod;
}

export interface DataState {
  fruits: Fruit[];
  markets: Market[];
  dailyPrices: DailyPrice[];
  anomalies: PriceAnomaly[];
  weatherEvents: WeatherEvent[];
  isLoading: boolean;
  error: string | null;
}

export interface PriceChange {
  fruitId: string;
  marketId: string;
  changePercent: number;
  changeValue: number;
  currentPrice: number;
  previousPrice: number;
}

export interface MAData {
  date: string;
  value: number;
  period: number;
}

export interface PercentileData {
  currentPrice: number;
  percentile: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
}
