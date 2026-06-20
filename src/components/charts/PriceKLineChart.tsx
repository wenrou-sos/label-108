import { useMemo } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  Text,
  Skeleton,
  useColorModeValue,
  Fade,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { DailyPrice } from '@/types';
import { formatDateShort, formatPrice } from '@/utils/formatters';

interface PriceKLineChartProps {
  data: DailyPrice[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}

interface TooltipPayload {
  payload: DailyPrice & { date: string; isUp: boolean; range: [number, number] };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <Box
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.100"
      >
        <VStack align="start" spacing={1}>
          <Text fontSize="xs" color="gray.500">{label}</Text>
          <HStack>
            <Text fontSize="sm">开:</Text>
            <Text fontSize="sm" fontWeight={600}>{formatPrice(d.openPrice)}</Text>
          </HStack>
          <HStack>
            <Text fontSize="sm">高:</Text>
            <Text fontSize="sm" fontWeight={600} color="price.up">{formatPrice(d.highPrice)}</Text>
          </HStack>
          <HStack>
            <Text fontSize="sm">低:</Text>
            <Text fontSize="sm" fontWeight={600} color="price.down">{formatPrice(d.lowPrice)}</Text>
          </HStack>
          <HStack>
            <Text fontSize="sm">收:</Text>
            <Text fontSize="sm" fontWeight={600}>{formatPrice(d.closePrice)}</Text>
          </HStack>
        </VStack>
      </Box>
    );
  }
  return null;
};

export default function PriceKLineChart({
  data,
  title = '价格走势',
  isLoading = false,
  height = 400,
}: PriceKLineChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: formatDateShort(d.date),
      isUp: d.closePrice >= d.openPrice,
      range: [d.lowPrice, d.highPrice],
    }));
  }, [data]);

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
            <Heading size="sm" color={textColor}>{title}</Heading>
            <Text fontSize="xs" color={subTextColor}>K线图 · 共 {data.length} 个交易日</Text>
          </VStack>
          <HStack>
            <Badge variant="price-up" px={2} py={0.5} borderRadius="md">
              阳线
            </Badge>
            <Badge variant="price-down" px={2} py={0.5} borderRadius="md">
              阴线
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody p={0}>
        {isLoading ? (
          <VStack p={6} spacing={4}>
            <Skeleton h={60} w="100%" borderRadius="md" />
          </VStack>
        ) : chartData.length === 0 ? (
          <VStack p={12} spacing={2}>
            <Text color={subTextColor}>暂无价格数据</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <Box h={height} w="100%" p={4}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="range"
                    name="高低价"
                    barSize={8}
                    isAnimationActive
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isUp ? '#E53E3E' : '#38A169'}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="closePrice"
                    name="收盘价"
                    barSize={4}
                    opacity={0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Fade>
        )}
      </CardBody>
    </MotionCard>
  );
}
