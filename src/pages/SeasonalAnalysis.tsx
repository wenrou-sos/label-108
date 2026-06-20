import { useEffect, useMemo, useState } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Grid,
  GridItem,
  Card,
  CardBody,
  Progress,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Skeleton,
  Fade,
} from '@chakra-ui/react';
import { Calendar, TrendingUp, TrendingDown, Target, ChevronDown } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { usePriceData } from '@/hooks/usePriceData';
import StatCard from '@/components/StatCard';
import SeasonalCompareChart from '@/components/charts/SeasonalCompareChart';
import { formatPrice, formatPercent } from '@/utils/formatters';
import { calculatePercentile } from '@/utils/priceUtils';
import { loadAllHistoricalPrices } from '@/utils/csvLoader';
import type { DailyPrice, PercentileData } from '@/types';

const HISTORICAL_YEARS = [2021, 2022, 2023];

export default function SeasonalAnalysis() {
  const { loadAllData, isLoading, fruits, markets, filters, setSelectedFruits, setSelectedMarkets, dailyPrices } = useDataStore();
  const [historicalPrices, setHistoricalPrices] = useState<Record<number, DailyPrice[]>>({});
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const selectedFruitId = filters.selectedFruits.length > 0
    ? filters.selectedFruits[0]
    : fruits[0]?.id;
  const selectedMarketId = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets[0]
    : markets[0]?.id;

  const { singleSeriesPrices, periodChange } = usePriceData({
    fruitId: selectedFruitId,
    marketId: selectedMarketId,
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    let cancelled = false;
    const loadHistorical = async () => {
      setHistoricalLoading(true);
      try {
        const data = await loadAllHistoricalPrices(HISTORICAL_YEARS);
        if (!cancelled) {
          setHistoricalPrices(data);
        }
      } finally {
        if (!cancelled) {
          setHistoricalLoading(false);
        }
      }
    };
    loadHistorical();
    return () => {
      cancelled = true;
    };
  }, []);

  const historicalPercentile = useMemo((): PercentileData | null => {
    if (!selectedFruitId || !selectedMarketId) return null;
    if (Object.keys(historicalPrices).length === 0) return null;
    if (singleSeriesPrices.length === 0) return null;

    const allHistorical: DailyPrice[] = [];
    HISTORICAL_YEARS.forEach((year) => {
      if (historicalPrices[year]) {
        const filtered = historicalPrices[year].filter(
          (p) => p.fruitId === selectedFruitId && p.marketId === selectedMarketId
        );
        allHistorical.push(...filtered);
      }
    });

    if (allHistorical.length === 0) return null;

    const currentPrice = singleSeriesPrices[singleSeriesPrices.length - 1]?.avgPrice || 0;
    const allPrices = allHistorical.map((p) => p.avgPrice).sort((a, b) => a - b);
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
  }, [historicalPrices, selectedFruitId, selectedMarketId, singleSeriesPrices]);

  const percentile = historicalPercentile;

  const yearlyData = useMemo(() => {
    if (!selectedFruitId || !selectedMarketId) return [];

    const years: { year: number; data: DailyPrice[] }[] = [];

    HISTORICAL_YEARS.forEach((year) => {
      if (historicalPrices[year]) {
        const yearData = historicalPrices[year].filter(
          (p) => p.fruitId === selectedFruitId && p.marketId === selectedMarketId
        );
        if (yearData.length > 0) {
          years.push({ year, data: yearData.sort((a, b) => a.date.localeCompare(b.date)) });
        }
      }
    });

    if (singleSeriesPrices.length > 0) {
      const currentYear = new Date(singleSeriesPrices[singleSeriesPrices.length - 1].date).getFullYear();
      const existing = years.find((y) => y.year === currentYear);
      if (existing) {
        existing.data = singleSeriesPrices;
      } else {
        years.push({ year: currentYear, data: singleSeriesPrices });
      }
    }

    return years.sort((a, b) => a.year - b.year).slice(-3);
  }, [historicalPrices, singleSeriesPrices, selectedFruitId, selectedMarketId]);

  const yoyData = useMemo(() => {
    if (yearlyData.length < 2) return null;
    const thisYear = yearlyData[yearlyData.length - 1].data;
    const lastYear = yearlyData[yearlyData.length - 2].data;
    if (thisYear.length === 0 || lastYear.length === 0) return null;

    const thisAvg = thisYear.reduce((s, p) => s + p.avgPrice, 0) / thisYear.length;
    const lastAvg = lastYear.reduce((s, p) => s + p.avgPrice, 0) / lastYear.length;
    const change = lastAvg === 0 ? 0 : ((thisAvg - lastAvg) / lastAvg) * 100;
    return { thisAvg, lastAvg, change };
  }, [yearlyData]);

  const currentFruit = fruits.find((f) => f.id === selectedFruitId);
  const currentMarket = markets.find((m) => m.id === selectedMarketId);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const getPercentileColor = (p: number) => {
    if (p >= 80) return 'price.up';
    if (p <= 20) return 'price.down';
    return 'accent.500';
  };

  const combinedLoading = isLoading || historicalLoading;

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          季节性价格分析
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          多年历史数据叠加，洞察价格季节性规律
        </Text>
      </VStack>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody p={5}>
          <HStack justify="space-between" flexWrap="wrap" spacing={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color={subTextColor}>当前品种</Text>
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
              <Text fontSize="xs" color={subTextColor}>
                {currentMarket?.name || '请选择市场'} · {currentMarket?.city}
              </Text>
            </VStack>

            <HStack spacing={3}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={16} />}
                  variant="outline"
                  size="sm"
                >
                  选择品种
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto" minW="180px">
                  <MenuOptionGroup
                    value={selectedFruitId || ''}
                    type="radio"
                    onChange={(val) => setSelectedFruits([val as string])}
                  >
                    {fruits.map((f) => (
                      <MenuItemOption key={f.id} value={f.id}>
                        {f.name}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={16} />}
                  variant="outline"
                  size="sm"
                >
                  选择市场
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto" minW="200px">
                  <MenuOptionGroup
                    value={selectedMarketId || ''}
                    type="radio"
                    onChange={(val) => setSelectedMarkets([val as string])}
                  >
                    {markets.map((m) => (
                      <MenuItemOption key={m.id} value={m.id}>
                        {m.name}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      <SeasonalCompareChart
        yearlyData={yearlyData}
        title={`${currentFruit?.name || ''} 历史价格对比`}
        isLoading={combinedLoading}
      />

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <CardBody p={5}>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Target size={20} color="inherit" />
                    <Text fontSize="sm" fontWeight={600} color={headingColor}>
                      历史分位
                    </Text>
                  </HStack>
                </HStack>

                {combinedLoading || !percentile ? (
                  <VStack spacing={3} align="stretch">
                    <Skeleton h={4} w="40%" />
                    <Skeleton h={3} w="100%" />
                    <Skeleton h={4} w="60%" />
                  </VStack>
                ) : (
                  <Fade in={!combinedLoading}>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color={subTextColor}>当前价格</Text>
                        <Text
                          fontSize="2xl"
                          fontWeight={700}
                          color={getPercentileColor(percentile.percentile)}
                        >
                          {formatPrice(percentile.currentPrice)}
                        </Text>
                      </HStack>
                      <Progress
                        value={percentile.percentile}
                        size="lg"
                        colorScheme={
                          percentile.percentile >= 80
                            ? 'red'
                            : percentile.percentile <= 20
                            ? 'green'
                            : 'orange'
                        }
                        borderRadius="full"
                        bg={useColorModeValue('gray.100', 'gray.700')}
                      />
                      <HStack justify="space-between">
                        <Text fontSize="xs" color={subTextColor}>
                          最低 {formatPrice(percentile.minPrice)}
                        </Text>
                        <Badge
                          colorScheme={
                            percentile.percentile >= 80
                              ? 'red'
                              : percentile.percentile <= 20
                              ? 'green'
                              : 'orange'
                          }
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          历史 {percentile.percentile.toFixed(1)}% 分位
                        </Badge>
                        <Text fontSize="xs" color={subTextColor}>
                          最高 {formatPrice(percentile.maxPrice)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Fade>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <StatCard
            title="同比变化 (YoY)"
            value={yoyData ? formatPercent(yoyData.change) : '--'}
            icon={yoyData && yoyData.change >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            changePercent={yoyData?.change}
            isLoading={combinedLoading}
            accentColor="purple"
          />
        </GridItem>

        <GridItem>
          <StatCard
            title="环比变化 (MoM)"
            value={periodChange ? formatPercent(periodChange.changePercent) : '--'}
            icon={periodChange && periodChange.changePercent >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            changePercent={periodChange?.changePercent}
            isLoading={combinedLoading}
            accentColor="blue"
          />
        </GridItem>
      </Grid>
    </VStack>
  );
}
