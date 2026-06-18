import type { HouseholdArea } from '@/features/responsibilities/areas';

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  surface: string;
  surfaceRaised: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  border: string;
  borderSubtle: string;
  accent: string;
  accentSoft: string;
  accentPressed: string;
  success: string;
  successSoft: string;
  error: string;
  errorSoft: string;
  white: string;
  overlay: string;
  onAccent: string;
};

export const lightTheme: ThemeColors = {
  surface: '#FAFAFA',
  surfaceRaised: '#FFFFFF',
  ink: '#08090A',
  inkMuted: '#6B6F76',
  inkSubtle: '#9CA0A8',
  border: 'rgba(0, 0, 0, 0.08)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  accent: '#5E6AD2',
  accentSoft: 'rgba(94, 106, 210, 0.1)',
  accentPressed: '#4C56B8',
  success: '#15803D',
  successSoft: '#F0FDF4',
  error: '#DC2626',
  errorSoft: '#FEF2F2',
  white: '#FFFFFF',
  overlay: 'rgba(8, 9, 10, 0.45)',
  onAccent: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  surface: '#08090A',
  surfaceRaised: '#121316',
  ink: '#F7F8F8',
  inkMuted: '#9CA0A8',
  inkSubtle: '#6B6F76',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  accent: '#5E6AD2',
  accentSoft: 'rgba(94, 106, 210, 0.15)',
  accentPressed: '#4C56B8',
  success: '#22C55E',
  successSoft: 'rgba(34, 197, 94, 0.12)',
  error: '#EF4444',
  errorSoft: 'rgba(239, 68, 68, 0.12)',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
  onAccent: '#FFFFFF',
};

export function getTheme(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkTheme : lightTheme;
}

/** Subtle area dots — monochrome craft, not rainbow chips. */
export type AreaTheme = {
  dot: string;
};

export const areaThemes: Record<HouseholdArea, AreaTheme> = {
  finances: { dot: '#5E6AD2' },
  cleaning: { dot: '#6B6F76' },
  organization: { dot: '#8B8F98' },
  pantry: { dot: '#9CA0A8' },
};

export function getAreaTheme(area: HouseholdArea): AreaTheme {
  return areaThemes[area];
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 999,
} as const;

export const fontFamily = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  mono: 'SpaceMono',
} as const;

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    fontFamily: fontFamily.sansSemiBold,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    fontFamily: fontFamily.sansSemiBold,
  },
  section: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: -0.01,
    fontFamily: fontFamily.sansSemiBold,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.011,
    fontFamily: fontFamily.sans,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: -0.011,
    fontFamily: fontFamily.sansMedium,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: -0.01,
    fontFamily: fontFamily.sansMedium,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    fontFamily: fontFamily.sansSemiBold,
  },
  tabular: {
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
  },
} as const;

/** Kowalski custom easing curves */
export const motion = {
  pressScale: 0.97,
  pressOpacity: 0.85,
  durationPress: 120,
  durationSheet: 280,
  durationTooltip: 160,
  easingOut: [0.23, 1, 0.32, 1] as const,
  easingDrawer: [0.32, 0.72, 0, 1] as const,
} as const;
