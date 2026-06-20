import { useMemo, useState, useCallback } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from 'recharts';
import { Box, Text, useTheme, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import type { DailyPrice, WeatherEvent, WeatherType } from '@/types';
import { formatDate, formatPrice, getWeatherTypeLabel, getSeverityLabel } from '@/utils/formatters';

interface WeatherImpactChartProps {
  priceData: DailyPrice[];
  weatherData: WeatherEvent[];
  fruitId?: string;
  marketId?: string;
  height?: number;
}

interface ChartDataPoint {
  date: string;
  avgPrice: number;
  weatherEvents?: WeatherEvent[];
}

interface WeatherDot {
  date: string;
  price: number;
  event: WeatherEvent;
}

const WEATHER_SHAPES: Record<WeatherType, 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'wye'> = {
  frost: 'circle',
  hail: 'square',
  typhoon: 'triangle',
  rain: 'diamond',
  drought: 'star',
  heatwave: 'wye',
};

function CustomTooltip({ active, payload, label, weatherPoints }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  weatherPoints: WeatherDot[];
}) {
  const theme = useTheme();
  if (!active || !payload || payload.length === 0) return null;

  const pricePayload = payload.find((p) => p.name === 'avgPrice');
  const currentWeather = weatherPoints.filter((w) => w.date === label);

  return (
    <Box
      bg="white"
      p={3}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="md"
      minW="220px"
      maxW="280px"
    >
      <Text fontWeight="600" color="gray.800" mb={2}>
        {formatDate(label as string)}
      </Text>
      {pricePayload && (
        <Text fontSize="sm" color="gray.600" mb={2}>
          均价:{' '}
          <Text as="span" fontWeight="600" color={theme.colors.brand[600]}>
            {formatPrice(pricePayload.value)}
          </Text>
        </Text>
      )}
      {currentWeather.length > 0 && (
        <>
          <Text fontSize="sm" fontWeight="600" color="gray.700" mb={1} pt={1} borderTop="1px solid" borderColor="gray.100">
            天气事件:
          </Text>
          {currentWeather.map((w, idx) => (
            <Box key={idx} mb={1}>
              <Badge
                bg={theme.colors.weather[w.event.type]}
                color="white"
                fontSize="xs"
                mr={2}
              >
                {getWeatherTypeLabel(w.event.type)}
              </Badge>
              <Badge fontSize="xs" variant="outline" colorScheme="gray">
                {getSeverityLabel(w.event.severity)}
              </Badge>
              <Text fontSize="xs" color="gray.600" mt={1}>
                {w.event.description}
              </Text>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}

function CustomLegend() {
  const theme = useTheme();
  const weatherTypes: WeatherType[] = ['frost', 'hail', 'typhoon', 'rain', 'drought', 'heatwave'];

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      gap={3}
      px={2}
      py={1}
    >
      <Box display="flex" alignItems="center">
        <Box
          w="16px"
          h="2px"
          bg={theme.colors.brand[500]}
          mr={2}
        />
        <Text fontSize="sm" color={theme.colors.gray[700]}>
          价格
        </Text>
      </Box>
      {weatherTypes.map((type) => (
        <Box key={type} display="flex" alignItems="center">
          <Box
            w="10px"
            h="10px"
            borderRadius="full"
            bg={theme.colors.weather[type]}
            mr={2}
          />
          <Text fontSize="sm" color={theme.colors.gray[700]}>
            {getWeatherTypeLabel(type)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export default function WeatherImpactChart({
  priceData,
  weatherData,
  fruitId,
  marketId,
  height = 400,
}: WeatherImpactChartProps) {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);

  const { chartData, weatherPoints, availableWeatherTypes } = useMemo(() => {
    if (priceData.length === 0) return { chartData: [], weatherPoints: [] as WeatherDot[], availableWeatherTypes: [] as WeatherType[] };

    let filteredPrices = priceData;
    if (fruitId) {
      filteredPrices = filteredPrices.filter((d) => d.fruitId === fruitId);
    }
    if (marketId) {
      filteredPrices = filteredPrices.filter((d) => d.marketId === marketId);
    }

    const sortedPrices = [...filteredPrices].sort((a, b) => a.date.localeCompare(b.date));
    const priceMap = new Map<string, number>();
    sortedPrices.forEach((p) => {
      priceMap.set(p.date, p.avgPrice);
    });

    const relevantWeather = weatherData.filter((w) => {
      if (!fruitId) return true;
      return w.affectedFruits.includes(fruitId);
    });

    const weatherByDate = new Map<string, WeatherEvent[]>();
    const foundTypes = new Set<WeatherType>();

    relevantWeather.forEach((event) => {
      if (!weatherByDate.has(event.date)) {
        weatherByDate.set(event.date, []);
      }
      weatherByDate.get(event.date)!.push(event);
      foundTypes.add(event.type);
    });

    const chartPoints: ChartDataPoint[] = sortedPrices.map((p) => ({
      date: p.date,
      avgPrice: p.avgPrice,
      weatherEvents: weatherByDate.get(p.date),
    }));

    const dots: WeatherDot[] = [];
    weatherByDate.forEach((events, date) => {
      const price = priceMap.get(date);
      if (price !== undefined) {
        events.forEach((event) => {
          dots.push({ date, price, event });
        });
      }
    });

    return {
      chartData: chartPoints,
      weatherPoints: dots,
      availableWeatherTypes: Array.from(foundTypes),
    };
  }, [priceData, weatherData, fruitId, marketId]);

  const handleScatterClick = useCallback((entry: { payload: WeatherDot }) => {
    setSelectedEvent(entry.payload.event);
  }, []);

  if (chartData.length === 0) {
    return (
      <Box h={height} display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">暂无数据</Text>
      </Box>
    );
  }

  return (
    <>
      <Box h={height} w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.gray[100]} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => formatDate(val, 'MM-dd')}
              tick={{ fontSize: 12, fill: theme.colors.gray[600] }}
              stroke={theme.colors.gray[300]}
            />
            <YAxis
              tick={{ fontSize: 12, fill: theme.colors.gray[600] }}
              stroke={theme.colors.gray[300]}
              tickFormatter={(val) => `${val.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip weatherPoints={weatherPoints} />} />
            <Legend content={<CustomLegend />} verticalAlign="top" height={40} />

            <Line
              type="monotone"
              dataKey="avgPrice"
              name="avgPrice"
              stroke={theme.colors.brand[500]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={800}
            />

            {availableWeatherTypes.map((type) => {
              const points = weatherPoints
                .filter((w) => w.event.type === type)
                .map((w) => ({ date: w.date, price: w.price, event: w.event }));
              return (
                <Scatter
                  key={type}
                  data={points}
                  x="date"
                  y="price"
                  dataKey="price"
                  fill={theme.colors.weather[type]}
                  shape={WEATHER_SHAPES[type]}
                  isAnimationActive={true}
                  animationDuration={800}
                  onClick={handleScatterClick as (entry: unknown) => void}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Badge
              bg={selectedEvent ? theme.colors.weather[selectedEvent.type] : 'gray.500'}
              color="white"
              fontSize="sm"
              mr={2}
            >
              {selectedEvent && getWeatherTypeLabel(selectedEvent.type)}
            </Badge>
            <Badge fontSize="sm" variant="outline" colorScheme="gray">
              {selectedEvent && getSeverityLabel(selectedEvent.severity)}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {selectedEvent && (
              <>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <Text as="span" fontWeight="500" color="gray.800">日期:</Text>{' '}
                  {formatDate(selectedEvent.date)}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <Text as="span" fontWeight="500" color="gray.800">地区:</Text>{' '}
                  {selectedEvent.region}
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <Text as="span" fontWeight="500" color="gray.800">影响天数:</Text>{' '}
                  {selectedEvent.impactDays} 天
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="500" color="gray.800">描述:</Text>{' '}
                  {selectedEvent.description}
                </Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
