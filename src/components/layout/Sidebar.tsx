import { VStack, Link, Flex, Text, useColorModeValue, Box } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CloudRain,
  Globe,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  items?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { path: '/', label: '综合看板', icon: LayoutDashboard },
  { path: '/trends', label: '价格趋势', icon: TrendingUp },
  { path: '/anomalies', label: '异常检测', icon: AlertTriangle },
  { path: '/seasonal', label: '季节性分析', icon: Calendar },
  { path: '/weather', label: '天气影响', icon: CloudRain },
  { path: '/compare', label: '进口国产对比', icon: Globe },
];

export default function Sidebar({ items = defaultMenuItems }: SidebarProps) {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('brand.50', 'gray.700');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Flex
      as="aside"
      direction="column"
      w="64"
      bg={bgColor}
      borderRight="1px solid"
      borderColor={borderColor}
      py="6"
      px="3"
      position="sticky"
      top="0"
      h="100vh"
    >
      <VStack spacing="1" align="stretch" w="full">
        {items.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              as={NavLink}
              to={item.path}
              borderRadius="lg"
              px="4"
              py="3"
              fontWeight="medium"
              fontSize="md"
              textDecoration="none"
              transition="all 0.2s ease"
              _hover={{
                bg: hoverBg,
                textDecoration: 'none',
              }}
              bg={isActive ? 'brand.500' : 'transparent'}
              color={isActive ? 'white' : inactiveColor}
            >
              <Flex align="center" gap="3">
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </Box>
                <Text>{item.label}</Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>
    </Flex>
  );
}
