import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Info,
} from 'lucide-react';
import type { PriceAnomaly, Fruit, Market } from '@/types';
import {
  formatDateCN,
  formatPercent,
  getSeverityLabel,
  getAnomalyTypeLabel,
} from '@/utils/formatters';

interface AnomalyCardProps {
  anomaly: PriceAnomaly;
  fruit?: Fruit;
  market?: Market;
}

export default function AnomalyCard({ anomaly, fruit, market }: AnomalyCardProps) {
  const isSpike = anomaly.type === 'spike';
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const getSeverityBg = () => {
    switch (anomaly.severity) {
      case 'high':
        return useColorModeValue('red.50', 'red.900');
      case 'medium':
        return useColorModeValue('orange.50', 'orange.900');
      case 'low':
        return useColorModeValue('yellow.50', 'yellow.900');
    }
  };

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w={1.5}
        bg={isSpike ? 'price.up' : 'price.down'}
      />
      <CardBody p={5} pl={6}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="start">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                borderRadius="lg"
                bg={getSeverityBg()}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {isSpike ? (
                  <TrendingUp size={20} color="inherit" />
                ) : (
                  <TrendingDown size={20} color="inherit" />
                )}
              </Box>
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Text fontWeight={700} color={textColor} fontSize="md">
                    {fruit?.name || anomaly.fruitId}
                  </Text>
                  <Badge variant={`severity-${anomaly.severity}`} px={2} py={0.5} borderRadius="md">
                    {getSeverityLabel(anomaly.severity)}风险
                  </Badge>
                </HStack>
                <HStack spacing={3}>
                  <HStack spacing={1}>
                    <MapPin size={12} />
                    <Text fontSize="xs" color={subTextColor}>
                      {market?.name || anomaly.marketId}
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Calendar size={12} />
                    <Text fontSize="xs" color={subTextColor}>
                      {formatDateCN(anomaly.date)}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
            <VStack align="end" spacing={1}>
              <Text
                fontSize="2xl"
                fontWeight={800}
                color={isSpike ? 'price.up' : 'price.down'}
              >
                {formatPercent(anomaly.changePercent)}
              </Text>
              <Badge
                variant={isSpike ? 'price-up' : 'price-down'}
                px={2}
                py={0.5}
                borderRadius="md"
              >
                {getAnomalyTypeLabel(anomaly.type)}
              </Badge>
            </VStack>
          </HStack>

          <Box
            p={3}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
          >
            <HStack align="start" spacing={2}>
              <Info size={16} color="inherit" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={textColor}>
                  {anomaly.description}
                </Text>
                <HStack spacing={2}>
                  <AlertTriangle size={12} />
                  <Text fontSize="xs" color={subTextColor}>
                    可能原因: {anomaly.possibleReason}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </MotionCard>
  );
}
