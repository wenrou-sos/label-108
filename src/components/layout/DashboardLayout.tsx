import { Flex, Container, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export interface DashboardLayoutProps {
  updateTime?: string;
  onExport?: () => void;
  onRefresh?: () => void;
}

export default function DashboardLayout({
  updateTime,
  onExport,
  onRefresh,
}: DashboardLayoutProps) {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Header updateTime={updateTime} onExport={onExport} onRefresh={onRefresh} />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box as="main" flex="1" overflow="auto">
          <Container maxW="container.xl" py="6" px="6">
            <Outlet />
          </Container>
        </Box>
      </Flex>
    </Flex>
  );
}
