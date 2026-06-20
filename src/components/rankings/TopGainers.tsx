import { useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  useTheme,
  Badge,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { DailyPrice, Fruit, Market, PriceChange } from '@/types';
import { getTopGainers } from '@/utils/priceUtils';
import { formatPrice, formatPercent } from '@/utils/formatters';

interface TopGainersProps {
  priceData: DailyPrice[];
  fruits: Fruit[];
  markets: Market[];
  limit?: number;
}

interface GainerItem extends PriceChange {
  rank: number;
  fruitName: string;
  marketName: string;
}

const MotionBox = motion(Box);

export default function TopGainers({ priceData, fruits, markets, limit = 10 }: TopGainersProps) {
  const theme = useTheme();

  const gainers = useMemo(() => {
    const topList = getTopGainers(priceData, limit);
    return topList.map((item) => {
      const fruit = fruits.find((f) => f.id === item.fruitId);
      const market = markets.find((m) => m.id === item.marketId);
      return {
        ...item,
        fruitName: fruit?.name || item.fruitId,
        marketName: market ? `${market.name}（${market.city}）` : item.marketId,
      } as GainerItem;
    });
  }, [priceData, fruits, markets, limit]);

  const maxChange = useMemo(() => {
    if (gainers.length === 0) return 0;
    return Math.max(...gainers.map((g) => Math.abs(g.changePercent)));
  }, [gainers]);

  if (gainers.length === 0) {
    return (
      <Box h="200px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">暂无数据</Text>
      </Box>
    );
  }

  const topColors = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
  };

  return (
    <VStack spacing={3} align="stretch" w="100%">
      {gainers.map((item, index) => {
        const progressWidth = maxChange > 0 ? (Math.abs(item.changePercent) / maxChange) * 100 : 0;
        const rankColor = topColors[item.rank as 1 | 2 | 3] || theme.colors.gray[400];

        return (
          <MotionBox
            key={`${item.fruitId}-${item.marketId}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ borderColor: theme.colors.price.up, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            p={3}
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.100"
          >
            <Flex align="center" mb={2}>
              <Flex
                w="28px"
                h="28px"
                borderRadius="md"
                bg={item.rank <= 3 ? rankColor : theme.colors.gray[100]}
                align="center"
                justify="center"
                mr={3}
                flexShrink={0}
              >
                <Text
                  fontWeight="700"
                  fontSize="sm"
                  color={item.rank <= 3 ? 'white' : theme.colors.gray[600]}
                >
                  {item.rank}
                </Text>
              </Flex>
              <Box flex="1" minW={0}>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="600" color="gray.800" fontSize="sm" noOfLines={1}>
                    {item.fruitName}
                  </Text>
                  <Badge
                    bg="red.50"
                    color={theme.colors.price.up}
                    fontSize="xs"
                    fontWeight="600"
                    px={2}
                    py={0.5}
                  >
                    {formatPercent(item.changePercent)}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
                  {item.marketName}
                </Text>
              </Box>
            </Flex>

            <Flex align="center" ml="40px">
              <Box
                flex="1"
                h="8px"
                bg="gray.50"
                borderRadius="full"
                overflow="hidden"
                mr={3}
                position="relative"
              >
                <MotionBox
                  h="100%"
                  borderRadius="full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
                  style={{
                    background: `linear-gradient(90deg, ${theme.colors.price.up}99, ${theme.colors.price.up})`,
                  }}
                />
              </Box>
              <Text fontSize="sm" fontWeight="600" color={theme.colors.price.up} flexShrink={0}>
                {formatPrice(item.currentPrice)}
              </Text>
            </Flex>
          </MotionBox>
        );
      })}
    </VStack>
  );
}
