import { useEffect, useMemo } from 'react';
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

export default function SeasonalAnalysis() {
  const { loadAllData, isLoading, fruits, markets, filters, setSelectedFruits, setSelectedMarkets } = useDataStore();

  const selectedFruitId = filters.selectedFruits.length > 0
    ? filters.selectedFruits[0]
    : fruits[0]?.id;
  const selectedMarketId = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets[0]
    : markets[0]?.id;

  const { singleSeriesPrices, percentile, periodChange } = usePriceData({
    fruitId: selectedFruitId,
    marketId: selectedMarketId,
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const yearlyData = useMemo(() => {
    if (!selectedFruitId || !selectedMarketId) return [];

    const priceMap = new Map<number, typeof singleSeriesPrices>();

    singleSeriesPrices.forEach((p) => {
      const year = new Date(p.date).getFullYear();
      if (!priceMap.has(year)) {
        priceMap.set(year, []);
      }
      priceMap.get(year)!.push(p);
    });

    return Array.from(priceMap.entries())
      .map(([year, data]) => ({ year, data }))
      .sort((a, b) => b.year - a.year)
      .slice(0, 3)
      .sort((a, b) => a.year - b.year);
  }, [singleSeriesPrices, selectedFruitId, selectedMarketId]);

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
        isLoading={isLoading}
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

                {isLoading || !percentile ? (
                  <VStack spacing={3} align="stretch">
                    <Skeleton h={4} w="40%" />
                    <Skeleton h={3} w="100%" />
                    <Skeleton h={4} w="60%" />
                  </VStack>
                ) : (
                  <Fade in={!isLoading}>
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
            isLoading={isLoading}
            accentColor="purple"
          />
        </GridItem>

        <GridItem>
          <StatCard
            title="环比变化 (MoM)"
            value={periodChange ? formatPercent(periodChange.changePercent) : '--'}
            icon={periodChange && periodChange.changePercent >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            changePercent={periodChange?.changePercent}
            isLoading={isLoading}
            accentColor="blue"
          />
        </GridItem>
      </Grid>
    </VStack>
  );
}
