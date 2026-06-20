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
  Tooltip,
  Badge,
  Tag,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import type { Fruit, CorrelationResult } from '@/types';

interface CorrelationRecommendationsProps {
  targetFruit: Fruit | undefined;
  positiveCorrelations: CorrelationResult[];
  negativeCorrelations: CorrelationResult[];
  fruits: Fruit[];
  isLoading?: boolean;
  onCorrelationClick?: (result: CorrelationResult) => void;
}

const getCorrelationBarColor = (corr: number): string => {
  const abs = Math.abs(corr);
  if (corr >= 0) {
    if (abs >= 0.8) return 'red.600';
    if (abs >= 0.6) return 'red.500';
    if (abs >= 0.4) return 'red.400';
    if (abs >= 0.2) return 'red.300';
    return 'red.200';
  } else {
    if (abs >= 0.8) return 'blue.600';
    if (abs >= 0.6) return 'blue.500';
    if (abs >= 0.4) return 'blue.400';
    if (abs >= 0.2) return 'blue.300';
    return 'blue.200';
  }
};

const CorrelationBar = ({ correlation }: { correlation: number }) => {
  const barColor = getCorrelationBarColor(correlation);
  const width = `${Math.abs(correlation) * 100}%`;

  return (
    <Box w="100%" h={2} bg="gray.200" borderRadius="full" overflow="hidden" _dark={{ bg: 'gray.600' }}>
      <Box
        h="100%"
        w={width}
        bg={barColor}
        borderRadius="full"
        transition="width 0.5s ease"
      />
    </Box>
  );
};

const CorrelationItem = ({
  result,
  fruit,
  rank,
  type,
  onClick,
}: {
  result: CorrelationResult;
  fruit: Fruit | undefined;
  rank: number;
  type: 'positive' | 'negative';
  onClick?: () => void;
}) => {
  if (!fruit) return null;

  const accentColor = type === 'positive' ? 'red' : 'blue';
  const Icon = type === 'positive' ? ArrowUpRight : ArrowDownRight;

  return (
    <Tooltip
      label={
        <VStack align="start" spacing={1}>
          <Text fontWeight={600}>{fruit.name}</Text>
          <Text fontSize="xs">相关系数: {result.correlation.toFixed(4)}</Text>
          <Text fontSize="xs">样本量: {result.sampleSize} 天</Text>
          <Text fontSize="xs" color="blue.400" mt={1}>点击查看详细对比</Text>
        </VStack>
      }
      fontSize="xs"
      placement="right"
      hasArrow
    >
      <Box
        cursor="pointer"
        onClick={onClick}
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="transparent"
        _hover={{
          borderColor: `${accentColor}.200`,
          bg: type === 'positive' ? 'rgba(254, 215, 215, 0.3)' : 'rgba(190, 227, 248, 0.3)',
          transform: 'translateX(4px)',
        }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={2}>
            <Box
              w={6}
              h={6}
              borderRadius="md"
              bg={`${accentColor}.100`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              _dark={{ bg: `${accentColor}.900` }}
            >
              <Text fontSize="xs" fontWeight={700} color={`${accentColor}.600`}>
                {rank}
              </Text>
            </Box>
            <HStack spacing={1.5}>
              <Text fontSize="sm" fontWeight={600}>
                {fruit.name}
              </Text>
              {fruit.isImported && (
                <Tag size="xs" colorScheme="orange" borderRadius="full">进口</Tag>
              )}
            </HStack>
          </HStack>
          <HStack spacing={1}>
            <Badge colorScheme={accentColor} variant="subtle" px={2} py={0.5} borderRadius="md">
              <HStack spacing={0.5}>
                <Icon size={11} />
                <Text fontSize="11px" fontWeight={700}>
                  {result.correlation > 0 ? '+' : ''}{result.correlation.toFixed(2)}
                </Text>
              </HStack>
            </Badge>
          </HStack>
        </Flex>
        <HStack justify="space-between" spacing={3}>
          <Box flex={1}>
            <CorrelationBar correlation={result.correlation} />
          </Box>
          <Text fontSize="10px" color="gray.500" whiteSpace="nowrap">
            n={result.sampleSize}
          </Text>
        </HStack>
      </Box>
    </Tooltip>
  );
};

export default function CorrelationRecommendations({
  targetFruit,
  positiveCorrelations,
  negativeCorrelations,
  fruits,
  isLoading = false,
  onCorrelationClick,
}: CorrelationRecommendationsProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const fruitMap = useMemo(() => {
    const map = new Map<string, Fruit>();
    fruits.forEach((f) => map.set(f.id, f));
    return map;
  }, [fruits]);

  const MotionCard = motion(Card);

  if (isLoading) {
    return (
      <MotionCard
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
      >
        <CardHeader py={4} px={5} borderBottom="1px solid" borderColor={borderColor}>
          <Skeleton h={6} w="80%" />
        </CardHeader>
        <CardBody p={5}>
          <VStack spacing={4}>
            <Skeleton h={20} w="100%" borderRadius="md" />
            <Skeleton h={20} w="100%" borderRadius="md" />
          </VStack>
        </CardBody>
      </MotionCard>
    );
  }

  return (
    <MotionCard
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
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
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Sparkles size={18} className="text-yellow-500" />
            <Heading size="sm" color={textColor}>
              关联品种推荐
            </Heading>
          </HStack>
          {targetFruit ? (
            <HStack spacing={2}>
              <Text fontSize="xs" color={subTextColor}>
                基于
              </Text>
              <Tag size="sm" colorScheme="brand" borderRadius="full" variant="subtle">
                {targetFruit.name}
              </Tag>
              <Text fontSize="xs" color={subTextColor}>
                的价格走势智能匹配
              </Text>
            </HStack>
          ) : (
            <Text fontSize="xs" color={subTextColor}>
              请选择一个品种查看关联推荐
            </Text>
          )}
        </VStack>
      </CardHeader>

      <CardBody p={5}>
        <Fade in={!isLoading}>
          <VStack align="stretch" spacing={5}>
            <Box>
              <HStack spacing={2} mb={3}>
                <TrendingUp size={15} className="text-red-500" />
                <Text fontSize="sm" fontWeight={600} color="red.600" _dark={{ color: 'red.400' }}>
                  正相关 TOP 3
                </Text>
                <Text fontSize="xs" color={subTextColor}>
                  （价格同涨同跌）
                </Text>
              </HStack>
              {positiveCorrelations.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {positiveCorrelations.map((res, idx) => (
                    <CorrelationItem
                      key={`pos-${res.fruitIdB}`}
                      result={res}
                      fruit={fruitMap.get(res.fruitIdB)}
                      rank={idx + 1}
                      type="positive"
                      onClick={() => onCorrelationClick?.(res)}
                    />
                  ))}
                </VStack>
              ) : (
                <Box
                  p={6}
                  textAlign="center"
                  border="1px dashed"
                  borderColor="gray.200"
                  borderRadius="lg"
                  _dark={{ borderColor: 'gray.600' }}
                >
                  <Text fontSize="sm" color={subTextColor}>
                    {targetFruit ? '暂无足够样本量的正相关品种' : '请先选择品种'}
                  </Text>
                </Box>
              )}
            </Box>

            <Divider />

            <Box>
              <HStack spacing={2} mb={3}>
                <TrendingDown size={15} className="text-blue-500" />
                <Text fontSize="sm" fontWeight={600} color="blue.600" _dark={{ color: 'blue.400' }}>
                  负相关 TOP 3
                </Text>
                <Text fontSize="xs" color={subTextColor}>
                  （价格此消彼长）
                </Text>
              </HStack>
              {negativeCorrelations.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {negativeCorrelations.map((res, idx) => (
                    <CorrelationItem
                      key={`neg-${res.fruitIdB}`}
                      result={res}
                      fruit={fruitMap.get(res.fruitIdB)}
                      rank={idx + 1}
                      type="negative"
                      onClick={() => onCorrelationClick?.(res)}
                    />
                  ))}
                </VStack>
              ) : (
                <Box
                  p={6}
                  textAlign="center"
                  border="1px dashed"
                  borderColor="gray.200"
                  borderRadius="lg"
                  _dark={{ borderColor: 'gray.600' }}
                >
                  <Text fontSize="sm" color={subTextColor}>
                    {targetFruit ? '暂无足够样本量的负相关品种' : '请先选择品种'}
                  </Text>
                </Box>
              )}
            </Box>

            <Box
              p={3}
              bg="yellow.50"
              border="1px solid"
              borderColor="yellow.200"
              borderRadius="lg"
              _dark={{ bg: 'yellow.900', borderColor: 'yellow.700' }}
            >
              <Text fontSize="11px" color="yellow.800" _dark={{ color: 'yellow.200' }} lineHeight={1.6}>
                💡 采购建议：正相关品种需注意联合采购风险，一方涨价可能带动另一方；
                负相关品种可作为对冲组合，一方高位时增加另一方采购比例。
              </Text>
            </Box>
          </VStack>
        </Fade>
      </CardBody>
    </MotionCard>
  );
}
