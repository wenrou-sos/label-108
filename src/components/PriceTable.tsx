import { useMemo } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  VStack,
  Skeleton,
  useColorModeValue,
  Badge,
  Fade,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { formatPrice, formatPercent, formatVolume } from '@/utils/formatters';
import { calculatePriceChange } from '@/utils/priceUtils';
import type { DailyPrice } from '@/types';

type SortKey = 'fruit' | 'market' | 'price' | 'change' | 'volume';
type SortOrder = 'asc' | 'desc';

interface PriceTableProps {
  isLoading?: boolean;
}

export default function PriceTable({ isLoading = false }: PriceTableProps) {
  const { fruits, markets, dailyPrices, filters, loadAllData } = useDataStore();
  const [sortKey, setSortKey] = useState<SortKey>('change');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const tableData = useMemo(() => {
    const fruitMap = new Map(fruits.map((f) => [f.id, f]));
    const marketMap = new Map(markets.map((m) => [m.id, m]));

    const filteredFruits = filters.selectedFruits.length > 0
      ? filters.selectedFruits
      : fruits.map((f) => f.id);
    const filteredMarkets = filters.selectedMarkets.length > 0
      ? filters.selectedMarkets
      : markets.map((m) => m.id);

    const pricesByKey = new Map<string, DailyPrice[]>();

    dailyPrices.forEach((p) => {
      if (!filteredFruits.includes(p.fruitId)) return;
      if (!filteredMarkets.includes(p.marketId)) return;
      if (p.date < filters.dateRange.start || p.date > filters.dateRange.end) return;
      const key = `${p.fruitId}-${p.marketId}`;
      if (!pricesByKey.has(key)) {
        pricesByKey.set(key, []);
      }
      pricesByKey.get(key)!.push(p);
    });

    const rows: Array<{
      fruitId: string;
      fruitName: string;
      marketId: string;
      marketName: string;
      avgPrice: number;
      highPrice: number;
      lowPrice: number;
      volume: number;
      changePercent: number;
      isImported: boolean;
    }> = [];

    pricesByKey.forEach((prices, key) => {
      const [fruitId, marketId] = key.split('-');
      const sorted = prices.sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length === 0) return;

      const latest = sorted[sorted.length - 1];
      const change = calculatePriceChange(dailyPrices, fruitId, marketId);
      const fruit = fruitMap.get(fruitId);
      const market = marketMap.get(marketId);

      rows.push({
        fruitId,
        fruitName: fruit?.name || fruitId,
        marketId,
        marketName: market?.name || marketId,
        avgPrice: latest.avgPrice,
        highPrice: latest.highPrice,
        lowPrice: latest.lowPrice,
        volume: latest.volume,
        changePercent: change?.changePercent || 0,
        isImported: fruit?.isImported || false,
      });
    });

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'fruit':
          cmp = a.fruitName.localeCompare(b.fruitName);
          break;
        case 'market':
          cmp = a.marketName.localeCompare(b.marketName);
          break;
        case 'price':
          cmp = a.avgPrice - b.avgPrice;
          break;
        case 'change':
          cmp = a.changePercent - b.changePercent;
          break;
        case 'volume':
          cmp = a.volume - b.volume;
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return rows.slice(0, 50);
  }, [dailyPrices, fruits, markets, filters, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ active, order }: { active: boolean; order: SortOrder }) => {
    if (!active) return <ArrowUpDown size={14} />;
    return order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
    >
      <CardHeader
        py={4}
        px={5}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack justify="space-between">
          <VStack align="start" spacing={0.5}>
            <Heading size="sm" color={textColor}>
              价格行情
            </Heading>
            <Text fontSize="xs" color={subTextColor}>
              共 {tableData.length} 条数据
            </Text>
          </VStack>
          <Tooltip label="刷新数据">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={loadAllData}
              aria-label="刷新"
              isLoading={isLoading}
            >
              <RefreshCw size={16} />
            </IconButton>
          </Tooltip>
        </HStack>
      </CardHeader>
      <CardBody p={0} overflowX="auto">
        {isLoading ? (
          <VStack p={4} spacing={3} align="stretch">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} h={12} borderRadius="md" />
            ))}
          </VStack>
        ) : tableData.length === 0 ? (
          <VStack p={12} spacing={2}>
            <Text color={subTextColor}>暂无行情数据</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <Box minW="800px">
              <Table variant="simple" size="sm">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th
                      cursor="pointer"
                      onClick={() => handleSort('fruit')}
                      userSelect="none"
                    >
                      <HStack spacing={1}>
                        <Text>品种</Text>
                        <SortIcon active={sortKey === 'fruit'} order={sortOrder} />
                      </HStack>
                    </Th>
                    <Th
                      cursor="pointer"
                      onClick={() => handleSort('market')}
                      userSelect="none"
                    >
                      <HStack spacing={1}>
                        <Text>市场</Text>
                        <SortIcon active={sortKey === 'market'} order={sortOrder} />
                      </HStack>
                    </Th>
                    <Th
                      cursor="pointer"
                      onClick={() => handleSort('price')}
                      userSelect="none"
                      isNumeric
                    >
                      <HStack justify="flex-end" spacing={1}>
                        <Text>最新价</Text>
                        <SortIcon active={sortKey === 'price'} order={sortOrder} />
                      </HStack>
                    </Th>
                    <Th isNumeric>最高/最低</Th>
                    <Th
                      cursor="pointer"
                      onClick={() => handleSort('change')}
                      userSelect="none"
                      isNumeric
                    >
                      <HStack justify="flex-end" spacing={1}>
                        <Text>涨跌幅</Text>
                        <SortIcon active={sortKey === 'change'} order={sortOrder} />
                      </HStack>
                    </Th>
                    <Th
                      cursor="pointer"
                      onClick={() => handleSort('volume')}
                      userSelect="none"
                      isNumeric
                    >
                      <HStack justify="flex-end" spacing={1}>
                        <Text>成交量</Text>
                        <SortIcon active={sortKey === 'volume'} order={sortOrder} />
                      </HStack>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tableData.map((row, idx) => (
                    <Tr
                      key={`${row.fruitId}-${row.marketId}-${idx}`}
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      transition="background 0.2s"
                    >
                      <Td>
                        <HStack spacing={2}>
                          <Text fontWeight={500} color={textColor}>
                            {row.fruitName}
                          </Text>
                          {row.isImported && (
                            <Badge size="sm" colorScheme="orange" variant="subtle" borderRadius="full">
                              进口
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td color={subTextColor} fontSize="sm">
                        {row.marketName}
                      </Td>
                      <Td isNumeric fontWeight={600} color={textColor}>
                        {formatPrice(row.avgPrice)}
                      </Td>
                      <Td isNumeric fontSize="sm">
                        <VStack align="end" spacing={0}>
                          <Text color="price.up">{formatPrice(row.highPrice)}</Text>
                          <Text color="price.down">{formatPrice(row.lowPrice)}</Text>
                        </VStack>
                      </Td>
                      <Td isNumeric>
                        <Badge
                          variant={row.changePercent >= 0 ? 'price-up' : 'price-down'}
                          borderRadius="md"
                          px={2}
                          py={0.5}
                        >
                          {formatPercent(row.changePercent)}
                        </Badge>
                      </Td>
                      <Td isNumeric color={subTextColor} fontSize="sm">
                        {formatVolume(row.volume)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Fade>
        )}
      </CardBody>
    </MotionCard>
  );
}
