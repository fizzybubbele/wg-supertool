import { lightTheme, darkTheme } from '@/constants/tokens';

/** @deprecated Use useThemeColors() from @/hooks/useThemeColors */
export default {
  light: {
    text: lightTheme.ink,
    background: lightTheme.surface,
    tint: lightTheme.accent,
    tabIconDefault: lightTheme.inkSubtle,
    tabIconSelected: lightTheme.accent,
  },
  dark: {
    text: darkTheme.ink,
    background: darkTheme.surface,
    tint: darkTheme.accent,
    tabIconDefault: darkTheme.inkSubtle,
    tabIconSelected: darkTheme.accent,
  },
};
