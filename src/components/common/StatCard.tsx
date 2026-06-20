import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';
import { formatPercent } from '@/utils/formatters';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  colorScheme?: 'brand' | 'accent' | 'blue' | 'purple' | 'orange' | 'teal';
  prefix?: string;
  suffix?: string;
}

const colorSchemeMap: Record<NonNullable<StatCardProps['colorScheme']>, { bg: string; color: string }> = {
  brand: { bg: 'brand.50', color: 'brand.500' },
  accent: { bg: 'accent.50', color: 'accent.500' },
  blue: { bg: 'blue.50', color: 'blue.500' },
  purple: { bg: 'purple.50', color: 'purple.500' },
  orange: { bg: 'orange.50', color: 'orange.500' },
  teal: { bg: 'teal.50', color: 'teal.500' },
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  colorScheme = 'brand',
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const colors = colorSchemeMap[colorScheme];
  const cardBg = useColorModeValue('white', 'gray.800');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'white');

  return (
    <Card bg={cardBg} variant="outline" h="full">
      <CardBody>
        <Flex justify="space-between" align="flex-start">
          <Stat flex="1">
            <StatLabel color={labelColor} fontSize="sm" fontWeight="medium" mb="2">
              {title}
            </StatLabel>
            <StatNumber
              color={valueColor}
              fontSize="3xl"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </StatNumber>
            {typeof change === 'number' && (
              <StatHelpText mt="2" fontSize="sm">
                <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
                {formatPercent(change)}
              </StatHelpText>
            )}
          </Stat>
          {Icon && (
            <Box
              bg={colors.bg}
              color={colors.color}
              p="3"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              ml="4"
            >
              <Icon size={24} />
            </Box>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}
