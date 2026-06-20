import { ReactNode } from 'react';
import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Skeleton,
  Fade,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPercent } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  changePercent?: number;
  changeLabel?: string;
  isLoading?: boolean;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  changePercent,
  changeLabel,
  isLoading = false,
  accentColor = 'brand',
}: StatCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${accentColor}.50`, `${accentColor}.900`);
  const iconColor = useColorModeValue(`${accentColor}.500`, `${accentColor}.300`);
  const titleColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'gray.100');

  const isUp = changePercent !== undefined && changePercent > 0;
  const isDown = changePercent !== undefined && changePercent < 0;
  const isNeutral = changePercent === 0 || changePercent === undefined;

  const getTrendColor = () => {
    if (isUp) return 'price.up';
    if (isDown) return 'price.down';
    return 'gray.500';
  };

  const getTrendBg = () => {
    if (isUp) return 'red.50';
    if (isDown) return 'green.50';
    return 'gray.50';
  };

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      bg={cardBg}
      border="1px solid"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      boxShadow="sm"
      borderRadius="xl"
    >
      <CardBody p={5}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={3} flex={1}>
            <Text fontSize="sm" color={titleColor} fontWeight={500}>
              {title}
            </Text>
            {isLoading ? (
              <Skeleton h={9} w="60%" />
            ) : (
              <Fade in={!isLoading}>
                <Text fontSize="2xl" fontWeight={700} color={valueColor} lineHeight="1.2">
                  {value}
                </Text>
              </Fade>
            )}
            {changePercent !== undefined && (
              <HStack
                px={2.5}
                py={1}
                borderRadius="md"
                bg={getTrendBg()}
                spacing={1}
              >
                {isLoading ? (
                  <Skeleton h={4} w={16} />
                ) : (
                  <>
                    {isUp && <TrendingUp size={14} color="inherit" />}
                    {isDown && <TrendingDown size={14} color="inherit" />}
                    {isNeutral && <Minus size={14} color="inherit" />}
                    <Text fontSize="xs" fontWeight={600} color={getTrendColor()}>
                      {formatPercent(changePercent)}
                    </Text>
                    {changeLabel && (
                      <Text fontSize="xs" color="gray.500" ml={1}>
                        {changeLabel}
                      </Text>
                    )}
                  </>
                )}
              </HStack>
            )}
          </VStack>
          <Box
            w={12}
            h={12}
            borderRadius="xl"
            bg={iconBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={iconColor}
            flexShrink={0}
          >
            {icon}
          </Box>
        </HStack>
      </CardBody>
    </MotionCard>
  );
}
