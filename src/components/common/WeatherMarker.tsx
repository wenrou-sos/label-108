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
  VStack,
} from '@chakra-ui/react';
import {
  CloudRain,
  Snowflake,
  Wind,
  Sun,
  Thermometer,
  CloudLightning,
  Droplets,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherEvent, WeatherType, WeatherSeverity } from '@/types';
import {
  formatDateCN,
  getSeverityLabel,
  getWeatherTypeLabel,
} from '@/utils/formatters';

export interface WeatherMarkerProps {
  weather: WeatherEvent;
  affectedFruitNames?: string[];
  onClick?: () => void;
}

const weatherIconMap: Record<WeatherType, LucideIcon> = {
  frost: Snowflake,
  hail: CloudLightning,
  typhoon: Wind,
  rain: CloudRain,
  drought: Sun,
  heatwave: Thermometer,
};

const weatherColorMap: Record<WeatherType, { bg: string; color: string; borderColor: string }> = {
  frost: { bg: 'blue.50', color: 'weather.frost', borderColor: 'blue.200' },
  hail: { bg: 'gray.100', color: 'weather.hail', borderColor: 'gray.300' },
  typhoon: { bg: 'purple.50', color: 'weather.typhoon', borderColor: 'purple.200' },
  rain: { bg: 'blue.50', color: 'weather.rain', borderColor: 'blue.200' },
  drought: { bg: 'yellow.50', color: 'weather.drought', borderColor: 'yellow.200' },
  heatwave: { bg: 'red.50', color: 'weather.heatwave', borderColor: 'red.200' },
};

const severityColorMap: Record<WeatherSeverity, { bg: string; color: string }> = {
  light: { bg: 'green.50', color: 'green.600' },
  moderate: { bg: 'yellow.50', color: 'yellow.600' },
  severe: { bg: 'red.50', color: 'red.600' },
};

export default function WeatherMarker({
  weather,
  affectedFruitNames,
  onClick,
}: WeatherMarkerProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const WeatherIcon = weatherIconMap[weather.type];
  const weatherColors = weatherColorMap[weather.type];
  const severityColors = severityColorMap[weather.severity];

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
        bg={weatherColors.color}
      />
      <CardBody pl="6">
        <Flex justify="space-between" align="flex-start" mb="3">
          <HStack spacing="3">
            <Box
              bg={weatherColors.bg}
              color={weatherColors.color}
              p="2.5"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <WeatherIcon size={22} />
            </Box>
            <VStack align="flex-start" spacing="0">
              <Text fontSize="md" fontWeight="bold" color={textColor}>
                {getWeatherTypeLabel(weather.type)}
              </Text>
              <Text fontSize="sm" color={labelColor}>
                {formatDateCN(weather.date)}
              </Text>
            </VStack>
          </HStack>
          <VStack align="flex-end" spacing="1">
            <Badge
              variant="subtle"
              bg={severityColors.bg}
              color={severityColors.color}
              px="3"
              py="1"
              borderRadius="md"
            >
              <HStack spacing="1">
                <Droplets size={12} />
                <Text fontSize="xs" fontWeight="medium">
                  {getSeverityLabel(weather.severity)}
                </Text>
              </HStack>
            </Badge>
            {weather.impactDays > 0 && (
              <Text fontSize="xs" color={labelColor}>
                影响 {weather.impactDays} 天
              </Text>
            )}
          </VStack>
        </Flex>

        <HStack spacing="6" mb="3">
          <Box flex="1">
            <Text fontSize="xs" color={labelColor} mb="1">
              影响地区
            </Text>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              {weather.region}
            </Text>
          </Box>
        </HStack>

        {(affectedFruitNames && affectedFruitNames.length > 0) || weather.affectedFruits.length > 0 ? (
          <Box mb="3">
            <Text fontSize="xs" color={labelColor} mb="2">
              影响品种
            </Text>
            <HStack spacing="2" flexWrap="wrap">
              {(affectedFruitNames || weather.affectedFruits).map((fruit, idx) => (
                <Tag
                  key={idx}
                  size="sm"
                  variant="subtle"
                  bg={weatherColors.bg}
                  color={weatherColors.color}
                  borderRadius="full"
                >
                  <TagLabel>{fruit}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
        ) : null}

        {weather.description && (
          <Text
            pt="3"
            borderTop="1px solid"
            borderColor={borderColor}
            fontSize="sm"
            color="gray.600"
            lineHeight="tall"
          >
            {weather.description}
          </Text>
        )}
      </CardBody>
    </Card>
  );
}
