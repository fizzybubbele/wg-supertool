import type { ColorValue } from 'react-native';

import type { IconName } from '@/components/icons/AreaDot';
import { iconSize } from '@/components/icons/GeometricIcon';
import {
  Calendar,
  Coin,
  Inbox,
  Package,
  Sparkle,
  Users,
} from '@/components/icons/icons';

export function TabIcon({
  name,
  color,
  size = iconSize.tab,
}: {
  name: IconName;
  color: ColorValue;
  size?: number;
}) {
  const strokeColor = typeof color === 'string' ? color : '#5E6AD2';
  const props = { color: strokeColor, size, strokeWidth: 1.75 as const };

  switch (name) {
    case 'coin':
      return <Coin {...props} />;
    case 'sparkle':
      return <Sparkle {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'users':
      return <Users {...props} />;
    case 'package':
      return <Package {...props} />;
    default:
      return <Inbox {...props} />;
  }
}
