import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PriceAlertRule,
  TriggeredAlert,
  AlertConditionType,
  NotificationChannel,
  DailyPrice,
  Fruit,
  Market,
} from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 10);

const getDefaultChannels = (): NotificationChannel[] => [
  { type: 'system', enabled: true },
  { type: 'dingtalk', enabled: false, config: { webhook: '' } },
  { type: 'email', enabled: false, config: { address: '' } },
];

interface AlertStore {
  rules: PriceAlertRule[];
  triggeredAlerts: TriggeredAlert[];
  lastCheckedAt: number | null;
  cachedPrices: DailyPrice[];
  cachedFruits: Fruit[];
  cachedMarkets: Market[];

  addRule: (rule: Omit<PriceAlertRule, 'id' | 'createdAt' | 'notificationChannels'> & {
    notificationChannels?: NotificationChannel[];
  }) => void;
  updateRule: (id: string, updates: Partial<PriceAlertRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  setPriceData: (prices: DailyPrice[], fruits: Fruit[], markets: Market[]) => void;

  acknowledgeAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;

  checkAlerts: (prices?: DailyPrice[], fruits?: Fruit[], markets?: Market[]) => TriggeredAlert[];
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      rules: [],
      triggeredAlerts: [],
      lastCheckedAt: null,
      cachedPrices: [],
      cachedFruits: [],
      cachedMarkets: [],

      setPriceData: (prices, fruits, markets) => {
        set({ cachedPrices: prices, cachedFruits: fruits, cachedMarkets: markets });
      },

      addRule: (rule) => {
        const newRule: PriceAlertRule = {
          ...rule,
          id: generateId(),
          createdAt: Date.now(),
          notificationChannels: rule.notificationChannels || getDefaultChannels(),
        };
        set((state) => ({ rules: [...state.rules, newRule] }));
        const { cachedPrices, cachedFruits, cachedMarkets } = get();
        if (cachedPrices.length > 0 && cachedFruits.length > 0 && cachedMarkets.length > 0) {
          get().checkAlerts();
        }
      },

      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          triggeredAlerts: state.triggeredAlerts.filter((a) => a.ruleId !== id),
        }));
        const { cachedPrices, cachedFruits, cachedMarkets, rules } = get();
        const updatedRule = rules.find((r) => r.id === id);
        if (updatedRule?.enabled && cachedPrices.length > 0 && cachedFruits.length > 0 && cachedMarkets.length > 0) {
          get().checkAlerts();
        }
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
          triggeredAlerts: state.triggeredAlerts.filter((a) => a.ruleId !== id),
        }));
      },

      toggleRule: (id) => {
        const rule = get().rules.find((r) => r.id === id);
        if (!rule) return;

        const newEnabled = !rule.enabled;
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: newEnabled } : r)),
          triggeredAlerts: newEnabled
            ? state.triggeredAlerts
            : state.triggeredAlerts.filter((a) => a.ruleId !== id),
        }));

        if (newEnabled) {
          const { cachedPrices, cachedFruits, cachedMarkets } = get();
          if (cachedPrices.length > 0 && cachedFruits.length > 0 && cachedMarkets.length > 0) {
            get().checkAlerts();
          }
        }
      },

      acknowledgeAlert: (id) => {
        set((state) => ({
          triggeredAlerts: state.triggeredAlerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },

      clearTriggeredAlerts: () => {
        set({ triggeredAlerts: [] });
      },

      checkAlerts: (prices, fruits, markets) => {
        const { rules, triggeredAlerts, cachedPrices, cachedFruits, cachedMarkets } = get();

        const p = prices ?? cachedPrices;
        const f = fruits ?? cachedFruits;
        const m = markets ?? cachedMarkets;

        const newTriggered: TriggeredAlert[] = [];

        const enabledRules = rules.filter((r) => r.enabled);
        if (enabledRules.length === 0 || p.length === 0) {
          return [];
        }

        const sorted = [...p].sort((a, b) => b.date.localeCompare(a.date));
        const latestDate = sorted[0]?.date;
        const previousDate = sorted.find((pr) => pr.date !== latestDate)?.date;

        const latestPrices = new Map<string, DailyPrice>();
        const previousPrices = new Map<string, DailyPrice>();

        p.forEach((pr) => {
          const key = `${pr.fruitId}-${pr.marketId}`;
          if (pr.date === latestDate) {
            latestPrices.set(key, pr);
          }
          if (pr.date === previousDate) {
            previousPrices.set(key, pr);
          }
        });

        enabledRules.forEach((rule) => {
          const fruit = f.find((fr) => fr.id === rule.fruitId);
          if (!fruit) return;

          const checkPrice = (price: DailyPrice, marketId: string) => {
            const market = m.find((mk) => mk.id === marketId);
            if (!market) return;

            const key = `${rule.fruitId}-${marketId}`;
            const prev = previousPrices.get(key);
            const changePercent =
              prev && prev.avgPrice > 0
                ? ((price.avgPrice - prev.avgPrice) / prev.avgPrice) * 100
                : undefined;

            let triggered = false;
            let severity: 'warning' | 'critical' = 'warning';

            switch (rule.conditionType) {
              case 'price_above':
                if (price.avgPrice > rule.threshold) {
                  triggered = true;
                  severity = price.avgPrice > rule.threshold * 1.2 ? 'critical' : 'warning';
                }
                break;
              case 'price_below':
                if (price.avgPrice < rule.threshold) {
                  triggered = true;
                  severity = price.avgPrice < rule.threshold * 0.8 ? 'critical' : 'warning';
                }
                break;
              case 'change_above':
                if (changePercent !== undefined && changePercent > rule.threshold) {
                  triggered = true;
                  severity = changePercent > rule.threshold * 1.5 ? 'critical' : 'warning';
                }
                break;
              case 'change_below':
                if (changePercent !== undefined && changePercent < -Math.abs(rule.threshold)) {
                  triggered = true;
                  severity = changePercent < -Math.abs(rule.threshold) * 1.5 ? 'critical' : 'warning';
                }
                break;
            }

            if (triggered) {
              const existingId = `${rule.id}-${marketId}-${latestDate}`;
              const alreadyTriggered = triggeredAlerts.some(
                (a) => a.id === existingId || (a.ruleId === rule.id && a.marketId === marketId && a.triggeredAt > Date.now() - 3600000)
              );

              if (!alreadyTriggered) {
                newTriggered.push({
                  id: existingId,
                  ruleId: rule.id,
                  ruleName: rule.name,
                  fruitId: rule.fruitId,
                  marketId,
                  fruitName: fruit.name,
                  marketName: market.name,
                  currentPrice: price.avgPrice,
                  threshold: rule.threshold,
                  conditionType: rule.conditionType,
                  severity,
                  changePercent,
                  triggeredAt: Date.now(),
                  acknowledged: false,
                });
              }
            }
          };

          if (rule.marketId) {
            const key = `${rule.fruitId}-${rule.marketId}`;
            const price = latestPrices.get(key);
            if (price) {
              checkPrice(price, rule.marketId);
            }
          } else {
            m.forEach((mk) => {
              const key = `${rule.fruitId}-${mk.id}`;
              const price = latestPrices.get(key);
              if (price) {
                checkPrice(price, mk.id);
              }
            });
          }
        });

        if (newTriggered.length > 0) {
          const deduplicated = [...triggeredAlerts, ...newTriggered].filter(
            (alert, index, self) => index === self.findIndex((a) => a.id === alert.id)
          );
          set({
            triggeredAlerts: deduplicated.slice(-100),
            lastCheckedAt: Date.now(),
          });
        } else {
          set({ lastCheckedAt: Date.now() });
        }

        return newTriggered;
      },
    }),
    {
      name: 'fruit-price-alerts',
      partialize: (state) => ({
        rules: state.rules,
        triggeredAlerts: state.triggeredAlerts,
      }),
    }
  )
);

export const getConditionLabel = (type: AlertConditionType): string => {
  const labels: Record<AlertConditionType, string> = {
    price_above: '价格高于',
    price_below: '价格低于',
    change_above: '日涨幅超过',
    change_below: '日跌幅超过',
  };
  return labels[type];
};

export const getConditionUnit = (type: AlertConditionType): string => {
  return type.startsWith('price') ? '元/公斤' : '%';
};
