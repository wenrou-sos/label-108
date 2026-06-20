import { ReactNode } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CloudRain,
  ArrowLeftRight,
  Menu,
  Leaf,
  Bell,
  Settings,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import AlertSettingsPanel from './AlertSettingsPanel';

const navItems = [
  { path: '/', label: '综合看板', icon: LayoutDashboard },
  { path: '/trend', label: '价格趋势', icon: TrendingUp },
  { path: '/anomaly', label: '异常检测', icon: AlertTriangle },
  { path: '/seasonal', label: '季节分析', icon: Calendar },
  { path: '/weather', label: '天气影响', icon: CloudRain },
  { path: '/import', label: '进口对比', icon: ArrowLeftRight },
];

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ to, label, icon: Icon, isActive, onClick }: NavItemProps) {
  const activeBg = useColorModeValue('brand.500', 'brand.400');
  const activeColor = useColorModeValue('white', 'white');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <NavLink to={to} onClick={onClick} style={{ textDecoration: 'none', width: '100%' }}>
      <HStack
        w="100%"
        px={4}
        py={3}
        borderRadius="md"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{ bg: isActive ? activeBg : hoverBg }}
        transition="all 0.2s"
        spacing={3}
      >
        <Icon size={20} />
        <Text fontWeight={isActive ? 600 : 500} fontSize="sm">
          {label}
        </Text>
      </HStack>
    </NavLink>
  );
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack h="100%" bg={bg} borderRight="1px solid" borderColor={borderColor} align="stretch">
      <HStack px={6} py={5} spacing={3}>
        <Box
          w={10}
          h={10}
          borderRadius="lg"
          bgGradient="linear(135deg, brand.400, brand.600)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Leaf color="white" size={22} />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight={700} color="gray.800">
            果价通
          </Text>
          <Text fontSize="xs" color="gray.500">
            水果价格监测平台
          </Text>
        </VStack>
      </HStack>

      <VStack px={4} py={4} spacing={1} flex={1} align="stretch">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            isActive={location.pathname === item.path}
            onClick={onNavigate}
          />
        ))}
      </VStack>

      <Box px={6} py={4} borderTop="1px solid" borderColor={borderColor}>
        <Text fontSize="xs" color="gray.400">
          © 2024 果价通 · 数据仅供参考
        </Text>
      </Box>
    </VStack>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: openSettings, onClose: closeSettings } = useDisclosure();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const headerBorder = useColorModeValue('gray.200', 'gray.700');
  const { triggeredAlerts } = useAlertStore();
  const unacknowledgedCount = triggeredAlerts.filter((a) => !a.acknowledged).length;

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg={bg}>
      <Box
        w={64}
        h="100%"
        display={{ base: 'none', md: 'block' }}
        flexShrink={0}
      >
        <SidebarContent />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW={64}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">导航菜单</DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex flex={1} direction="column" overflow="hidden">
        <Flex
          as="header"
          h={16}
          px={4}
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={headerBorder}
          alignItems="center"
          justify="space-between"
          flexShrink={0}
        >
          <HStack>
            <IconButton
              variant="ghost"
              display={{ md: 'none' }}
              onClick={onOpen}
              aria-label="打开菜单"
            >
              <Menu size={20} />
            </IconButton>
            <Text fontSize="lg" fontWeight={600} color="gray.800" display={{ base: 'none', sm: 'block' }}>
              水果价格监测与分析系统
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label="预警设置">
              <IconButton
                variant="ghost"
                onClick={openSettings}
                aria-label="预警设置"
                position="relative"
              >
                <Settings size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip label={unacknowledgedCount > 0 ? `${unacknowledgedCount} 条未确认预警` : '我的预警'}>
              <Box position="relative">
                <IconButton
                  variant="ghost"
                  onClick={openSettings}
                  aria-label="我的预警"
                >
                  <Bell size={18} />
                </IconButton>
                {unacknowledgedCount > 0 && (
                  <Badge
                    position="absolute"
                    top={-1}
                    right={-1}
                    fontSize="10px"
                    borderRadius="full"
                    px={1.5}
                    py={0.5}
                    minW={4}
                    h={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    colorScheme="red"
                  >
                    {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
                  </Badge>
                )}
              </Box>
            </Tooltip>
          </HStack>
        </Flex>

        <Box flex={1} overflow="auto" p={{ base: 4, md: 6 }}>
          {children}
        </Box>
      </Flex>

      <AlertSettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
    </Flex>
  );
}
