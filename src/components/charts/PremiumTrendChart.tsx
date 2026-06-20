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
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DailyPrice } from '@/types';
import { formatDateShort, formatPrice, formatPercent } from '@/utils/formatters';

interface PremiumTrendChartProps {
  importedData: DailyPrice[];
  domesticData: DailyPrice[];
  importedName?: string;
  domesticName?: string;
  title?: string;
  isLoading?: boolean;
  height?: number;
}

interface PremiumTooltipEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: PremiumTooltipEntry[]; label?: string }) => {
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
          {payload.map((p: PremiumTooltipEntry, idx: number) => (
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
                {p.dataKey === 'premiumPercent' ? formatPercent(p.value) : formatPrice(p.value)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    );
  }
  return null;
};

export default function PremiumTrendChart({
  importedData,
  domesticData,
  importedName = '进口',
  domesticName = '国产',
  title = '进口与国产价格对比',
  isLoading = false,
  height = 400,
}: PremiumTrendChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');

  const chartData = useMemo(() => {
    const importedSorted = [...importedData].sort((a, b) => a.date.localeCompare(b.date));
    const domesticSorted = [...domesticData].sort((a, b) => a.date.localeCompare(b.date));

    const importedMap = new Map(importedSorted.map((d) => [d.date, d.avgPrice]));
    const domesticMap = new Map(domesticSorted.map((d) => [d.date, d.avgPrice]));

    const allDates = new Set([
      ...importedSorted.map((d) => d.date),
      ...domesticSorted.map((d) => d.date),
    ]);

    return Array.from(allDates)
      .sort()
      .map((date) => {
        const importedPrice = importedMap.get(date);
        const domesticPrice = domesticMap.get(date);
        const premium = importedPrice && domesticPrice ? importedPrice - domesticPrice : null;
        const premiumPercent =
          importedPrice && domesticPrice && domesticPrice > 0
            ? ((importedPrice - domesticPrice) / domesticPrice) * 100
            : null;

        return {
          date: formatDateShort(date),
          [importedName]: importedPrice,
          [domesticName]: domesticPrice,
          premium,
          premiumPercent,
        };
      });
  }, [importedData, domesticData, importedName, domesticName]);

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
              价格走势与溢价率趋势
            </Text>
          </VStack>
          <HStack>
            <Badge variant="price-up" px={2} py={0.5} borderRadius="md">
              {importedName}
            </Badge>
            <Badge variant="price-down" px={2} py={0.5} borderRadius="md">
              {domesticName}
            </Badge>
            <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">
              溢价率
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
            <Text color={subTextColor}>暂无对比数据</Text>
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
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="premiumPercent"
                    name="溢价率"
                    fill="#9F7AEA"
                    fillOpacity={0.1}
                    stroke="#9F7AEA"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={importedName}
                    name={importedName}
                    stroke="#E53E3E"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey={domesticName}
                    name={domesticName}
                    stroke="#38A169"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
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
