import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Heading,
  Skeleton,
  useColorModeValue,
  Badge,
  Divider,
  Fade,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PriceChange } from '@/types';
import { useDataStore } from '@/store/useDataStore';
import { formatPrice, formatPercent } from '@/utils/formatters';

interface TopMoversListProps {
  type: 'gainers' | 'losers';
  data: (PriceChange & { rank: number })[];
  isLoading?: boolean;
}

function TopMoversList({ type, data, isLoading = false }: TopMoversListProps) {
  const isGainers = type === 'gainers';
  const headerBg = isGainers ? 'red.50' : 'green.50';
  const headerColor = isGainers ? 'price.up' : 'price.down';
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const { fruits, markets } = useDataStore();

  const getFruitName = (id: string) => fruits.find((f) => f.id === id)?.name || id;
  const getMarketName = (id: string) => markets.find((m) => m.id === id)?.name || id;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: 'yellow.400', color: 'white' };
    if (rank === 2) return { bg: 'gray.300', color: 'white' };
    if (rank === 3) return { bg: 'orange.400', color: 'white' };
    return { bg: 'gray.100', color: 'gray.600' };
  };

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
      h="100%"
    >
      <CardHeader
        py={4}
        px={5}
        bg={headerBg}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack justify="space-between">
          <HStack spacing={2}>
            {isGainers ? (
              <TrendingUp size={20} color="inherit" />
            ) : (
              <TrendingDown size={20} color="inherit" />
            )}
            <Heading size="sm" color={headerColor}>
              {isGainers ? '涨幅榜 TOP 5' : '跌幅榜 TOP 5'}
            </Heading>
          </HStack>
          <Badge variant="subtle" colorScheme={isGainers ? 'red' : 'green'}>
            今日
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody p={0}>
        {isLoading ? (
          <VStack p={4} spacing={3} align="stretch">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} h={14} borderRadius="md" />
            ))}
          </VStack>
        ) : data.length === 0 ? (
          <VStack p={8} spacing={2}>
            <Text color={subTextColor}>暂无数据</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <VStack align="stretch" divider={<Divider />}>
              {data.map((item, idx) => {
                const rankStyle = getRankStyle(item.rank);
                return (
                  <HStack
                    key={`${item.fruitId}-${item.marketId}-${idx}`}
                    px={5}
                    py={3.5}
                    _hover={{ bg: rowHoverBg }}
                    transition="background 0.2s"
                    spacing={3}
                  >
                    <Box
                      w={7}
                      h={7}
                      borderRadius="md"
                      bg={rankStyle.bg}
                      color={rankStyle.color}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      fontWeight={700}
                      flexShrink={0}
                    >
                      {item.rank <= 3 ? <Trophy size={14} /> : item.rank}
                    </Box>
                    <VStack align="start" spacing={0.5} flex={1} minW={0}>
                      <Text
                        fontWeight={600}
                        color={textColor}
                        fontSize="sm"
                        isTruncated
                        w="100%"
                      >
                        {getFruitName(item.fruitId)}
                      </Text>
                      <Text fontSize="xs" color={subTextColor} isTruncated w="100%">
                        {getMarketName(item.marketId)}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={0.5}>
                      <Text fontWeight={700} color={textColor} fontSize="sm">
                        {formatPrice(item.currentPrice)}
                      </Text>
                      <Text
                        fontWeight={600}
                        fontSize="sm"
                        color={isGainers ? 'price.up' : 'price.down'}
                      >
                        {formatPercent(item.changePercent)}
                      </Text>
                    </VStack>
                  </HStack>
                );
              })}
            </VStack>
          </Fade>
        )}
      </CardBody>
    </MotionCard>
  );
}

interface TopGainersProps {
  data: (PriceChange & { rank: number })[];
  isLoading?: boolean;
}

export function TopGainers({ data, isLoading }: TopGainersProps) {
  return <TopMoversList type="gainers" data={data} isLoading={isLoading} />;
}

interface TopLosersProps {
  data: (PriceChange & { rank: number })[];
  isLoading?: boolean;
}

export function TopLosers({ data, isLoading }: TopLosersProps) {
  return <TopMoversList type="losers" data={data} isLoading={isLoading} />;
}
