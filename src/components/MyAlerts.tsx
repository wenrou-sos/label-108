import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  Button,
  IconButton,
  Tooltip,
  Box,
  Flex,
} from '@chakra-ui/react';
import { Bell, Settings, Check, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlertStore, getConditionLabel, getConditionUnit } from '@/store/useAlertStore';
import { formatPrice, formatPercent } from '@/utils/formatters';
import type { TriggeredAlert, AlertSeverity } from '@/types';

interface AlertItemProps {
  alert: TriggeredAlert;
  onAcknowledge: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const severityStyles: Record<AlertSeverity, { border: string; badge: string; label: string }> = {
    critical: {
      border: 'red.500',
      badge: 'red',
      label: '严重',
    },
    warning: {
      border: 'orange.500',
      badge: 'orange',
      label: '警告',
    },
  };

  const style = severityStyles[alert.severity];
  const time = new Date(alert.triggeredAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPriceCondition = alert.conditionType.startsWith('price');
  const TrendIcon = alert.conditionType.includes('above') ? TrendingUp : TrendingDown;
  const trendColor = alert.conditionType.includes('above') ? 'price.up' : 'price.down';

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderLeft="4px solid"
      borderLeftColor={style.border}
      borderRadius="xl"
      opacity={alert.acknowledged ? 0.6 : 1}
    >
      <CardBody p={4}>
        <HStack justify="space-between" align="start" spacing={3}>
          <HStack spacing={3} flex={1} minW={0}>
            <Box
              w={10}
              h={10}
              borderRadius="lg"
              bg={`${style.badge}.100`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <TrendIcon size={20} color={trendColor as any} />
            </Box>
            <VStack align="start" spacing={1} minW={0} flex={1}>
              <HStack spacing={2} flexWrap="wrap">
                <Text fontWeight={600} fontSize="sm" noOfLines={1}>
                  {alert.fruitName}
                </Text>
                <Badge colorScheme={style.badge} variant="subtle" px={2} py={0.5} borderRadius="md">
                  {style.label}
                </Badge>
                {alert.acknowledged && (
                  <Badge colorScheme="gray" variant="subtle" px={2} py={0.5} borderRadius="md">
                    已确认
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                {alert.marketName} · {time}
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                <Text fontSize="sm" fontWeight={500}>
                  当前价：<Text as="span" color={trendColor}>{formatPrice(alert.currentPrice)}</Text>
                </Text>
                <Text fontSize="sm" color={subTextColor}>
                  {getConditionLabel(alert.conditionType)} {alert.threshold}
                  {getConditionUnit(alert.conditionType)}
                </Text>
                {alert.changePercent !== undefined && (
                  <Text
                    fontSize="sm"
                    color={alert.changePercent >= 0 ? 'price.up' : 'price.down'}
                    fontWeight={500}
                  >
                    日涨跌 {formatPercent(alert.changePercent)}
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>
          <HStack spacing={1} flexShrink={0}>
            {!alert.acknowledged && (
              <Tooltip label="确认">
                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="acknowledge"
                  icon={<Check size={16} />}
                  onClick={() => onAcknowledge(alert.id)}
                />
              </Tooltip>
            )}
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
}

interface MyAlertsProps {
  onOpenSettings: () => void;
}

export default function MyAlerts({ onOpenSettings }: MyAlertsProps) {
  const { triggeredAlerts, acknowledgeAlert, clearTriggeredAlerts, rules } = useAlertStore();
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const unacknowledgedCount = triggeredAlerts.filter((a) => !a.acknowledged).length;
  const sortedAlerts = [...triggeredAlerts].sort((a, b) => b.triggeredAt - a.triggeredAt);

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <VStack align="start" spacing={0}>
          <HStack spacing={2}>
            <Heading size="md" color={headingColor}>
              我的预警
            </Heading>
            {unacknowledgedCount > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={2} py={0.5}>
                {unacknowledgedCount} 条未确认
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color={subTextColor}>
            共 {rules.length} 条预警规则
          </Text>
        </VStack>
        <HStack spacing={2}>
          {triggeredAlerts.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Trash2 size={14} />}
              onClick={clearTriggeredAlerts}
            >
              清空
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Settings size={14} />}
            onClick={onOpenSettings}
          >
            管理规则
          </Button>
        </HStack>
      </HStack>

      {sortedAlerts.length === 0 ? (
        <Card
          border="1px dashed"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="xl"
          bg="transparent"
        >
          <CardBody>
            <VStack py={6} spacing={2}>
              <Bell size={32} color="gray" />
              <Text color={subTextColor} fontSize="sm">
                暂无触发的预警
              </Text>
              {rules.length === 0 && (
                <Button size="sm" colorScheme="brand" onClick={onOpenSettings}>
                  去创建预警规则
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={2} align="stretch">
          {sortedAlerts.slice(0, 5).map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={acknowledgeAlert}
            />
          ))}
          {sortedAlerts.length > 5 && (
            <Text fontSize="xs" color={subTextColor} textAlign="center" py={1}>
              还有 {sortedAlerts.length - 5} 条预警...
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
}
