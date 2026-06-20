import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#E8F5EE',
    100: '#C5E3D1',
    200: '#9ED0B1',
    300: '#76BD92',
    400: '#55AD79',
    500: '#2D6A4F',
    600: '#255A42',
    700: '#1C4834',
    800: '#143626',
    900: '#0B2418',
  },
  accent: {
    50: '#FEF3E6',
    100: '#FDDFBA',
    200: '#FCC686',
    300: '#FAAE52',
    400: '#F89929',
    500: '#F77F00',
    600: '#DE7200',
    700: '#B95F00',
    800: '#8F4800',
    900: '#663200',
  },
  price: {
    up: '#E53E3E',
    down: '#38A169',
    neutral: '#718096',
  },
  severity: {
    low: '#ECC94B',
    medium: '#ED8936',
    high: '#E53E3E',
  },
  weather: {
    frost: '#63B3ED',
    hail: '#A0AEC0',
    typhoon: '#553C9A',
    rain: '#3182CE',
    drought: '#D69E2E',
    heatwave: '#E53E3E',
  },
};

const fonts = {
  heading: '"PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif',
  body: '"PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
};

const fontSizes = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
};

const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 500,
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
        _active: {
          bg: 'brand.700',
        },
      },
      accent: {
        bg: 'accent.500',
        color: 'white',
        _hover: {
          bg: 'accent.600',
        },
        _active: {
          bg: 'accent.700',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'sm',
        bg: 'white',
        border: '1px solid',
        borderColor: 'gray.100',
      },
    },
  },
  Badge: {
    variants: {
      'price-up': {
        bg: 'red.50',
        color: 'price.up',
      },
      'price-down': {
        bg: 'green.50',
        color: 'price.down',
      },
      'severity-low': {
        bg: 'yellow.50',
        color: 'severity.low',
      },
      'severity-medium': {
        bg: 'orange.50',
        color: 'severity.medium',
      },
      'severity-high': {
        bg: 'red.50',
        color: 'severity.high',
      },
    },
  },
  Table: {
    baseStyle: {
      th: {
        fontWeight: 600,
        textTransform: 'none',
        fontSize: 'sm',
        color: 'gray.600',
        bg: 'gray.50',
      },
    },
  },
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  fonts,
  fontSizes,
  space,
  radii,
  components,
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme;
