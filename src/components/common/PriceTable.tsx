import { useState, useMemo } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  Text,
  HStack,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { DailyPrice } from '@/types';
import { formatPrice, formatPercent } from '@/utils/formatters';

export interface PriceTableRow {
  id: string;
  fruitId: string;
  fruitName: string;
  marketId: string;
  marketName: string;
  highPrice: number;
  lowPrice: number;
  avgPrice: number;
  changePercent: number;
}

export interface PriceTableProps {
  data: PriceTableRow[];
  title?: string;
  showChange?: boolean;
}

type SortKey = 'fruitName' | 'marketName' | 'highPrice' | 'lowPrice' | 'avgPrice' | 'changePercent';
type SortDirection = 'asc' | 'desc';

function SortIndicator({ sortKey, currentKey, direction }: {
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDirection;
}) {
  if (sortKey !== currentKey) {
    return <ChevronsUpDown size={14} className="opacity-40" />;
  }
  return direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

export default function PriceTable({
  data,
  title = '最新价格行情',
  showChange = true,
}: PriceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avgPrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const headerHoverBg = useColorModeValue('gray.100', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const zebraBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('brand.50', 'gray.700');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal), 'zh-CN');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'price.up';
    if (change < 0) return 'price.down';
    return 'gray.500';
  };

  return (
    <Card bg={cardBg} variant="outline">
      <CardBody p="0">
        <Box px="5" py="4" borderBottom="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            {title}
          </Text>
          <Text fontSize="sm" color="gray.500" mt="1">
            共 {data.length} 条记录
          </Text>
        </Box>
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th
                  cursor="pointer"
                  userSelect="none"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: headerHoverBg }}
                  transition="background-color 0.2s ease"
                  onClick={() => handleSort('fruitName')}
                >
                  <HStack spacing="1">
                    <Text>品种</Text>
                    <SortIndicator sortKey="fruitName" currentKey={sortKey} direction={sortDirection} />
                  </HStack>
                </Th>
                <Th
                  cursor="pointer"
                  userSelect="none"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: headerHoverBg }}
                  transition="background-color 0.2s ease"
                  onClick={() => handleSort('marketName')}
                >
                  <HStack spacing="1">
                    <Text>市场</Text>
                    <SortIndicator sortKey="marketName" currentKey={sortKey} direction={sortDirection} />
                  </HStack>
                </Th>
                <Th
                  isNumeric
                  cursor="pointer"
                  userSelect="none"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: headerHoverBg }}
                  transition="background-color 0.2s ease"
                  onClick={() => handleSort('highPrice')}
                >
                  <HStack spacing="1" justify="flex-end">
                    <Text>最高价</Text>
                    <SortIndicator sortKey="highPrice" currentKey={sortKey} direction={sortDirection} />
                  </HStack>
                </Th>
                <Th
                  isNumeric
                  cursor="pointer"
                  userSelect="none"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: headerHoverBg }}
                  transition="background-color 0.2s ease"
                  onClick={() => handleSort('lowPrice')}
                >
                  <HStack spacing="1" justify="flex-end">
                    <Text>最低价</Text>
                    <SortIndicator sortKey="lowPrice" currentKey={sortKey} direction={sortDirection} />
                  </HStack>
                </Th>
                <Th
                  isNumeric
                  cursor="pointer"
                  userSelect="none"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: headerHoverBg }}
                  transition="background-color 0.2s ease"
                  onClick={() => handleSort('avgPrice')}
                >
                  <HStack spacing="1" justify="flex-end">
                    <Text>均价</Text>
                    <SortIndicator sortKey="avgPrice" currentKey={sortKey} direction={sortDirection} />
                  </HStack>
                </Th>
                {showChange && (
                  <Th
                    isNumeric
                    cursor="pointer"
                    userSelect="none"
                    bg={headerBg}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _hover={{ bg: headerHoverBg }}
                    transition="background-color 0.2s ease"
                    onClick={() => handleSort('changePercent')}
                  >
                    <HStack spacing="1" justify="flex-end">
                      <Text>日涨跌幅</Text>
                      <SortIndicator sortKey="changePercent" currentKey={sortKey} direction={sortDirection} />
                    </HStack>
                  </Th>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((row, idx) => (
                <Tr
                  key={row.id}
                  bg={idx % 2 === 1 ? zebraBg : 'transparent'}
                  _hover={{ bg: rowHoverBg }}
                  transition="background-color 0.15s ease"
                >
                  <Td fontWeight="medium" color={textColor}>
                    {row.fruitName}
                  </Td>
                  <Td color="gray.600">{row.marketName}</Td>
                  <Td isNumeric color={textColor}>{formatPrice(row.highPrice, '')}</Td>
                  <Td isNumeric color="gray.600">{formatPrice(row.lowPrice, '')}</Td>
                  <Td isNumeric fontWeight="semibold" color={textColor}>
                    {formatPrice(row.avgPrice, '')}
                  </Td>
                  {showChange && (
                    <Td isNumeric>
                      <Text
                        fontWeight="semibold"
                        color={getChangeColor(row.changePercent)}
                        fontSize="sm"
                      >
                        {formatPercent(row.changePercent)}
                      </Text>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        {data.length === 0 && (
          <Box py="12" textAlign="center">
            <Text color="gray.500">暂无数据</Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}

export function fromDailyPrices(
  prices: DailyPrice[],
  fruitMap: Record<string, string>,
  marketMap: Record<string, string>
): PriceTableRow[] {
  return prices.map((price, idx) => ({
    id: `${price.fruitId}-${price.marketId}-${price.date}-${idx}`,
    fruitId: price.fruitId,
    fruitName: fruitMap[price.fruitId] || price.fruitId,
    marketId: price.marketId,
    marketName: marketMap[price.marketId] || price.marketId,
    highPrice: price.highPrice,
    lowPrice: price.lowPrice,
    avgPrice: price.avgPrice,
    changePercent: 0,
  }));
}
