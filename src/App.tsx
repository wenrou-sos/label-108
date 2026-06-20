import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from '@/theme';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import TrendAnalysis from '@/pages/TrendAnalysis';
import AnomalyDetection from '@/pages/AnomalyDetection';
import SeasonalAnalysis from '@/pages/SeasonalAnalysis';
import WeatherImpact from '@/pages/WeatherImpact';
import ImportCompare from '@/pages/ImportCompare';

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trend" element={<TrendAnalysis />} />
            <Route path="/anomaly" element={<AnomalyDetection />} />
            <Route path="/seasonal" element={<SeasonalAnalysis />} />
            <Route path="/weather" element={<WeatherImpact />} />
            <Route path="/import" element={<ImportCompare />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </ChakraProvider>
  );
}
