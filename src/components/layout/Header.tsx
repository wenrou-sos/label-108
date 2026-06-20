import { Flex, Box, Button, Badge, Text, HStack, useColorModeValue } from '@chakra-ui/react';
import { Leaf, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export interface HeaderProps {
  updateTime?: string;
  onExport?: () => void;
  onRefresh?: () => void;
}

export default function Header({ updateTime, onExport, onRefresh }: HeaderProps) {
  const today = format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN });
  const displayUpdateTime = updateTime || format(new Date(), 'HH:mm:ss');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px="6"
      py="4"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <HStack spacing="4">
        <Box
          bg="brand.500"
          color="white"
          p="2"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Leaf size={24} />
        </Box>
        <Box>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.800"
            letterSpacing="wide"
          >
            全国水果批发市场价格行情看板
          </Text>
          <Text fontSize="sm" color="gray.500" mt="1">
            {today}
          </Text>
        </Box>
      </HStack>

      <HStack spacing="4">
        <HStack spacing="2">
          <Text fontSize="sm" color={textColor}>
            数据更新时间：
          </Text>
          <Badge variant="subtle" colorScheme="brand" fontSize="sm" px="2" py="1">
            {displayUpdateTime}
          </Badge>
        </HStack>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            onClick={onRefresh}
          >
            刷新
          </Button>
        )}
        <Button
          variant="accent"
          size="sm"
          leftIcon={<Download size={16} />}
          onClick={onExport}
        >
          导出数据
        </Button>
      </HStack>
    </Flex>
  );
}
