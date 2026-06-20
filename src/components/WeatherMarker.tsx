import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Snowflake,
  Calendar,
  MapPin,
  Leaf,
  Clock,
} from 'lucide-react';
import type { WeatherEvent, Fruit } from '@/types';
import {
  formatDateCN,
  getWeatherTypeLabel,
  getSeverityLabel,
} from '@/utils/formatters';

interface WeatherMarkerProps {
  event: WeatherEvent;
  affectedFruits?: Fruit[];
  priceImpact?: {
    before: number;
    after: number;
    changePercent: number;
  };
}

const WeatherIconMap: Record<string, React.ElementType> = {
  frost: Snowflake,
  hail: CloudLightning,
  typhoon: Wind,
  rain: CloudRain,
  drought: Thermometer,
  heatwave: Thermometer,
};

export default function WeatherMarker({ event, affectedFruits = [], priceImpact }: WeatherMarkerProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const getWeatherColor = () => {
    const colors: Record<string, string> = {
      frost: '#63B3ED',
      hail: '#A0AEC0',
      typhoon: '#553C9A',
      rain: '#3182CE',
      drought: '#D69E2E',
      heatwave: '#E53E3E',
    };
    return colors[event.type] || '#718096';
  };

  const getSeverityBg = () => {
    switch (event.severity) {
      case 'severe':
        return useColorModeValue('red.50', 'red.900');
      case 'moderate':
        return useColorModeValue('orange.50', 'orange.900');
      case 'light':
        return useColorModeValue('blue.50', 'blue.900');
    }
  };

  const WeatherIcon = WeatherIconMap[event.type] || CloudRain;
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
        bg={getWeatherColor()}
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
                color={getWeatherColor()}
              >
                <WeatherIcon size={20} />
              </Box>
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Text fontWeight={700} color={textColor} fontSize="md">
                    {getWeatherTypeLabel(event.type)}
                  </Text>
                  <Badge variant={`severity-${event.severity}`} px={2} py={0.5} borderRadius="md">
                    {getSeverityLabel(event.severity)}
                  </Badge>
                </HStack>
                <HStack spacing={3} flexWrap="wrap">
                  <HStack spacing={1}>
                    <MapPin size={12} />
                    <Text fontSize="xs" color={subTextColor}>
                      {event.region}
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Calendar size={12} />
                    <Text fontSize="xs" color={subTextColor}>
                      {formatDateCN(event.date)}
                    </Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Clock size={12} />
                    <Text fontSize="xs" color={subTextColor}>
                      影响 {event.impactDays} 天
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </HStack>

          <Text fontSize="sm" color={textColor}>
            {event.description}
          </Text>

          {affectedFruits.length > 0 && (
            <HStack flexWrap="wrap" spacing={2}>
              <Leaf size={14} />
              {affectedFruits.map((fruit) => (
                <Badge
                  key={fruit.id}
                  colorScheme="green"
                  variant="subtle"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  fontSize="xs"
                >
                  {fruit.name}
                </Badge>
              ))}
            </HStack>
          )}

          {priceImpact && (
            <Box
              p={3}
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="md"
            >
              <VStack align="start" spacing={2}>
                <Text fontSize="xs" color={subTextColor} fontWeight={500}>
                  价格影响 (事件后7天)
                </Text>
                <HStack justify="space-between" w="100%">
                  <HStack spacing={4}>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={subTextColor}>事件前均价</Text>
                      <Text fontSize="sm" fontWeight={600} color={textColor}>
                        ¥{priceImpact.before.toFixed(2)}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color={subTextColor}>事件后均价</Text>
                      <Text fontSize="sm" fontWeight={600} color={textColor}>
                        ¥{priceImpact.after.toFixed(2)}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="lg"
                    fontWeight={800}
                    color={priceImpact.changePercent >= 0 ? 'price.up' : 'price.down'}
                  >
                    {priceImpact.changePercent >= 0 ? '+' : ''}
                    {priceImpact.changePercent.toFixed(2)}%
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
  );
}
