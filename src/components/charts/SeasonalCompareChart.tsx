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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyPrice } from '@/types';
import { formatPrice } from '@/utils/formatters';

interface SeasonalCompareChartProps {
  yearlyData: { year: number; data: DailyPrice[] }[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}

const YEAR_COLORS: Record<number, string> = {
  2021: '#A0AEC0',
  2022: '#718096',
  2023: '#2D6A4F',
  2024: '#F77F00',
  2025: '#E53E3E',
};

interface SeasonalTooltipEntry {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: SeasonalTooltipEntry[]; label?: string }) => {
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
          <Text fontSize="xs" color="gray.500" fontWeight={500}>第 {label} 天</Text>
          {payload.map((p: SeasonalTooltipEntry, idx: number) => (
            <HStack key={idx} justify="space-between" w="100%">
              <HStack spacing={2}>
                <Box
                  w={2.5}
                  h={2.5}
                  borderRadius="full"
                  bg={p.color}
                />
                <Text fontSize="sm" color="gray.600">{p.name}年:</Text>
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

export default function SeasonalCompareChart({
  yearlyData,
  title = '历史价格对比',
  isLoading = false,
  height = 380,
}: SeasonalCompareChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');

  const chartData = useMemo(() => {
    const maxDays = 365;
    const days: number[] = [];
    for (let i = 1; i <= maxDays; i++) {
      days.push(i);
    }

    return days.map((day) => {
      const row: Record<string, number> = { day: day };
      yearlyData.forEach(({ year, data }) => {
        const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
        if (sorted.length >= day) {
          row[year] = sorted[day - 1].avgPrice;
        }
      });
      return row;
    });
  }, [yearlyData]);

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
            <Text fontSize="xs" color={subTextColor}>
              {yearlyData.length} 年历史数据叠加对比
            </Text>
          </VStack>
          <HStack>
            {yearlyData.map(({ year }) => (
              <Badge
                key={year}
                px={2}
                py={0.5}
                borderRadius="md"
                bg={YEAR_COLORS[year] || 'gray.400'}
                color="white"
                fontSize="xs"
              >
                {year}年
              </Badge>
            ))}
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
            <Text color={subTextColor}>暂无历史数据</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <Box h={height} w="100%" p={4}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `D${v}`}
                    interval={30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => `${value}年`}
                  />
                  {yearlyData.map(({ year }) => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={year.toString()}
                      stroke={YEAR_COLORS[year] || '#718096'}
                      strokeWidth={year === 2024 || year === 2025 ? 3 : 1.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      strokeDasharray={year < 2024 ? '5 5' : undefined}
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

export { YEAR_COLORS };
