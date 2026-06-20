import Papa from 'papaparse';
import type {
  Fruit,
  Market,
  DailyPrice,
  PriceAnomaly,
  WeatherEvent,
  AnomalyType,
  AnomalySeverity,
  WeatherType,
  WeatherSeverity,
} from '@/types';

const parseCSV = <T>(url: string, transform?: (data: unknown[]) => T[]): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const data = transform ? transform(results.data as unknown[]) : (results.data as T[]);
        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

const transformFruits = (data: unknown[]): Fruit[] => {
  return data.map((row: any) => ({
    id: String(row.id || ''),
    name: String(row.name || ''),
    category: String(row.category || ''),
    isImported: String(row.isImported).toLowerCase() === 'true' || row.isImported === true,
    domesticCounterpart: row.domesticCounterpart ? String(row.domesticCounterpart) : undefined,
    mainOrigins: row.mainOrigins
      ? String(row.mainOrigins).split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  }));
};

const transformMarkets = (data: unknown[]): Market[] => {
  return data.map((row: any) => ({
    id: String(row.id || ''),
    name: String(row.name || ''),
    city: String(row.city || ''),
    province: String(row.province || ''),
    lat: parseFloat(row.lat) || 0,
    lng: parseFloat(row.lng) || 0,
  }));
};

const transformDailyPrices = (data: unknown[]): DailyPrice[] => {
  return data.map((row: any) => ({
    date: String(row.date || ''),
    fruitId: String(row.fruitId || ''),
    marketId: String(row.marketId || ''),
    highPrice: parseFloat(row.highPrice) || 0,
    lowPrice: parseFloat(row.lowPrice) || 0,
    avgPrice: parseFloat(row.avgPrice) || 0,
    openPrice: parseFloat(row.openPrice) || 0,
    closePrice: parseFloat(row.closePrice) || 0,
    volume: parseInt(row.volume, 10) || 0,
  }));
};

const mapAnomalyType = (type: string, changePct: number): AnomalyType => {
  const t = type.toLowerCase();
  if (t.includes('spike') || t.includes('surge') || t.includes('shortage') || t.includes('up') || t.includes('涨')) return 'spike';
  if (t.includes('drop') || t.includes('down') || t.includes('跌')) return 'drop';
  return changePct >= 0 ? 'spike' : 'drop';
};

const mapAnomalySeverity = (severity: string): AnomalySeverity => {
  const s = severity.toLowerCase();
  if (s === 'high' || s === '高' || s === '严重') return 'high';
  if (s === 'medium' || s === '中' || s === '一般') return 'medium';
  return 'low';
};

const transformAnomalies = (data: unknown[]): PriceAnomaly[] => {
  return data.map((row: any, index: number) => {
    const rawChangePct = parseFloat(row.priceChangePct || row.changePercent || 0);
    const type = mapAnomalyType(String(row.type || row.anomalyType || ''), rawChangePct);
    return {
      id: String(row.id || `anom-${index}`),
      date: String(row.date || ''),
      fruitId: String(row.fruitId || ''),
      marketId: String(row.marketId || ''),
      type,
      changePercent: type === 'spike' ? Math.abs(rawChangePct) : -Math.abs(rawChangePct),
      severity: mapAnomalySeverity(String(row.severity || '')),
      possibleReason: String(row.reason || row.possibleReason || ''),
      description: String(row.description || ''),
    };
  });
};

const mapWeatherType = (type: string): WeatherType => {
  const t = type.toLowerCase();
  if (t.includes('frost') || t.includes('霜冻') || t.includes('寒潮') || t.includes('暴雪')) return 'frost';
  if (t.includes('hail') || t.includes('冰雹')) return 'hail';
  if (t.includes('typhoon') || t.includes('台风')) return 'typhoon';
  if (t.includes('rain') || t.includes('雨') || t.includes('暴雨') || t.includes('大雾')) return 'rain';
  if (t.includes('drought') || t.includes('干旱')) return 'drought';
  if (t.includes('heat') || t.includes('高温')) return 'heatwave';
  return 'rain';
};

const mapWeatherSeverity = (level: string): WeatherSeverity => {
  const l = level.toLowerCase();
  if (l === 'severe' || l === '严重' || l === '较大') return 'severe';
  if (l === 'moderate' || l === 'medium' || l === '一般') return 'moderate';
  return 'light';
};

const WEATHER_AFFECTED_FRUITS: Record<string, string[]> = {
  rain: ['F07', 'F03', 'F08', 'F18', 'F13'],
  drought: ['F06', 'F03', 'F02', 'F16'],
  frost: ['F09', 'F14', 'F19', 'F20', 'F12'],
  hail: ['F01', 'F02', 'F03', 'F07', 'F10'],
  typhoon: ['F05', 'F09', 'F14', 'F08', 'F12'],
  heatwave: ['F06', 'F03', 'F07', 'F18'],
};

const transformWeatherEvents = (data: unknown[]): WeatherEvent[] => {
  return data.map((row: any, index: number) => {
    const weatherType = mapWeatherType(String(row.weatherType || row.type || ''));
    const affectedFruits = WEATHER_AFFECTED_FRUITS[weatherType] || ['F01', 'F03', 'F05'];
    return {
      id: String(row.id || `wx-${index}`),
      date: String(row.date || ''),
      region: String(row.province || row.region || ''),
      type: weatherType,
      severity: mapWeatherSeverity(String(row.impactLevel || row.severity || '')),
      affectedFruits,
      description: String(row.description || ''),
      impactDays: parseInt(row.durationDays || row.impactDays || '0', 10) || 0,
    };
  });
};

export const loadFruits = async (): Promise<Fruit[]> => {
  try {
    return await parseCSV<Fruit>('/data/fruits.csv', transformFruits);
  } catch {
    return getMockFruits();
  }
};

export const loadMarkets = async (): Promise<Market[]> => {
  try {
    return await parseCSV<Market>('/data/markets.csv', transformMarkets);
  } catch {
    return getMockMarkets();
  }
};

export const loadDailyPrices = async (): Promise<DailyPrice[]> => {
  try {
    return await parseCSV<DailyPrice>('/data/daily_prices.csv', transformDailyPrices);
  } catch {
    return generateMockDailyPrices();
  }
};

export const loadAnomalies = async (): Promise<PriceAnomaly[]> => {
  try {
    return await parseCSV<PriceAnomaly>('/data/anomalies.csv', transformAnomalies);
  } catch {
    return getMockAnomalies();
  }
};

export const loadHistoricalPrices = async (year: number): Promise<DailyPrice[]> => {
  try {
    return await parseCSV<DailyPrice>(`/data/historical_prices/${year}.csv`, transformDailyPrices);
  } catch {
    return [];
  }
};

export const loadAllHistoricalPrices = async (years: number[] = [2021, 2022, 2023]): Promise<Record<number, DailyPrice[]>> => {
  try {
    const results = await Promise.all(years.map((y) => loadHistoricalPrices(y)));
    const map: Record<number, DailyPrice[]> = {};
    years.forEach((y, i) => {
      map[y] = results[i];
    });
    return map;
  } catch {
    return {};
  }
};

export const loadWeatherEvents = async (): Promise<WeatherEvent[]> => {
  try {
    return await parseCSV<WeatherEvent>('/data/weather_events.csv', transformWeatherEvents);
  } catch {
    return getMockWeatherEvents();
  }
};

const getMockFruits = (): Fruit[] => [
  { id: 'apple-fuji', name: '富士苹果', category: '仁果类', isImported: false, mainOrigins: ['山东烟台', '陕西洛川'] },
  { id: 'apple-gala', name: '嘎啦苹果', category: '仁果类', isImported: false, mainOrigins: ['山东', '陕西'] },
  { id: 'pear-ya', name: '鸭梨', category: '仁果类', isImported: false, mainOrigins: ['河北泊头', '山东阳信'] },
  { id: 'pear-snow', name: '雪梨', category: '仁果类', isImported: false, mainOrigins: ['河北赵县'] },
  { id: 'banana', name: '香蕉', category: '瓜果类', isImported: true, domesticCounterpart: '国产香蕉', mainOrigins: ['菲律宾', '厄瓜多尔', '广东'] },
  { id: 'watermelon', name: '西瓜', category: '瓜果类', isImported: false, mainOrigins: ['海南', '山东', '新疆'] },
  { id: 'grape-kyoho', name: '巨峰葡萄', category: '浆果类', isImported: false, mainOrigins: ['河北张家口', '新疆吐鲁番'] },
  { id: 'grape-red', name: '红提', category: '浆果类', isImported: true, domesticCounterpart: '国产红提', mainOrigins: ['智利', '美国加州'] },
  { id: 'strawberry', name: '草莓', category: '浆果类', isImported: false, mainOrigins: ['辽宁丹东', '江苏句容'] },
  { id: 'orange-navel', name: '脐橙', category: '柑橘类', isImported: false, mainOrigins: ['江西赣南', '湖北秭归'] },
  { id: 'orange-mandarin', name: '砂糖橘', category: '柑橘类', isImported: false, mainOrigins: ['广东四会', '广西桂林'] },
  { id: 'kiwi', name: '猕猴桃', category: '浆果类', isImported: true, domesticCounterpart: '国产猕猴桃', mainOrigins: ['新西兰', '陕西周至'] },
];

const getMockMarkets = (): Market[] => [
  { id: 'bj-xinfadi', name: '北京新发地农产品批发市场', city: '北京', province: '北京', lat: 39.82, lng: 116.33 },
  { id: 'sh-caoyang', name: '上海曹杨路农产品市场', city: '上海', province: '上海', lat: 31.25, lng: 121.42 },
  { id: 'gz-baiyun', name: '广州江南果菜批发市场', city: '广州', province: '广东', lat: 23.17, lng: 113.26 },
  { id: 'sz-nanshan', name: '深圳南山农产品批发市场', city: '深圳', province: '广东', lat: 22.54, lng: 113.93 },
  { id: 'cd-qingyang', name: '成都农产品中心批发市场', city: '成都', province: '四川', lat: 30.67, lng: 104.07 },
  { id: 'hz-yuhang', name: '杭州农副产品物流中心', city: '杭州', province: '浙江', lat: 30.41, lng: 120.30 },
];

const generateMockDailyPrices = (): DailyPrice[] => {
  const fruits = getMockFruits();
  const markets = getMockMarkets();
  const prices: DailyPrice[] = [];
  const today = new Date();

  for (let d = 0; d < 90; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    fruits.forEach((fruit) => {
      markets.forEach((market) => {
        const basePrice = getBasePrice(fruit.id);
        const marketFactor = getMarketFactor(market.id);
        const seasonalFactor = 1 + Math.sin((d / 90) * Math.PI * 2) * 0.1;
        const randomFactor = 0.9 + Math.random() * 0.2;

        const avgPrice = basePrice * marketFactor * seasonalFactor * randomFactor;
        const spread = avgPrice * 0.1;

        prices.push({
          date: dateStr,
          fruitId: fruit.id,
          marketId: market.id,
          highPrice: avgPrice + spread * Math.random(),
          lowPrice: avgPrice - spread * Math.random(),
          avgPrice,
          openPrice: avgPrice + (Math.random() - 0.5) * spread,
          closePrice: avgPrice + (Math.random() - 0.5) * spread,
          volume: Math.floor(50 + Math.random() * 200),
        });
      });
    });
  }

  return prices;
};

const getBasePrice = (fruitId: string): number => {
  const prices: Record<string, number> = {
    'apple-fuji': 8,
    'apple-gala': 6,
    'pear-ya': 5,
    'pear-snow': 6,
    banana: 7,
    watermelon: 4,
    'grape-kyoho': 12,
    'grape-red': 18,
    strawberry: 25,
    'orange-navel': 7,
    'orange-mandarin': 8,
    kiwi: 15,
  };
  return prices[fruitId] || 10;
};

const getMarketFactor = (marketId: string): number => {
  const factors: Record<string, number> = {
    'bj-xinfadi': 1.1,
    'sh-caoyang': 1.15,
    'gz-baiyun': 1.05,
    'sz-nanshan': 1.1,
    'cd-qingyang': 0.95,
    'hz-yuhang': 1.0,
  };
  return factors[marketId] || 1;
};

const getMockAnomalies = (): PriceAnomaly[] => [
  {
    id: 'a1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fruitId: 'apple-fuji',
    marketId: 'bj-xinfadi',
    type: 'spike',
    changePercent: 25.5,
    severity: 'high',
    possibleReason: '供应减少',
    description: '富士苹果价格暴涨25.5%，主产区运输受阻',
  },
  {
    id: 'a2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fruitId: 'banana',
    marketId: 'gz-baiyun',
    type: 'drop',
    changePercent: -18.2,
    severity: 'medium',
    possibleReason: '集中上市',
    description: '香蕉价格下跌18.2%，进口到货量增加',
  },
  {
    id: 'a3',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fruitId: 'strawberry',
    marketId: 'sh-caoyang',
    type: 'spike',
    changePercent: 32.1,
    severity: 'high',
    possibleReason: '节假日因素',
    description: '草莓价格暴涨32.1%，节日需求激增',
  },
  {
    id: 'a4',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fruitId: 'watermelon',
    marketId: 'hz-yuhang',
    type: 'drop',
    changePercent: -22.8,
    severity: 'high',
    possibleReason: '集中上市',
    description: '西瓜价格下跌22.8%，各地西瓜集中上市',
  },
  {
    id: 'a5',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fruitId: 'grape-red',
    marketId: 'sz-nanshan',
    type: 'spike',
    changePercent: 15.3,
    severity: 'medium',
    possibleReason: '进口冲击',
    description: '红提价格上涨15.3%，进口到货延迟',
  },
];

const getMockWeatherEvents = (): WeatherEvent[] => [
  {
    id: 'w1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: '山东',
    type: 'rain',
    severity: 'moderate',
    affectedFruits: ['apple-fuji', 'apple-gala', 'pear-ya'],
    description: '山东地区连续暴雨，影响水果采摘和运输',
    impactDays: 7,
  },
  {
    id: 'w2',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: '广东',
    type: 'typhoon',
    severity: 'severe',
    affectedFruits: ['banana', 'orange-mandarin'],
    description: '台风登陆广东，香蕉和柑橘产区受损',
    impactDays: 14,
  },
  {
    id: 'w3',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: '新疆',
    type: 'heatwave',
    severity: 'severe',
    affectedFruits: ['grape-kyoho', 'watermelon'],
    description: '新疆持续高温，葡萄和西瓜品质受影响',
    impactDays: 10,
  },
  {
    id: 'w4',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: '云南',
    type: 'drought',
    severity: 'moderate',
    affectedFruits: ['kiwi', 'strawberry'],
    description: '云南干旱持续，猕猴桃和草莓产量下降',
    impactDays: 21,
  },
  {
    id: 'w5',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: '陕西',
    type: 'frost',
    severity: 'light',
    affectedFruits: ['apple-fuji', 'kiwi'],
    description: '陕西春季霜冻，苹果和猕猴桃花期受影响',
    impactDays: 5,
  },
];
