import { useMemo } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  Text,
  Skeleton,
  useColorModeValue,
  Fade,
  HStack,
  Flex,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Tag,
  Wrap,
  WrapItem,
  TagCloseButton,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import type { Fruit, CorrelationResult, CorrelationMatrix, TimePeriod } from '@/types';

interface CorrelationHeatmapProps {
  matrix: CorrelationMatrix | null;
  fruits: Fruit[];
  selectedFruitIds: string[];
  onFruitToggle: (fruitId: string) => void;
  onClearFruits: () => void;
  onCellClick: (result: CorrelationResult) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
  title?: string;
}

const getCorrelationColor = (correlation: number): string => {
  const clamped = Math.max(-1, Math.min(1, correlation));
  const intensity = Math.abs(clamped);

  if (clamped >= 0) {
    if (intensity < 0.2) return '#F7FAFC';
    if (intensity < 0.4) return '#FED7D7';
    if (intensity < 0.6) return '#FC8181';
    if (intensity < 0.8) return '#F56565';
    return '#C53030';
  } else {
    if (intensity < 0.2) return '#F7FAFC';
    if (intensity < 0.4) return '#BEE3F8';
    if (intensity < 0.6) return '#63B3ED';
    if (intensity < 0.8) return '#4299E1';
    return '#2B6CB0';
  }
};

const getCorrelationTextColor = (correlation: number): string => {
  const intensity = Math.abs(correlation);
  return intensity >= 0.6 ? 'white' : 'gray.800';
};

const getCorrelationLabel = (correlation: number): string => {
  const abs = Math.abs(correlation);
  if (abs >= 0.8) return '极强';
  if (abs >= 0.6) return '强';
  if (abs >= 0.4) return '中等';
  if (abs >= 0.2) return '弱';
  return '极弱/无';
};

const timePeriodOptions: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
];

const DEFAULT_SELECTED_COUNT = 8;

export default function CorrelationHeatmap({
  matrix,
  fruits,
  selectedFruitIds,
  onFruitToggle,
  onClearFruits,
  onCellClick,
  timePeriod,
  onTimePeriodChange,
  isLoading = false,
  title = '品种价格关联矩阵',
}: CorrelationHeatmapProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const fruitNameMap = useMemo(() => {
    const map = new Map<string, string>();
    fruits.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [fruits]);

  const selectedFruitNames = useMemo(
    () => selectedFruitIds.map((id) => fruitNameMap.get(id) || id),
    [selectedFruitIds, fruitNameMap]
  );

  const MotionCard = motion(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
    >
      <CardHeader
        py={4}
        px={5}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" flexWrap="wrap" spacing={4}>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Heading size="sm" color={textColor}>{title}</Heading>
                <Tooltip
                  label="Pearson相关系数：-1（完全负相关）~ +1（完全正相关），颜色越深代表关联度越强"
                  fontSize="xs"
                  placement="top"
                >
                  <Box color={subTextColor} cursor="help">
                    <Info size={16} />
                  </Box>
                </Tooltip>
              </HStack>
              <Text fontSize="xs" color={subTextColor}>
                分析不同品种间的价格联动关系，辅助采购组合决策
              </Text>
            </VStack>
            <HStack spacing={2}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={16} />}
                  variant="outline"
                  size="sm"
                >
                  <Text fontSize="xs" fontWeight={500}>
                    分析周期：{timePeriodOptions.find((t) => t.value === timePeriod)?.label}
                  </Text>
                </MenuButton>
                <MenuList>
                  <MenuOptionGroup
                    value={timePeriod}
                    type="radio"
                    onChange={(val) => onTimePeriodChange(val as TimePeriod)}
                  >
                    {timePeriodOptions.map((period) => (
                      <MenuItemOption key={period.value} value={period.value}>
                        {period.label}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={16} />}
                  variant="outline"
                  size="sm"
                >
                  <HStack spacing={2}>
                    <Text fontSize="xs" fontWeight={500}>选择品种</Text>
                    {selectedFruitIds.length > 0 && (
                      <Tag size="sm" colorScheme="green" borderRadius="full">
                        {selectedFruitIds.length}
                      </Tag>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList maxH="320px" overflowY="auto" minW="200px">
                  <MenuItemOption
                    value="clear"
                    onClick={onClearFruits}
                  >
                    <HStack justify="space-between" w="100%">
                      <Text>默认选择前 {DEFAULT_SELECTED_COUNT} 个</Text>
                    </HStack>
                  </MenuItemOption>
                  {fruits.map((fruit) => (
                    <MenuItemOption
                      key={fruit.id}
                      value={fruit.id}
                      isChecked={selectedFruitIds.includes(fruit.id)}
                      onClick={() => onFruitToggle(fruit.id)}
                      closeOnSelect={false}
                    >
                      <HStack justify="space-between" w="100%">
                        <Text>{fruit.name}</Text>
                        {fruit.isImported && (
                          <Tag size="xs" colorScheme="orange" borderRadius="full">
                            进口
                          </Tag>
                        )}
                      </HStack>
                    </MenuItemOption>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          {selectedFruitNames.length > 0 && (
            <Wrap spacing={1.5}>
              {selectedFruitNames.map((name, idx) => (
                <WrapItem key={`fruit-${idx}`}>
                  <Tag
                    size="sm"
                    colorScheme="green"
                    borderRadius="full"
                    variant="subtle"
                  >
                    {name}
                    <TagCloseButton onClick={() => onFruitToggle(selectedFruitIds[idx])} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}

          <HStack spacing={4} flexWrap="wrap">
            <HStack spacing={2}>
              <Badge colorScheme="red" variant="subtle" px={2} py={1} borderRadius="md">
                正相关
              </Badge>
              <HStack spacing={0.5}>
                <Box w={4} h={4} bg="#FED7D7" borderRadius="sm" />
                <Box w={4} h={4} bg="#FC8181" borderRadius="sm" />
                <Box w={4} h={4} bg="#F56565" borderRadius="sm" />
                <Box w={4} h={4} bg="#C53030" borderRadius="sm" />
              </HStack>
            </HStack>
            <HStack spacing={2}>
              <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md">
                负相关
              </Badge>
              <HStack spacing={0.5}>
                <Box w={4} h={4} bg="#BEE3F8" borderRadius="sm" />
                <Box w={4} h={4} bg="#63B3ED" borderRadius="sm" />
                <Box w={4} h={4} bg="#4299E1" borderRadius="sm" />
                <Box w={4} h={4} bg="#2B6CB0" borderRadius="sm" />
              </HStack>
            </HStack>
            <Text fontSize="xs" color={subTextColor}>
              点击格子查看详细对比
            </Text>
          </HStack>
        </VStack>
      </CardHeader>

      <CardBody p={5}>
        {isLoading ? (
          <VStack p={6} spacing={4}>
            <Skeleton h={320} w="100%" borderRadius="md" />
          </VStack>
        ) : !matrix || matrix.fruitIds.length === 0 ? (
          <VStack p={12} spacing={2}>
            <Text color={subTextColor}>请选择至少 2 个品种进行关联分析</Text>
          </VStack>
        ) : (
          <Fade in={!isLoading}>
            <Box overflowX="auto" pb={2}>
              <Flex direction="column" minW={`${matrix.fruitIds.length * 72 + 120}px`}>
                <Flex ml={120}>
                  {matrix.fruitIds.map((fruitId) => (
                    <Box
                      key={`header-col-${fruitId}`}
                      w={72}
                      h={80}
                      flexShrink={0}
                      display="flex"
                      alignItems="flex-end"
                      justifyContent="center"
                      pb={2}
                    >
                      <Box
                        transform="rotate(-45deg)"
                        transformOrigin="bottom left"
                        whiteSpace="nowrap"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight={600}
                          color={textColor}
                        >
                          {fruitNameMap.get(fruitId) || fruitId}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Flex>

                {matrix.fruitIds.map((rowFruitId, rowIdx) => (
                  <Flex key={`row-${rowFruitId}`}>
                    <Box
                      w={120}
                      h={44}
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      pr={3}
                      bg={headerBg}
                      borderRight="1px solid"
                      borderColor={borderColor}
                      borderTop={rowIdx === 0 ? '1px solid' : undefined}
                      borderTopColor={rowIdx === 0 ? borderColor : undefined}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight={600}
                        color={textColor}
                        textAlign="right"
                      >
                        {fruitNameMap.get(rowFruitId) || rowFruitId}
                      </Text>
                    </Box>
                    {matrix.fruitIds.map((colFruitId, colIdx) => {
                      const cell = matrix.matrix[rowIdx][colIdx];
                      if (!cell) return null;

                      const bgColor = getCorrelationColor(cell.correlation);
                      const textColorCell = getCorrelationTextColor(cell.correlation);
                      const isDiagonal = rowIdx === colIdx;

                      return (
                        <Tooltip
                          key={`cell-${rowFruitId}-${colFruitId}`}
                          label={
                            <VStack align="start" spacing={1}>
                              <Text fontWeight={600}>
                                {fruitNameMap.get(rowFruitId)} vs {fruitNameMap.get(colFruitId)}
                              </Text>
                              <Text fontSize="xs">
                                相关系数: {cell.correlation.toFixed(3)}
                              </Text>
                              <Text fontSize="xs">
                                关联强度: {getCorrelationLabel(cell.correlation)}
                              </Text>
                              <Text fontSize="xs">
                                样本量: {cell.sampleSize} 天
                              </Text>
                              {!isDiagonal && (
                                <Text fontSize="xs" color="blue.400" mt={1}>
                                  点击查看详细走势对比
                                </Text>
                              )}
                            </VStack>
                          }
                          fontSize="xs"
                          placement="top"
                          hasArrow
                        >
                          <Box
                            w={72}
                            h={44}
                            flexShrink={0}
                            bg={bgColor}
                            borderRight="1px solid"
                            borderBottom="1px solid"
                            borderTop={rowIdx === 0 ? '1px solid' : undefined}
                            borderColor={borderColor}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            cursor={isDiagonal ? 'default' : 'pointer'}
                            transition="all 0.2s"
                            _hover={!isDiagonal ? {
                              transform: 'scale(1.08)',
                              zIndex: 10,
                              boxShadow: 'lg',
                              borderRadius: 'md',
                            } : {}}
                            onClick={() => !isDiagonal && onCellClick(cell)}
                          >
                            {isDiagonal ? (
                              <Text fontSize="xs" fontWeight={700} color={textColorCell}>
                                1.00
                              </Text>
                            ) : (
                              <>
                                <Text
                                  fontSize="xs"
                                  fontWeight={700}
                                  color={textColorCell}
                                >
                                  {cell.correlation > 0 ? '+' : ''}
                                  {cell.correlation.toFixed(2)}
                                </Text>
                                <Text
                                  fontSize="10px"
                                  color={textColorCell}
                                  opacity={0.85}
                                >
                                  n={cell.sampleSize}
                                </Text>
                              </>
                            )}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Fade>
        )}
      </CardBody>
    </MotionCard>
  );
}
