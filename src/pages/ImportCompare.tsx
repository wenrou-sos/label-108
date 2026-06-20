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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Skeleton,
} from '@chakra-ui/react';
import { ArrowLeftRight, TrendingUp, ChevronDown } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { usePriceData } from '@/hooks/usePriceData';
import StatCard from '@/components/StatCard';
import PremiumTrendChart from '@/components/charts/PremiumTrendChart';
import { formatPrice, formatPercent } from '@/utils/formatters';

const IMPORTED_FRUIT_MAP: Record<string, { importedId: string; domesticId: string | null }> = {
  cherry: { importedId: 'cherry', domesticId: 'cherry-domestic' },
  durian: { importedId: 'durian', domesticId: null },
  blueberry: { importedId: 'blueberry', domesticId: 'blueberry-domestic' },
  mangosteen: { importedId: 'mangosteen', domesticId: null },
  avocado: { importedId: 'avocado', domesticId: null },
};

export default function ImportCompare() {
  const { loadAllData, isLoading, fruits, markets, filters, setSelectedFruits, setSelectedMarkets, dailyPrices } = useDataStore();

  const importedFruits = useMemo(() => fruits.filter((f) => f.isImported), [fruits]);

  const selectedFruitId = filters.selectedFruits.length > 0
    ? filters.selectedFruits[0]
    : importedFruits[0]?.id;

  const selectedMarketId = filters.selectedMarkets.length > 0
    ? filters.selectedMarkets[0]
    : markets[0]?.id;

  const selectedFruit = fruits.find((f) => f.id === selectedFruitId);

  const domesticCounterpartId = useMemo(() => {
    if (!selectedFruit) return undefined;
    
    if (selectedFruit.domesticCounterpart) {
      const match = fruits.find(
        (f) => (f.name === selectedFruit.domesticCounterpart || 
                selectedFruit.domesticCounterpart.includes(f.name)) && !f.isImported
      );
      if (match) return match.id;
    }
    
    const domesticInCategory = fruits.find(
      (f) => f.category === selectedFruit.category && !f.isImported && f.id !== selectedFruit.id
    );
    return domesticInCategory?.id;
  }, [selectedFruit, fruits]);

  const { getPricesForFruitMarket } = usePriceData();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const importedPrices = useMemo(
    () => (selectedFruitId && selectedMarketId ? getPricesForFruitMarket(selectedFruitId, selectedMarketId) : []),
    [selectedFruitId, selectedMarketId, getPricesForFruitMarket]
  );

  const domesticPrices = useMemo(
    () => (domesticCounterpartId && selectedMarketId ? getPricesForFruitMarket(domesticCounterpartId, selectedMarketId) : []),
    [domesticCounterpartId, selectedMarketId, getPricesForFruitMarket]
  );

  const comparisonStats = useMemo(() => {
    if (importedPrices.length === 0) {
      return {
        importedAvg: 0,
        domesticAvg: 0,
        premium: 0,
        premiumPercent: 0,
        importedVolume: 0,
        domesticVolume: 0,
      };
    }

    const importedAvg = importedPrices.reduce((s, p) => s + p.avgPrice, 0) / importedPrices.length;
    const domesticAvg =
      domesticPrices.length > 0
        ? domesticPrices.reduce((s, p) => s + p.avgPrice, 0) / domesticPrices.length
        : 0;

    const premium = importedAvg - domesticAvg;
    const premiumPercent = domesticAvg > 0 ? (premium / domesticAvg) * 100 : 0;

    const importedVolume = importedPrices.reduce((s, p) => s + p.volume, 0);
    const domesticVolume = domesticPrices.reduce((s, p) => s + p.volume, 0);

    return {
      importedAvg,
      domesticAvg,
      premium,
      premiumPercent,
      importedVolume,
      domesticVolume,
    };
  }, [importedPrices, domesticPrices]);

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const domesticFruit = domesticCounterpartId
    ? fruits.find((f) => f.id === domesticCounterpartId)
    : undefined;

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          进口与国产对比
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          对比进口水果与国产同类的价格、品质与供应量
        </Text>
      </VStack>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
        <CardBody p={5}>
          <HStack justify="space-between" flexWrap="wrap" spacing={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color={subTextColor}>当前品种</Text>
              <HStack spacing={2}>
                <Heading size="md" color={headingColor}>
                  {selectedFruit?.name || '请选择进口水果'}
                </Heading>
                <Badge colorScheme="orange" variant="subtle" px={2} py={0.5} borderRadius="md">
                  进口
                </Badge>
              </HStack>
              <Text fontSize="xs" color={subTextColor}>
                主产地: {selectedFruit?.mainOrigins.join('、')}
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
                    {importedFruits.map((f) => (
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
            title={`${selectedFruit?.name || '进口'}均价`}
            value={formatPrice(comparisonStats.importedAvg)}
            icon={<TrendingUp size={22} />}
            isLoading={isLoading}
            accentColor="red"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title={`${domesticFruit?.name || '国产'}均价`}
            value={domesticFruit ? formatPrice(comparisonStats.domesticAvg) : '--'}
            icon={<TrendingUp size={22} />}
            isLoading={isLoading}
            accentColor="green"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="溢价金额"
            value={domesticFruit ? formatPrice(comparisonStats.premium) : '--'}
            icon={<ArrowLeftRight size={22} />}
            isLoading={isLoading}
            accentColor="purple"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="溢价率"
            value={domesticFruit ? formatPercent(comparisonStats.premiumPercent) : '--'}
            icon={<ArrowLeftRight size={22} />}
            changePercent={comparisonStats.premiumPercent}
            isLoading={isLoading}
            accentColor="accent"
          />
        </GridItem>
      </Grid>

      <PremiumTrendChart
        importedData={importedPrices}
        domesticData={domesticPrices}
        importedName={selectedFruit?.name || '进口'}
        domesticName={domesticFruit?.name || '国产'}
        title="价格走势与溢价率"
        isLoading={isLoading}
      />

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" overflow="hidden">
        <CardBody p={0}>
          {isLoading ? (
            <VStack p={6} spacing={3} align="stretch">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={12} w="100%" borderRadius="md" />
              ))}
            </VStack>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th>对比维度</Th>
                  <Th isNumeric>
                    <HStack justify="flex-end" spacing={2}>
                      <Badge colorScheme="orange" variant="subtle" px={2} py={0.5} borderRadius="md">
                        进口
                      </Badge>
                      <Text>{selectedFruit?.name}</Text>
                    </HStack>
                  </Th>
                  <Th isNumeric>
                    <HStack justify="flex-end" spacing={2}>
                      <Badge colorScheme="green" variant="subtle" px={2} py={0.5} borderRadius="md">
                        国产
                      </Badge>
                      <Text>{domesticFruit?.name || '--'}</Text>
                    </HStack>
                  </Th>
                  <Th isNumeric>差异</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td fontWeight={500} color={headingColor}>
                    平均价格
                  </Td>
                  <Td isNumeric color="price.up" fontWeight={600}>
                    {formatPrice(comparisonStats.importedAvg)}
                  </Td>
                  <Td isNumeric color="price.down" fontWeight={600}>
                    {domesticFruit ? formatPrice(comparisonStats.domesticAvg) : '--'}
                  </Td>
                  <Td isNumeric>
                    <Badge
                      variant={comparisonStats.premiumPercent >= 0 ? 'price-up' : 'price-down'}
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {domesticFruit ? formatPercent(comparisonStats.premiumPercent) : '--'}
                    </Badge>
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight={500} color={headingColor}>
                    品质等级
                  </Td>
                  <Td isNumeric>
                    <Badge colorScheme="orange" variant="subtle" px={2} py={0.5} borderRadius="md">
                      优
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <Badge colorScheme="green" variant="subtle" px={2} py={0.5} borderRadius="md">
                      良
                    </Badge>
                  </Td>
                  <Td isNumeric color={subTextColor}>
                    进口更高
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight={500} color={headingColor}>
                    供应量
                  </Td>
                  <Td isNumeric>
                    {comparisonStats.importedVolume > 0
                      ? `${(comparisonStats.importedVolume / 1000).toFixed(1)}千吨`
                      : '--'}
                  </Td>
                  <Td isNumeric>
                    {domesticFruit && comparisonStats.domesticVolume > 0
                      ? `${(comparisonStats.domesticVolume / 1000).toFixed(1)}千吨`
                      : '--'}
                  </Td>
                  <Td isNumeric color={subTextColor}>
                    {comparisonStats.domesticVolume > comparisonStats.importedVolume
                      ? '国产更充足'
                      : '进口更充足'}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight={500} color={headingColor}>
                    主产地
                  </Td>
                  <Td isNumeric color={subTextColor} fontSize="sm">
                    {selectedFruit?.mainOrigins.slice(0, 2).join('、') || '--'}
                  </Td>
                  <Td isNumeric color={subTextColor} fontSize="sm">
                    {domesticFruit?.mainOrigins.slice(0, 2).join('、') || '--'}
                  </Td>
                  <Td isNumeric color={subTextColor}>
                    --
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
