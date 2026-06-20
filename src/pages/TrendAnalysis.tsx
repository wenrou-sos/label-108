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
import { formatPrice, formatPercent } from '@/utils/formatters';

export default function TrendAnalysis() {
  const { loadAllData, isLoading, fruits, markets, filters } = useDataStore();

  const selectedFruitId = filters.selectedFruits.length > 0
    ? filters.selectedFruits[0]
    : fruits[0]?.id;

  const selectedMarketIds = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets
    : markets.slice(0, 4).map((m) => m.id);

  const { singleSeriesPrices, getPricesForFruitMarket, priceChange, periodChange } = usePriceData({
    fruitId: selectedFruitId,
    marketId: selectedMarketIds[0],
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
  const currentMarket = markets.find((m) => m.id === selectedMarketIds[0]);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

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
  );
}
