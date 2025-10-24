import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../src/styles/globalStyles';
import { lightTheme, darkTheme } from '../src/styles/theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
    docs: {
      theme: darkTheme,
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'light' ? lightTheme : darkTheme;
      
      return React.createElement(
        ThemeProvider,
        { theme },
        React.createElement(GlobalStyle),
        React.createElement(
          'div',
          {
            style: {
              padding: '1rem',
              minHeight: '100vh',
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary
            }
          },
          React.createElement(Story)
        )
      );
    },
  ],
};

export default preview;