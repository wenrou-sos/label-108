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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyPrice } from '@/types';
import { formatDateShort, formatPrice } from '@/utils/formatters';

interface MultiLineChartProps {
  seriesData: { name: string; data: DailyPrice[]; color: string }[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}

const COLORS = [
  '#2D6A4F',
  '#F77F00',
  '#3182CE',
  '#D69E2E',
  '#9F7AEA',
  '#E53E3E',
  '#38B2AC',
  '#ED64A6',
];

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.100"
      >
        <VStack align="start" spacing={2}>
          <Text fontSize="xs" color="gray.500" fontWeight={500}>{label}</Text>
          {payload.map((p: TooltipEntry, idx: number) => (
            <HStack key={idx} justify="space-between" w="100%">
              <HStack spacing={2}>
                <Box
                  w={2.5}
                  h={2.5}
                  borderRadius="full"
                  bg={p.color}
                />
                <Text fontSize="sm" color="gray.600">{p.name}:</Text>
              </HStack>
              <Text fontSize="sm" fontWeight={600} color={p.color}>
                {formatPrice(p.value)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    );
  }
  return null;
};

export default function MultiLineChart({
  seriesData,
  title = '多市场价格对比',
  isLoading = false,
  height = 350,
}: MultiLineChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');

  const chartData = useMemo(() => {
    if (seriesData.length === 0) return [];

    const allDates = new Set<string>();
    seriesData.forEach((s) => {
      s.data.forEach((d) => allDates.add(d.date));
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const row: Record<string, string | number | undefined> = { date: formatDateShort(date) };
      seriesData.forEach((s) => {
        const pricePoint = s.data.find((d) => d.date === date);
        if (pricePoint) {
          row[s.name] = pricePoint.avgPrice;
        }
      });
      return row;
    });
  }, [seriesData]);

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
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
        <VStack align="start" spacing={0.5}>
          <Heading size="sm" color={textColor}>{title}</Heading>
          <Text fontSize="xs" color={subTextColor}>
            {seriesData.length} 个市场对比
          </Text>
        </VStack>
      </CardHeader>
      <CardBody p={0}>
        {isLoading ? (
          <VStack p={6} spacing={4}>
            <Skeleton h={60} w="100%" borderRadius="md" />
          </VStack>
        ) : chartData.length === 0 ? (
          <VStack p={12} spacing={2}>
            <Text color={subTextColor}>暂无对比数据</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <Box h={height} w="100%" p={4}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  {seriesData.map((s, idx) => (
                    <Line
                      key={s.name}
                      type="monotone"
                      dataKey={s.name}
                      stroke={s.color || COLORS[idx % COLORS.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      isAnimationActive
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Fade>
        )}
      </CardBody>
    </MotionCard>
  );
}

export { COLORS };
