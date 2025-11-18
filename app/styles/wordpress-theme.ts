/**
 * WordPress Theme Recreation - Kroi Auto Center
 * Extracted from original WordPress site screenshots
 */

export const wordpressTheme = {
  colors: {
    // Primary brand colors
    primary: {
      main: '#C84B8A',      // Magenta/Pink (KROI brand color)
      light: '#E991BB',
      dark: '#A13B6E',
      gradient: 'linear-gradient(135deg, #C84B8A 0%, #A13B6E 100%)',
    },

    // Secondary colors
    secondary: {
      blue: '#3B82F6',      // Blue for buttons
      blueLight: '#60A5FA',
      blueDark: '#2563EB',
    },

    // Background colors
    background: {
      main: '#F5F5F5',      // Light gray
      white: '#FFFFFF',
      black: '#000000',
      dark: '#1F1F1F',
      purple: '#8B5CF6',    // Purple for about section
      purpleGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.85) 0%, rgba(124, 58, 237, 0.85) 100%)',
    },

    // Text colors
    text: {
      primary: '#000000',
      secondary: '#6B7280',
      white: '#FFFFFF',
      gray: '#9CA3AF',
    },

    // Button colors
    button: {
      primary: '#C84B8A',
      secondary: '#3B82F6',
      outline: '#3B82F6',
      whatsapp: '#25D366',
    },
  },

  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      hero: '2.5rem',       // 40px
      title: '1.5rem',      // 24px
      price: '2rem',        // 32px
      body: '1rem',         // 16px
      small: '0.875rem',    // 14px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    container: '1280px',
    cardGap: '1.5rem',
    sectionPadding: '4rem',
  },

  borderRadius: {
    button: '0.5rem',     // 8px
    card: '0.75rem',      // 12px
    logo: '1rem',         // 16px
    image: '0.5rem',      // 8px
  },

  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    platform: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  effects: {
    // Circular platform for car images
    carPlatform: {
      background: 'radial-gradient(circle, #E5E7EB 0%, #D1D5DB 100%)',
      borderRadius: '50%',
      aspectRatio: '1/1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
  },
};

// Finnish text constants from WordPress
export const finnishText = {
  hero: {
    title: 'Me autamme sinua löytämään juuri sinun tarpeisiisi sopivan auton.',
    subtitle: 'Meiltä löydät suuren valikoiman käytettyjä autoja.',
    cta: 'SOITA',
  },
  search: {
    placeholder: 'Hae...',
    button: 'Haku',
  },
  carCard: {
    viewMore: 'NÄYTÄ LISÄÄ',
  },
  about: {
    title: 'MEISTÄ',
    heading: 'Kroi Auto Center Oy',
  },
  whatsapp: {
    message: 'Miten voin autaa?',
    description: 'Keskustele meidän tiimin kanssa',
  },
  footer: {
    commitment: '100% SITOUTUNUT',
  },
};

export default wordpressTheme;
