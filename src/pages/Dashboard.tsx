import { useEffect, useMemo } from 'react';
import {
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  TrendingUp,
  AlertTriangle,
  Leaf,
  BarChart3,
} from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAlertStore } from '@/store/useAlertStore';
import { usePriceData } from '@/hooks/usePriceData';
import StatCard from '@/components/StatCard';
import FilterBar from '@/components/FilterBar';
import { TopGainers, TopLosers } from '@/components/TopMovers';
import PriceTable from '@/components/PriceTable';
import MyAlerts from '@/components/MyAlerts';
import AlertSettingsPanel from '@/components/AlertSettingsPanel';

export default function Dashboard() {
  const { loadAllData, isLoading, fruits, markets, anomalies, dailyPrices } = useDataStore();
  const { checkAlerts, setPriceData } = useAlertStore();
  const { topGainers, topLosers, prices } = usePriceData();
  const { isOpen: isSettingsOpen, onOpen: openSettings, onClose: closeSettings } = useDisclosure();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!isLoading && dailyPrices.length > 0 && fruits.length > 0 && markets.length > 0) {
      setPriceData(dailyPrices, fruits, markets);
      checkAlerts(dailyPrices, fruits, markets);
    }
  }, [isLoading, dailyPrices, fruits, markets, checkAlerts, setPriceData]);

  const stats = useMemo(() => {
    if (dailyPrices.length === 0) {
      return {
        avgPrice: 0,
        dailyChange: 0,
        anomalyCount: anomalies.length,
        fruitCount: fruits.length,
      };
    }

    const latestPrices = new Map<string, number>();
    const previousPrices = new Map<string, number>();

    const sorted = [...dailyPrices].sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = sorted[0]?.date;
    const previousDate = sorted.find((p) => p.date !== latestDate)?.date;

    dailyPrices.forEach((p) => {
      const key = `${p.fruitId}-${p.marketId}`;
      if (p.date === latestDate) {
        latestPrices.set(key, p.avgPrice);
      }
      if (p.date === previousDate) {
        previousPrices.set(key, p.avgPrice);
      }
    });

    const latestValues = Array.from(latestPrices.values());
    const avgPrice = latestValues.length > 0
      ? latestValues.reduce((a, b) => a + b, 0) / latestValues.length
      : 0;

    let dailyChange = 0;
    let count = 0;
    latestPrices.forEach((price, key) => {
      const prev = previousPrices.get(key);
      if (prev && prev > 0) {
        dailyChange += ((price - prev) / prev) * 100;
        count++;
      }
    });
    dailyChange = count > 0 ? dailyChange / count : 0;

    return {
      avgPrice,
      dailyChange,
      anomalyCount: anomalies.length,
      fruitCount: fruits.length,
    };
  }, [dailyPrices, anomalies, fruits]);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          综合看板
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          实时监控全国水果批发市场价格动态
        </Text>
      </VStack>

      <FilterBar />

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={4}
      >
        <GridItem>
          <StatCard
            title="今日均价指数"
            value={`¥${stats.avgPrice.toFixed(2)}`}
            icon={<BarChart3 size={22} />}
            changePercent={stats.dailyChange}
            changeLabel="日环比"
            isLoading={isLoading}
            accentColor="brand"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="日涨跌幅"
            value={`${stats.dailyChange >= 0 ? '+' : ''}${stats.dailyChange.toFixed(2)}%`}
            icon={<TrendingUp size={22} />}
            changePercent={stats.dailyChange}
            isLoading={isLoading}
            accentColor="accent"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="异常预警数量"
            value={stats.anomalyCount}
            icon={<AlertTriangle size={22} />}
            isLoading={isLoading}
            accentColor="red"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="监测品种数"
            value={stats.fruitCount}
            icon={<Leaf size={22} />}
            isLoading={isLoading}
            accentColor="green"
          />
        </GridItem>
      </Grid>

      <MyAlerts onOpenSettings={openSettings} />

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        gap={4}
      >
        <GridItem>
          <TopGainers data={topGainers} isLoading={isLoading} />
        </GridItem>
        <GridItem>
          <TopLosers data={topLosers} isLoading={isLoading} />
        </GridItem>
      </Grid>

      <PriceTable isLoading={isLoading} />

      <AlertSettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
    </VStack>
  );
}
