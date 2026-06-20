import { useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Flex,
  Tag,
} from '@chakra-ui/react';
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
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DailyPrice, Fruit, CorrelationResult } from '@/types';
import { formatDateShort, formatPrice, formatPercent } from '@/utils/formatters';

interface CorrelationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  correlation: CorrelationResult | null;
  fruitA: Fruit | undefined;
  fruitB: Fruit | undefined;
  pricesA: DailyPrice[];
  pricesB: DailyPrice[];
}

const COLOR_A = '#2D6A4F';
const COLOR_B = '#E53E3E';

const getCorrelationStrengthLabel = (corr: number): { label: string; color: string; icon: typeof TrendingUp } => {
  if (corr >= 0.8) return { label: '极强正相关', color: 'red', icon: TrendingUp };
  if (corr >= 0.6) return { label: '强正相关', color: 'red', icon: TrendingUp };
  if (corr >= 0.4) return { label: '中等正相关', color: 'orange', icon: TrendingUp };
  if (corr >= 0.2) return { label: '弱正相关', color: 'yellow', icon: TrendingUp };
  if (corr >= -0.2) return { label: '极弱/无相关', color: 'gray', icon: Minus };
  if (corr >= -0.4) return { label: '弱负相关', color: 'cyan', icon: TrendingDown };
  if (corr >= -0.6) return { label: '中等负相关', color: 'blue', icon: TrendingDown };
  if (corr >= -0.8) return { label: '强负相关', color: 'blue', icon: TrendingDown };
  return { label: '极强负相关', color: 'blue', icon: TrendingDown };
};

const getInsightText = (corr: number, fruitAName: string, fruitBName: string): string => {
  if (corr >= 0.7) {
    return `${fruitAName}和${fruitBName}价格走势高度同步，${fruitAName}涨价时${fruitBName}大概率也会涨。采购时可关注组合定价策略，若同时采购两者需注意联合风险。`;
  }
  if (corr >= 0.4) {
    return `${fruitAName}和${fruitBName}价格有一定正相关，${fruitAName}价格波动可能传导至${fruitBName}。建议在制定采购计划时联动观察。`;
  }
  if (corr > -0.4) {
    return `${fruitAName}和${fruitBName}价格关联度较低，各自受供需因素影响独立定价。可独立制定采购策略。`;
  }
  if (corr > -0.7) {
    return `${fruitAName}和${fruitBName}价格呈一定负相关，${fruitAName}涨价时${fruitBName}可能有回落倾向。可考虑作为互补品种搭配采购以分散风险。`;
  }
  return `${fruitAName}和${fruitBName}价格呈显著负相关，两者走势相反。是很好的对冲品种组合，可在${fruitAName}高位时增加${fruitBName}采购比例。`;
};

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
                <Box w={2.5} h={2.5} borderRadius="full" bg={p.color} />
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

export default function CorrelationDetailModal({
  isOpen,
  onClose,
  correlation,
  fruitA,
  fruitB,
  pricesA,
  pricesB,
}: CorrelationDetailModalProps) {
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const modalBg = useColorModeValue('white', 'gray.800');

  const chartData = useMemo(() => {
    if (pricesA.length === 0 && pricesB.length === 0) return [];

    const dateMap = new Map<string, { date: string; [key: string]: string | number | undefined }>();

    pricesA.forEach((p) => {
      const key = p.date;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: formatDateShort(key) });
      }
      const entry = dateMap.get(key)!;
      if (fruitA) entry[fruitA.name] = p.avgPrice;
    });

    pricesB.forEach((p) => {
      const key = p.date;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: formatDateShort(key) });
      }
      const entry = dateMap.get(key)!;
      if (fruitB) entry[fruitB.name] = p.avgPrice;
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [pricesA, pricesB, fruitA, fruitB]);

  const statsA = useMemo(() => {
    if (pricesA.length === 0) return null;
    const sorted = [...pricesA].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const prices = sorted.map((p) => p.avgPrice);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const changePct = ((last.avgPrice - first.avgPrice) / first.avgPrice) * 100;
    return { current: last.avgPrice, avg, min, max, changePct, days: sorted.length };
  }, [pricesA]);

  const statsB = useMemo(() => {
    if (pricesB.length === 0) return null;
    const sorted = [...pricesB].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const prices = sorted.map((p) => p.avgPrice);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const changePct = ((last.avgPrice - first.avgPrice) / first.avgPrice) * 100;
    return { current: last.avgPrice, avg, min, max, changePct, days: sorted.length };
  }, [pricesB]);

  if (!correlation || !fruitA || !fruitB) return null;

  const strength = getCorrelationStrengthLabel(correlation.correlation);
  const InsightIcon = strength.icon;
  const insightText = getInsightText(correlation.correlation, fruitA.name, fruitB.name);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={modalBg}>
        <ModalHeader>
          <VStack align="start" spacing={3}>
            <HStack spacing={3} flexWrap="wrap">
              <HStack spacing={2}>
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={COLOR_A}
                />
                <Text fontSize="lg" fontWeight={700} color={headingColor}>
                  {fruitA.name}
                </Text>
                {fruitA.isImported && (
                  <Tag size="sm" colorScheme="orange" borderRadius="full">进口</Tag>
                )}
              </HStack>
              <Text fontSize="lg" fontWeight={600} color={subTextColor}>
                vs
              </Text>
              <HStack spacing={2}>
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={COLOR_B}
                />
                <Text fontSize="lg" fontWeight={700} color={headingColor}>
                  {fruitB.name}
                </Text>
                {fruitB.isImported && (
                  <Tag size="sm" colorScheme="orange" borderRadius="full">进口</Tag>
                )}
              </HStack>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme={strength.color} variant="subtle" px={3} py={1} borderRadius="md" fontSize="sm">
                <HStack spacing={1}>
                  <InsightIcon size={14} />
                  <Text>{strength.label}</Text>
                </HStack>
              </Badge>
              <Badge colorScheme="purple" variant="outline" px={3} py={1} borderRadius="md">
                相关系数: {correlation.correlation > 0 ? '+' : ''}{correlation.correlation.toFixed(4)}
              </Badge>
              <Badge colorScheme="teal" variant="outline" px={3} py={1} borderRadius="md">
                样本量: {correlation.sampleSize} 天
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <VStack align="stretch" spacing={6}>
            <Box
              bg={cardBg}
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={2} mb={2}>
                <Text fontSize="sm" fontWeight={600} color={headingColor}>
                  采购决策建议
                </Text>
              </HStack>
              <Text fontSize="sm" color={subTextColor} lineHeight={1.7}>
                {insightText}
              </Text>
            </Box>

            <SimpleGrid columns={2} spacing={4}>
              <Box
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                borderLeft="4px solid"
                borderLeftColor={COLOR_A}
              >
                <Text fontSize="sm" fontWeight={600} color={COLOR_A} mb={3}>
                  {fruitA.name} 统计
                </Text>
                {statsA ? (
                  <SimpleGrid columns={2} spacing={3}>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>最新价</StatLabel>
                      <StatNumber fontSize="md" color={headingColor}>
                        {formatPrice(statsA.current)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>区间涨跌</StatLabel>
                      <StatNumber
                        fontSize="md"
                        color={statsA.changePct >= 0 ? 'price.up' : 'price.down'}
                      >
                        {formatPercent(statsA.changePct)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>均价</StatLabel>
                      <StatNumber fontSize="md" color={headingColor}>
                        {formatPrice(statsA.avg)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>最高/最低</StatLabel>
                      <StatHelpText fontSize="xs">
                        {formatPrice(statsA.max)} / {formatPrice(statsA.min)}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                ) : (
                  <Text fontSize="sm" color={subTextColor}>暂无数据</Text>
                )}
              </Box>

              <Box
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                borderLeft="4px solid"
                borderLeftColor={COLOR_B}
              >
                <Text fontSize="sm" fontWeight={600} color={COLOR_B} mb={3}>
                  {fruitB.name} 统计
                </Text>
                {statsB ? (
                  <SimpleGrid columns={2} spacing={3}>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>最新价</StatLabel>
                      <StatNumber fontSize="md" color={headingColor}>
                        {formatPrice(statsB.current)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>区间涨跌</StatLabel>
                      <StatNumber
                        fontSize="md"
                        color={statsB.changePct >= 0 ? 'price.up' : 'price.down'}
                      >
                        {formatPercent(statsB.changePct)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>均价</StatLabel>
                      <StatNumber fontSize="md" color={headingColor}>
                        {formatPrice(statsB.avg)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel fontSize="xs" color={subTextColor}>最高/最低</StatLabel>
                      <StatHelpText fontSize="xs">
                        {formatPrice(statsB.max)} / {formatPrice(statsB.min)}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                ) : (
                  <Text fontSize="sm" color={subTextColor}>暂无数据</Text>
                )}
              </Box>
            </SimpleGrid>

            <Box
              h={360}
              w="100%"
              p={2}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: subTextColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                    tickFormatter={(v) => `¥${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey={fruitA.name}
                    stroke={COLOR_A}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    isAnimationActive
                  />
                  <Line
                    type="monotone"
                    dataKey={fruitB.name}
                    stroke={COLOR_B}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <HStack spacing={3}>
                <HStack spacing={1.5}>
                  <Box w={2.5} h={2.5} borderRadius="full" bg={COLOR_A} />
                  <Text fontSize="xs" color={subTextColor}>
                    {fruitA.name} ({statsA?.days || 0} 条数据)
                  </Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Box w={2.5} h={2.5} borderRadius="full" bg={COLOR_B} />
                  <Text fontSize="xs" color={subTextColor}>
                    {fruitB.name} ({statsB?.days || 0} 条数据)
                  </Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" color={subTextColor}>
                数据对齐样本量: {correlation.sampleSize} 天（仅计算两品种同时有数据的日期）
              </Text>
            </Flex>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="brand" onClick={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
