import { useEffect, useMemo, useState } from 'react';
import {
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Grid,
  GridItem,
  Card,
  CardBody,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useDataStore } from '@/store/useDataStore';
import { usePriceData } from '@/hooks/usePriceData';
import FilterBar from '@/components/FilterBar';
import PriceKLineChart from '@/components/charts/PriceKLineChart';
import MultiLineChart, { COLORS } from '@/components/charts/MultiLineChart';
import CorrelationHeatmap from '@/components/charts/CorrelationHeatmap';
import CorrelationDetailModal from '@/components/charts/CorrelationDetailModal';
import CorrelationRecommendations from '@/components/charts/CorrelationRecommendations';
import { formatPrice, formatPercent } from '@/utils/formatters';
import {
  buildCorrelationMatrix,
  getTopCorrelatedFruits,
  filterPricesByDays,
} from '@/utils/priceUtils';
import type { CorrelationResult, DailyPrice, TimePeriod } from '@/types';

const DEFAULT_CORRELATION_FRUIT_COUNT = 8;

const avgPricesByDate = (priceList: DailyPrice[]): DailyPrice[] => {
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

const processDetailPrices = (
  allPrices: DailyPrice[],
  fruitId: string,
  marketIds: string[]
): DailyPrice[] => {
  let prices = allPrices.filter((p) => p.fruitId === fruitId);
  if (marketIds.length > 0) {
    prices = prices.filter((p) => marketIds.includes(p.marketId));
  }
  if (marketIds.length > 1 || marketIds.length === 0) {
    prices = avgPricesByDate(prices);
  }
  return prices.sort((a, b) => a.date.localeCompare(b.date));
};

export default function TrendAnalysis() {
  const { loadAllData, isLoading, fruits, markets, filters, setTimePeriod, dailyPrices } = useDataStore();

  const selectedFruitId = filters.selectedFruits.length > 0
    ? filters.selectedFruits[0]
    : fruits[0]?.id;

  const selectedMarketIds = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets
    : markets.slice(0, 4).map((m) => m.id);

  const selectedMarketId = selectedMarketIds[0];

  const { singleSeriesPrices, getPricesForFruitMarket, priceChange, periodChange } = usePriceData({
    fruitId: selectedFruitId,
    marketId: selectedMarketId,
  });

  const [correlationSelectedFruitIds, setCorrelationSelectedFruitIds] = useState<string[]>([]);
  const [correlationTimePeriod, setCorrelationTimePeriod] = useState<TimePeriod>(filters.timePeriod);
  const [detailModalData, setDetailModalData] = useState<CorrelationResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    setCorrelationTimePeriod(filters.timePeriod);
  }, [filters.timePeriod]);

  useEffect(() => {
    if (fruits.length > 0 && correlationSelectedFruitIds.length === 0) {
      const defaultIds = fruits.slice(0, DEFAULT_CORRELATION_FRUIT_COUNT).map((f) => f.id);
      if (selectedFruitId && !defaultIds.includes(selectedFruitId)) {
        defaultIds[0] = selectedFruitId;
      }
      setCorrelationSelectedFruitIds(defaultIds);
    }
  }, [fruits, selectedFruitId, correlationSelectedFruitIds.length]);

  const multiSeriesData = useMemo(() => {
    if (!selectedFruitId) return [];
    return selectedMarketIds.map((marketId, idx) => {
      const market = markets.find((m) => m.id === marketId);
      return {
        name: market?.name || marketId,
        data: getPricesForFruitMarket(selectedFruitId, marketId),
        color: COLORS[idx % COLORS.length],
      };
    }).filter((s) => s.data.length > 0);
  }, [selectedFruitId, selectedMarketIds, markets, getPricesForFruitMarket]);

  const currentFruit = fruits.find((f) => f.id === selectedFruitId);
  const currentMarket = markets.find((m) => m.id === selectedMarketId);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const correlationPrices = useMemo(() => {
    const days = correlationTimePeriod === '7d' ? 7 : correlationTimePeriod === '30d' ? 30 : 90;
    return filterPricesByDays(dailyPrices, days);
  }, [dailyPrices, correlationTimePeriod]);

  const correlationMatrix = useMemo(() => {
    if (correlationSelectedFruitIds.length < 2 || correlationPrices.length === 0) return null;
    return buildCorrelationMatrix(correlationPrices, correlationSelectedFruitIds, selectedMarketIds);
  }, [correlationSelectedFruitIds, correlationPrices, selectedMarketIds]);

  const { positive: topPositive, negative: topNegative } = useMemo(() => {
    if (!selectedFruitId || fruits.length === 0 || correlationPrices.length === 0) {
      return { positive: [], negative: [] };
    }
    const allFruitIds = fruits.map((f) => f.id);
    return getTopCorrelatedFruits(correlationPrices, selectedFruitId, allFruitIds, selectedMarketIds, 3);
  }, [selectedFruitId, fruits, correlationPrices, selectedMarketIds]);

  const toggleCorrelationFruit = (fruitId: string) => {
    setCorrelationSelectedFruitIds((prev) => {
      if (prev.includes(fruitId)) {
        return prev.filter((id) => id !== fruitId);
      }
      return [...prev, fruitId];
    });
  };

  const resetCorrelationFruits = () => {
    const defaultIds = fruits.slice(0, DEFAULT_CORRELATION_FRUIT_COUNT).map((f) => f.id);
    setCorrelationSelectedFruitIds(defaultIds);
  };

  const handleCorrelationCellClick = (result: CorrelationResult) => {
    setDetailModalData(result);
    setIsDetailModalOpen(true);
  };

  const handleRecommendationClick = (result: CorrelationResult) => {
    setDetailModalData(result);
    setIsDetailModalOpen(true);
  };

  const handleCorrelationTimePeriodChange = (period: TimePeriod) => {
    setCorrelationTimePeriod(period);
    setTimePeriod(period);
  };

  const detailFruitA = detailModalData ? fruits.find((f) => f.id === detailModalData.fruitIdA) : undefined;
  const detailFruitB = detailModalData ? fruits.find((f) => f.id === detailModalData.fruitIdB) : undefined;

  const detailPricesA = useMemo(() => {
    if (!detailModalData) return [];
    return processDetailPrices(correlationPrices, detailModalData.fruitIdA, selectedMarketIds);
  }, [detailModalData, correlationPrices, selectedMarketIds]);

  const detailPricesB = useMemo(() => {
    if (!detailModalData) return [];
    return processDetailPrices(correlationPrices, detailModalData.fruitIdB, selectedMarketIds);
  }, [detailModalData, correlationPrices, selectedMarketIds]);

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          价格趋势分析
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          深入分析单品种多市场价格走势
        </Text>
      </VStack>

      <FilterBar
        fruitSingleSelect
        marketMultiSelect
        showTimePeriod
      />

      {(currentFruit || currentMarket) && (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody p={5}>
            <HStack justify="space-between" flexWrap="wrap" spacing={4}>
              <VStack align="start" spacing={2}>
                <HStack spacing={2}>
                  <Heading size="md" color={headingColor}>
                    {currentFruit?.name || '请选择品种'}
                  </Heading>
                  {currentFruit?.isImported && (
                    <Badge colorScheme="orange" variant="subtle" px={2} py={0.5} borderRadius="md">
                      进口
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color={subTextColor}>
                  {currentMarket?.name || '请选择市场'} · {currentMarket?.city}
                </Text>
              </VStack>
              <HStack spacing={6}>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color={subTextColor}>最新价</Text>
                  <Text fontSize="2xl" fontWeight={700} color={headingColor}>
                    {priceChange ? formatPrice(priceChange.currentPrice) : '--'}
                  </Text>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color={subTextColor}>日涨跌</Text>
                  <Text
                    fontSize="xl"
                    fontWeight={700}
                    color={priceChange && priceChange.changePercent >= 0 ? 'price.up' : 'price.down'}
                  >
                    {priceChange ? formatPercent(priceChange.changePercent) : '--'}
                  </Text>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color={subTextColor}>
                    {filters.timePeriod === '7d' ? '7日' : filters.timePeriod === '30d' ? '30日' : '90日'}涨跌
                  </Text>
                  <Text
                    fontSize="xl"
                    fontWeight={700}
                    color={periodChange && periodChange.changePercent >= 0 ? 'price.up' : 'price.down'}
                  >
                    {periodChange ? formatPercent(periodChange.changePercent) : '--'}
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      )}

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} gap={6}>
        <GridItem colSpan={{ base: 1, lg: 3 }}>
          <VStack spacing={6} align="stretch">
            <PriceKLineChart
              data={singleSeriesPrices}
              title={`${currentFruit?.name || ''} K线图`}
              isLoading={isLoading}
              height={420}
            />

            <MultiLineChart
              seriesData={multiSeriesData}
              title={`${currentFruit?.name || ''} 多市场价格对比`}
              isLoading={isLoading}
              height={380}
            />
          </VStack>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <CorrelationRecommendations
            targetFruit={currentFruit}
            positiveCorrelations={topPositive}
            negativeCorrelations={topNegative}
            fruits={fruits}
            isLoading={isLoading}
            onCorrelationClick={handleRecommendationClick}
          />
        </GridItem>
      </Grid>

      <CorrelationHeatmap
        matrix={correlationMatrix}
        fruits={fruits}
        selectedFruitIds={correlationSelectedFruitIds}
        onFruitToggle={toggleCorrelationFruit}
        onClearFruits={resetCorrelationFruits}
        onCellClick={handleCorrelationCellClick}
        timePeriod={correlationTimePeriod}
        onTimePeriodChange={handleCorrelationTimePeriodChange}
        isLoading={isLoading}
        title="品种价格关联矩阵"
      />

      <CorrelationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        correlation={detailModalData}
        fruitA={detailFruitA}
        fruitB={detailFruitB}
        pricesA={detailPricesA}
        pricesB={detailPricesB}
      />
    </VStack>
  );
}
