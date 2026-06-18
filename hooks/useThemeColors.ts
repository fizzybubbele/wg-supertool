import { useColorScheme } from '@/components/useColorScheme';
import { getTheme, type ColorScheme, type ThemeColors } from '@/constants/tokens';

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return getTheme((scheme ?? 'light') as ColorScheme);
}
