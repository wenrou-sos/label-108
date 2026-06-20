import { useEffect, useState } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Grid,
  GridItem,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useAnomalyData } from '@/hooks/useAnomalyData';
import StatCard from '@/components/StatCard';
import AnomalyCard from '@/components/AnomalyCard';
import type { AnomalySeverity } from '@/types';

export default function AnomalyDetection() {
  const { loadAllData, isLoading, fruits, markets } = useDataStore();
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity[]>([]);

  const { anomalies, stats } = useAnomalyData({
    severities: severityFilter.length > 0 ? severityFilter : undefined,
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const toggleSeverity = (severity: AnomalySeverity) => {
    setSeverityFilter((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <VStack spacing={6} align="stretch">
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={headingColor}>
          价格异常检测
        </Heading>
        <Text fontSize="sm" color={subTextColor}>
          实时监测价格异常波动，预警风险事件
        </Text>
      </VStack>

      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        <GridItem>
          <StatCard
            title="高风险异常"
            value={stats.highSeverity}
            icon={<AlertTriangle size={22} />}
            isLoading={isLoading}
            accentColor="red"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="中风险异常"
            value={stats.mediumSeverity}
            icon={<AlertTriangle size={22} />}
            isLoading={isLoading}
            accentColor="orange"
          />
        </GridItem>
        <GridItem>
          <StatCard
            title="低风险异常"
            value={stats.lowSeverity}
            icon={<AlertTriangle size={22} />}
            isLoading={isLoading}
            accentColor="yellow"
          />
        </GridItem>
      </Grid>

      <HStack justify="space-between" flexWrap="wrap" spacing={3}>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" color={subTextColor}>
            共检测到 {anomalies.length} 条异常记录
          </Text>
        </VStack>
        <ButtonGroup size="sm" variant="outline" isAttached>
          <Button
            variant={severityFilter.length === 0 ? 'solid' : 'outline'}
            onClick={() => setSeverityFilter([])}
          >
            全部
          </Button>
          <Button
            variant={severityFilter.includes('high') ? 'solid' : 'outline'}
            colorScheme="red"
            onClick={() => toggleSeverity('high')}
          >
            高风险
          </Button>
          <Button
            variant={severityFilter.includes('medium') ? 'solid' : 'outline'}
            colorScheme="orange"
            onClick={() => toggleSeverity('medium')}
          >
            中风险
          </Button>
          <Button
            variant={severityFilter.includes('low') ? 'solid' : 'outline'}
            colorScheme="yellow"
            onClick={() => toggleSeverity('low')}
          >
            低风险
          </Button>
        </ButtonGroup>
      </HStack>

      <VStack spacing={3} align="stretch">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <StatCard
              key={idx}
              title=""
              value=""
              icon={<AlertTriangle size={22} />}
              isLoading
            />
          ))
        ) : anomalies.length === 0 ? (
          <VStack py={12} spacing={2}>
            <AlertTriangle size={48} color="inherit" />
            <Text color={subTextColor}>暂无异常记录</Text>
          </VStack>
        ) : (
          anomalies.map((anomaly) => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              fruit={fruits.find((f) => f.id === anomaly.fruitId)}
              market={markets.find((m) => m.id === anomaly.marketId)}
            />
          ))
        )}
      </VStack>
    </VStack>
  );
}
