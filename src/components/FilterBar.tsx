import { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuOptionGroup,
  MenuItemOption,
  Tag,
  TagCloseButton,
  Wrap,
  WrapItem,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  useColorModeValue,
  Flex,
  Divider,
} from '@chakra-ui/react';
import {
  ChevronDown,
  X,
  SlidersHorizontal,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import type { TimePeriod } from '@/types';

interface FilterBarProps {
  showFruitFilter?: boolean;
  showMarketFilter?: boolean;
  showTimePeriod?: boolean;
  fruitSingleSelect?: boolean;
  marketMultiSelect?: boolean;
}

export default function FilterBar({
  showFruitFilter = true,
  showMarketFilter = true,
  showTimePeriod = true,
  fruitSingleSelect = false,
  marketMultiSelect = true,
}: FilterBarProps) {
  const {
    filters,
    fruitOptions,
    marketOptions,
    timePeriodOptions,
    selectedFruitNames,
    selectedMarketNames,
    hasActiveFilters,
    setSelectedFruits,
    setSelectedMarkets,
    setTimePeriod,
    resetFilters,
    clearFruits,
    clearMarkets,
    toggleFruit,
    toggleMarket,
  } = useFilters();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleFruitSelect = (fruitId: string) => {
    if (fruitSingleSelect) {
      setSelectedFruits([fruitId]);
    } else {
      toggleFruit(fruitId);
    }
  };

  const handleMarketSelect = (marketId: string) => {
    if (!marketMultiSelect) {
      setSelectedMarkets([marketId]);
    } else {
      toggleMarket(marketId);
    }
  };

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={6}>
      <CardBody p={{ base: 4, md: 5 }}>
        <VStack align="stretch" spacing={4}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 3, md: 4 }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            wrap="wrap"
          >
            <HStack
              gap={{ base: 2, md: 3 }}
              flexWrap="wrap"
              flex={{ base: '1 100%', md: 'auto' }}
            >
              {showFruitFilter && (
                <Menu closeOnSelect={!fruitSingleSelect}>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown size={16} />}
                    variant="outline"
                    size="md"
                    minW={{ base: '100%', sm: '140px' }}
                  >
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight={500}>
                        {fruitSingleSelect ? '选择品种' : '品种筛选'}
                      </Text>
                      {!fruitSingleSelect && filters.selectedFruits.length > 0 && (
                        <Tag size="sm" colorScheme="brand" borderRadius="full">
                          {filters.selectedFruits.length}
                        </Tag>
                      )}
                    </HStack>
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto" minW="200px">
                    <MenuItem onClick={() => (fruitSingleSelect ? setSelectedFruits([]) : clearFruits())}>
                      全部品种
                    </MenuItem>
                    <Divider />
                    {fruitOptions.map((fruit) => (
                      <MenuItemOption
                        key={fruit.value}
                        value={fruit.value}
                        isChecked={filters.selectedFruits.includes(fruit.value)}
                        onClick={() => handleFruitSelect(fruit.value)}
                        closeOnSelect={fruitSingleSelect}
                      >
                        <HStack justify="space-between" w="100%">
                          <Text>{fruit.label}</Text>
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
              )}

              {showMarketFilter && (
                <Menu closeOnSelect={!marketMultiSelect ? true : false}>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown size={16} />}
                    variant="outline"
                    size="md"
                    minW={{ base: '100%', sm: '140px' }}
                  >
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight={500}>
                        {marketMultiSelect ? '市场筛选' : '选择市场'}
                      </Text>
                      {marketMultiSelect && filters.selectedMarkets.length > 0 && (
                        <Tag size="sm" colorScheme="blue" borderRadius="full">
                          {filters.selectedMarkets.length}
                        </Tag>
                      )}
                    </HStack>
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto" minW="220px">
                    <MenuItem onClick={() => (marketMultiSelect ? clearMarkets() : setSelectedMarkets([]))}>
                      全部市场
                    </MenuItem>
                    <Divider />
                    {marketOptions.map((market) => (
                      <MenuItemOption
                        key={market.value}
                        value={market.value}
                        isChecked={filters.selectedMarkets.includes(market.value)}
                        onClick={() => handleMarketSelect(market.value)}
                        closeOnSelect={!marketMultiSelect}
                      >
                        <VStack align="start" spacing={0}>
                          <Text>{market.label}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {market.province} · {market.city}
                          </Text>
                        </VStack>
                      </MenuItemOption>
                    ))}
                  </MenuList>
                </Menu>
              )}

              {showTimePeriod && (
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown size={16} />}
                    leftIcon={<CalendarDays size={16} />}
                    variant="outline"
                    size="md"
                    minW={{ base: '100%', sm: '120px' }}
                  >
                    <Text fontSize="sm" fontWeight={500}>
                      {timePeriodOptions.find((t) => t.value === filters.timePeriod)?.label || '选择周期'}
                    </Text>
                  </MenuButton>
                  <MenuList>
                    <MenuOptionGroup
                      value={filters.timePeriod}
                      type="radio"
                      onChange={(val) => setTimePeriod(val as TimePeriod)}
                    >
                      {timePeriodOptions.map((period) => (
                        <MenuItemOption key={period.value} value={period.value}>
                          {period.label}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              )}
            </HStack>

            {hasActiveFilters && (
              <HStack spacing={2}>
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  size="sm"
                  variant="ghost"
                  onClick={resetFilters}
                >
                  重置
                </Button>
              </HStack>
            )}
          </Flex>

          {(selectedFruitNames.length > 0 || selectedMarketNames.length > 0) && (
            <Wrap spacing={2}>
              {selectedFruitNames.map((name, idx) => (
                <WrapItem key={`fruit-${idx}`}>
                  <Tag
                    size="md"
                    colorScheme="brand"
                    borderRadius="full"
                    variant="subtle"
                  >
                    {name}
                    <TagCloseButton
                      onClick={() => toggleFruit(filters.selectedFruits[idx])}
                    />
                  </Tag>
                </WrapItem>
              ))}
              {selectedMarketNames.map((name, idx) => (
                <WrapItem key={`market-${idx}`}>
                  <Tag
                    size="md"
                    colorScheme="blue"
                    borderRadius="full"
                    variant="subtle"
                  >
                    {name}
                    <TagCloseButton
                      onClick={() => toggleMarket(filters.selectedMarkets[idx])}
                    />
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

export function CompactFilterBar() {
  const [isOpen, setIsOpen] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start">
      <PopoverTrigger>
        <Button
          leftIcon={<SlidersHorizontal size={18} />}
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
        >
          筛选
        </Button>
      </PopoverTrigger>
      <PopoverContent w={{ base: 'calc(100vw - 32px)', md: '480px' }}>
        <PopoverHeader fontWeight={600}>筛选条件</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody p={0}>
          <Box bg={cardBg} border="none">
            <FilterBar />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
