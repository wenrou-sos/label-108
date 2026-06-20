import {
  Card,
  CardBody,
  Flex,
  Box,
  Button,
  ButtonGroup,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Checkbox,
  CheckboxGroup,
  VStack,
  Divider,
  useColorModeValue,
  Tag,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ChevronDown, Filter, RotateCcw, Calendar, Search } from 'lucide-react';
import type { TimePeriod, Fruit, Market } from '@/types';

export interface FilterOption {
  value: string;
  label: string;
  category?: string;
  isImported?: boolean;
  city?: string;
  province?: string;
}

export interface FilterBarProps {
  fruitOptions: FilterOption[];
  marketOptions: FilterOption[];
  selectedFruits: string[];
  selectedMarkets: string[];
  timePeriod: TimePeriod;
  dateRange: { start: string; end: string };
  onFruitChange: (fruits: string[]) => void;
  onMarketChange: (markets: string[]) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onReset: () => void;
  selectedFruitNames?: string[];
  selectedMarketNames?: string[];
}

const timePeriodOptions: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
  { value: '90d', label: '90天' },
];

function MultiSelectPopover({
  title,
  options,
  selectedValues,
  onChange,
  selectedNames,
}: {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  selectedNames?: string[];
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const displayText =
    selectedValues.length === 0
      ? `全部${title}`
      : selectedValues.length === options.length
      ? `全部${title}`
      : selectedNames && selectedNames.length > 0
      ? selectedNames.slice(0, 2).join('、') + (selectedNames.length > 2 ? '...' : '')
      : `已选${selectedValues.length}项`;

  return (
    <Popover placement="bottom-start" closeOnBlur={true}>
      <PopoverTrigger>
        <Button
          variant="outline"
          rightIcon={<ChevronDown size={16} />}
          fontWeight="normal"
          minW="160px"
          justifyContent="space-between"
          bg={cardBg}
          borderColor={borderColor}
        >
          <Text noOfLines={1} fontSize="sm">
            {title}：{displayText}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent w="280px" bg={cardBg} borderColor={borderColor}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody maxH="320px" overflowY="auto" py="4">
          <CheckboxGroup value={selectedValues} onChange={(values) => onChange(values as string[])}>
            <VStack align="stretch" spacing="2">
              <HStack justify="space-between" px="2">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onChange(options.map((o) => o.value))}
                >
                  全选
                </Button>
                <Button size="xs" variant="ghost" onClick={() => onChange([])}>
                  清空
                </Button>
              </HStack>
              <Divider />
              {options.map((option) => (
                <Checkbox key={option.value} value={option.value} px="2" py="1">
                  <HStack spacing="2">
                    <Text fontSize="sm">{option.label}</Text>
                    {option.category && (
                      <Tag size="sm" colorScheme="gray" variant="subtle">
                        {option.category}
                      </Tag>
                    )}
                    {option.city && (
                      <Text fontSize="xs" color="gray.500">
                        {option.city}
                      </Text>
                    )}
                  </HStack>
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default function FilterBar({
  fruitOptions,
  marketOptions,
  selectedFruits,
  selectedMarkets,
  timePeriod,
  dateRange,
  onFruitChange,
  onMarketChange,
  onTimePeriodChange,
  onDateRangeChange,
  onReset,
  selectedFruitNames,
  selectedMarketNames,
}: FilterBarProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange(e.target.value, dateRange.end);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange(dateRange.start, e.target.value);
  };

  const hasActiveFilters =
    selectedFruits.length > 0 ||
    selectedMarkets.length > 0 ||
    timePeriod !== '30d';

  const removedTags: { label: string; onRemove: () => void }[] = [];
  if (selectedFruitNames) {
    selectedFruitNames.forEach((name, idx) => {
      removedTags.push({
        label: name,
        onRemove: () => {
          const newFruits = [...selectedFruits];
          newFruits.splice(idx, 1);
          onFruitChange(newFruits);
        },
      });
    });
  }
  if (selectedMarketNames) {
    selectedMarketNames.forEach((name, idx) => {
      removedTags.push({
        label: name,
        onRemove: () => {
          const newMarkets = [...selectedMarkets];
          newMarkets.splice(idx, 1);
          onMarketChange(newMarkets);
        },
      });
    });
  }

  return (
    <Card bg={cardBg} variant="outline" mb="6">
      <CardBody>
        <VStack spacing="4" align="stretch">
          <Flex wrap="wrap" gap="3" align="center">
            <HStack spacing="2">
              <Search size={18} className="text-gray-500" />
              <Text fontSize="sm" fontWeight="medium" color={labelColor}>
                筛选条件
              </Text>
            </HStack>

            <MultiSelectPopover
              title="品种"
              options={fruitOptions}
              selectedValues={selectedFruits}
              onChange={onFruitChange}
              selectedNames={selectedFruitNames}
            />

            <MultiSelectPopover
              title="市场"
              options={marketOptions}
              selectedValues={selectedMarkets}
              onChange={onMarketChange}
              selectedNames={selectedMarketNames}
            />

            <Box>
              <Text fontSize="xs" color={labelColor} mb="1">
                时间周期
              </Text>
              <ButtonGroup size="sm" isAttached variant="outline">
                {timePeriodOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    onClick={() => onTimePeriodChange(opt.value)}
                    bg={timePeriod === opt.value ? 'brand.500' : cardBg}
                    color={timePeriod === opt.value ? 'white' : undefined}
                    borderColor={borderColor}
                    _hover={{
                      bg: timePeriod === opt.value ? 'brand.600' : 'gray.50',
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>

            <Box>
              <Text fontSize="xs" color={labelColor} mb="1">
                日期范围
              </Text>
              <HStack spacing="2">
                <HStack
                  spacing="2"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  px="3"
                  py="1"
                  bg={cardBg}
                >
                  <Calendar size={14} className="text-gray-500" />
                  <Box as="input"
                    type="date"
                    value={dateRange.start}
                    onChange={handleStartDateChange}
                    border="none"
                    outline="none"
                    bg="transparent"
                    fontSize="sm"
                    w="120px"
                    color={labelColor}
                  />
                </HStack>
                <Text color="gray.400">至</Text>
                <HStack
                  spacing="2"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  px="3"
                  py="1"
                  bg={cardBg}
                >
                  <Calendar size={14} className="text-gray-500" />
                  <Box as="input"
                    type="date"
                    value={dateRange.end}
                    onChange={handleEndDateChange}
                    border="none"
                    outline="none"
                    bg="transparent"
                    fontSize="sm"
                    w="120px"
                    color={labelColor}
                  />
                </HStack>
              </HStack>
            </Box>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw size={14} />}
                onClick={onReset}
                color="gray.500"
                ml="auto"
              >
                重置筛选
              </Button>
            )}
          </Flex>

          {removedTags.length > 0 && (
            <Wrap spacing="2">
              {removedTags.map((tag, idx) => (
                <WrapItem key={idx}>
                  <Tag
                    size="md"
                    colorScheme="brand"
                    variant="subtle"
                    borderRadius="full"
                  >
                    {tag.label}
                    <TagCloseButton onClick={tag.onRemove} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export type { Fruit, Market };
