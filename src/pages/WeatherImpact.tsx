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
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Badge,
} from '@chakra-ui/react';
import { CloudRain, TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useWeatherData } from '@/hooks/useWeatherData';
import { usePriceData } from '@/hooks/usePriceData';
import StatCard from '@/components/StatCard';
import WeatherImpactChart from '@/components/charts/WeatherImpactChart';
import WeatherMarker from '@/components/WeatherMarker';
import { formatPercent } from '@/utils/formatters';

export default function WeatherImpact() {
  const { loadAllData, isLoading, fruits, markets, filters, dailyPrices, setSelectedFruits, setSelectedMarkets } = useDataStore();

  const { events: allEvents } = useWeatherData({});

  const fruitsWithEvents = useMemo(() => {
    const fruitEventCount = new Map<string, number>();
    allEvents.forEach((event) => {
      event.affectedFruits.forEach((fid) => {
        fruitEventCount.set(fid, (fruitEventCount.get(fid) || 0) + 1);
      });
    });
    return fruits
      .filter((f) => (fruitEventCount.get(f.id) || 0) > 0)
      .sort((a, b) => (fruitEventCount.get(b.id) || 0) - (fruitEventCount.get(a.id) || 0));
  }, [allEvents, fruits]);

  const selectedFruitId = useMemo(() => {
    if (filters.selectedFruits.length > 0) {
      return filters.selectedFruits[0];
    }
    return fruitsWithEvents[0]?.id || fruits[0]?.id;
  }, [filters.selectedFruits, fruitsWithEvents, fruits]);

  const selectedMarketId = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets[0]
    : markets[0]?.id;

  const { events, getAffectedFruits, getWeatherImpactOnPrice } = useWeatherData({
    fruitId: selectedFruitId,
  });

  const { singleSeriesPrices } = usePriceData({
    fruitId: selectedFruitId,
    marketId: selectedMarketId,
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const impactStats = useMemo(() => {
    if (events.length === 0 || !selectedFruitId || !selectedMarketId) {
      return {
        avgChange: 0,
        positiveImpacts: 0,
        negativeImpacts: 0,
        avgHistoricalChange: 0,
      };
    }

    let totalChange = 0;
    let positive = 0;
    let negative = 0;
    let validCount = 0;

    events.forEach((event) => {
      const impact = getWeatherImpactOnPrice(event, selectedFruitId, selectedMarketId);
      if (impact) {
        totalChange += impact.changePercent;
        validCount++;
        if (impact.changePercent >= 0) positive++;
        else negative++;
      }
    });

    return {
      avgChange: validCount > 0 ? totalChange / validCount : 0,
      positiveImpacts: positive,
      negativeImpacts: negative,
      avgHistoricalChange: 0,
    };
  }, [events, selectedFruitId, selectedMarketId, getWeatherImpactOnPrice]);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const currentFruit = fruits.find((f) => f.id === selectedFruitId);
  const currentMarket = markets.find((m) => m.id === selectedMarketId);

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          产地天气影响分析
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          关联天气事件与价格波动，量化天气对价格的影响
        </Text>
      </VStack>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody p={5}>
          <HStack justify="space-between" flexWrap="wrap" spacing={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color={subTextColor}>当前筛选</Text>
              <HStack spacing={2}>
                <Heading size="md" color={headingColor}>
                  {currentFruit?.name || '请选择品种'}
                </Heading>
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
                <MenuList maxH="300px" overflowY="auto" minW="200px">
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
            title="天气事件数"
            value={events.length}
            icon={<CloudRain size={22} />}
            isLoading={isLoading}
            accentColor="blue"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="事件后7日平均涨跌"
            value={formatPercent(impactStats.avgChange)}
            icon={impactStats.avgChange >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            changePercent={impactStats.avgChange}
            isLoading={isLoading}
            accentColor="accent"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="推涨事件"
            value={impactStats.positiveImpacts}
            icon={<TrendingUp size={22} />}
            isLoading={isLoading}
            accentColor="red"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="推跌事件"
            value={impactStats.negativeImpacts}
            icon={<TrendingDown size={22} />}
            isLoading={isLoading}
            accentColor="green"
          />
        </GridItem>
      </Grid>

      <WeatherImpactChart
        priceData={singleSeriesPrices}
        weatherData={events}
        fruitId={selectedFruitId}
        marketId={selectedMarketId}
      />

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        gap={4}
      >
        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <CardBody p={5}>
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Calendar size={20} color="inherit" />
                  <Text fontSize="sm" fontWeight={600} color={headingColor}>
                    影响分析
                  </Text>
                </HStack>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={subTextColor}>
                      天气事件后7日平均涨跌幅
                    </Text>
                    <Text
                      fontSize="md"
                      fontWeight={700}
                      color={impactStats.avgChange >= 0 ? 'price.up' : 'price.down'}
                    >
                      {formatPercent(impactStats.avgChange)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={subTextColor}>
                      与历史同期对比
                    </Text>
                    <Text fontSize="md" fontWeight={700} color={headingColor}>
                      --
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <VStack align="start" spacing={2}>
        <Heading size="sm" color={headingColor}>
          天气事件列表
        </Heading>
        <Text fontSize="xs" color={subTextColor}>
          按时间倒序排列，显示价格影响数据
        </Text>
      </VStack>

      <VStack spacing={3} align="stretch">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <StatCard
              key={idx}
              title=""
              value=""
              icon={<CloudRain size={22} />}
              isLoading
            />
          ))
        ) : events.length === 0 ? (
          <VStack py={12} spacing={2}>
            <CloudRain size={48} color="inherit" />
            <Text color={subTextColor}>暂无天气事件记录</Text>
          </VStack>
        ) : (
          events.map((event) => (
            <WeatherMarker
              key={event.id}
              event={event}
              affectedFruits={getAffectedFruits(event)}
              priceImpact={
                selectedFruitId && selectedMarketId
                  ? getWeatherImpactOnPrice(event, selectedFruitId, selectedMarketId) || undefined
                  : undefined
              }
            />
          ))
        )}
      </VStack>
    </VStack>
  );
}
