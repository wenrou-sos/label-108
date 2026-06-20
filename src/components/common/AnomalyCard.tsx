import {
  Card,
  CardBody,
  Flex,
  Box,
  Text,
  Badge,
  HStack,
  Tag,
  TagLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { PriceAnomaly, AnomalySeverity, AnomalyType } from '@/types';
import {
  formatPercent,
  formatDateCN,
  getSeverityLabel,
  getAnomalyTypeLabel,
} from '@/utils/formatters';

export interface AnomalyCardProps {
  anomaly: PriceAnomaly;
  fruitName?: string;
  marketName?: string;
  onClick?: () => void;
}

const severityColorMap: Record<AnomalySeverity, { bg: string; color: string; label: string }> = {
  low: { bg: 'yellow.50', color: 'severity.low', label: '低' },
  medium: { bg: 'orange.50', color: 'severity.medium', label: '中' },
  high: { bg: 'red.50', color: 'severity.high', label: '高' },
};

const typeColorMap: Record<AnomalyType, { bg: string; color: string; borderColor: string }> = {
  spike: { bg: 'red.50', color: 'price.up', borderColor: 'red.200' },
  drop: { bg: 'green.50', color: 'price.down', borderColor: 'green.200' },
};

export default function AnomalyCard({
  anomaly,
  fruitName,
  marketName,
  onClick,
}: AnomalyCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const typeColors = typeColorMap[anomaly.type];
  const severityColors = severityColorMap[anomaly.severity];
  const TrendIcon = anomaly.type === 'spike' ? TrendingUp : TrendingDown;

  return (
    <Card
      bg={cardBg}
      variant="outline"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={onClick ? { transform: 'translateY(-2px)', boxShadow: 'md' } : undefined}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        bottom="0"
        w="4px"
        bg={typeColors.color}
      />
      <CardBody pl="6">
        <Flex justify="space-between" align="flex-start" mb="3">
          <HStack spacing="2">
            <Box
              bg={typeColors.bg}
              color={typeColors.color}
              p="2"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <TrendIcon size={18} />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="bold" color={typeColors.color}>
                {getAnomalyTypeLabel(anomaly.type)}
              </Text>
              <Text fontSize="xs" color={labelColor}>
                {formatDateCN(anomaly.date)}
              </Text>
            </Box>
          </HStack>
          <HStack spacing="2">
            <Badge
              variant="subtle"
              bg={severityColors.bg}
              color={severityColors.color}
              px="2"
              py="1"
              borderRadius="md"
            >
              <HStack spacing="1">
                <AlertTriangle size={12} />
                <Text fontSize="xs" fontWeight="medium">
                  {getSeverityLabel(anomaly.severity)}风险
                </Text>
              </HStack>
            </Badge>
          </HStack>
        </Flex>

        <HStack spacing="6" mb="3">
          <Box>
            <Text fontSize="xs" color={labelColor} mb="1">
              品种
            </Text>
            <Text fontSize="md" fontWeight="semibold" color={textColor}>
              {fruitName || '未知品种'}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color={labelColor} mb="1">
              市场
            </Text>
            <Text fontSize="md" fontWeight="semibold" color={textColor}>
              {marketName || '未知市场'}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color={labelColor} mb="1">
              涨跌幅
            </Text>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={typeColors.color}
            >
              {formatPercent(anomaly.changePercent)}
            </Text>
          </Box>
        </HStack>

        {anomaly.possibleReason && (
          <Box>
            <Text fontSize="xs" color={labelColor} mb="2">
              可能原因
            </Text>
            <HStack spacing="2" flexWrap="wrap">
              {anomaly.possibleReason.split(/[,，、;；]/).map((reason, idx) => (
                <Tag
                  key={idx}
                  size="sm"
                  variant="subtle"
                  bg="gray.100"
                  color="gray.700"
                  borderRadius="full"
                >
                  <TagLabel>{reason.trim()}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
        )}

        {anomaly.description && (
          <Text
            mt="3"
            pt="3"
            borderTop="1px solid"
            borderColor={borderColor}
            fontSize="sm"
            color="gray.600"
            lineHeight="tall"
          >
            {anomaly.description}
          </Text>
        )}
      </CardBody>
    </Card>
  );
}
