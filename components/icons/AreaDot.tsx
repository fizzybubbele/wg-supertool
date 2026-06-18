import { StyleSheet, View } from 'react-native';

import { getAreaTheme } from '@/constants/tokens';
import type { HouseholdArea } from '@/features/responsibilities/areas';

export type IconName =
  | 'plus'
  | 'check'
  | 'x'
  | 'receipt'
  | 'calendar'
  | 'sparkle'
  | 'users'
  | 'package'
  | 'coin'
  | 'inbox';

type AreaDotProps = {
  area: HouseholdArea;
  size?: number;
};

export function AreaDot({ area, size = 5 }: AreaDotProps) {
  const theme = getAreaTheme(area);

  return (
    <View style={styles.wrap}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.dot,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: 12,
    justifyContent: 'center',
    width: 12,
  },
});
