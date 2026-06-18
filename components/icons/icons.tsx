import { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { GeometricIcon, iconStroke, type GeometricIconProps } from '@/components/icons/GeometricIcon';

type IconProps = Omit<GeometricIconProps, 'children'>;

/** All paths sit on a 24×24 grid with 2px optical inset (content zone 4–20). */

export function Plus({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Line x1="12" y1="7" x2="12" y2="17" {...s} />
      <Line x1="7" y1="12" x2="17" y2="12" {...s} />
    </GeometricIcon>
  );
}

export function Check({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Polyline points="7.5,12.5 10.5,15.5 16.5,8.5" {...s} />
    </GeometricIcon>
  );
}

export function X({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Line x1="8" y1="8" x2="16" y2="16" {...s} />
      <Line x1="16" y1="8" x2="8" y2="16" {...s} />
    </GeometricIcon>
  );
}

export function Receipt({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Path
        d="M8 5h8a1 1 0 011 1v12l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1V6a1 1 0 011-1z"
        {...s}
      />
      <Line x1="10" y1="9" x2="14" y2="9" {...s} />
      <Line x1="10" y1="12.5" x2="13" y2="12.5" {...s} />
    </GeometricIcon>
  );
}

export function Calendar({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Rect x="5" y="6" width="14" height="13" rx="1" {...s} />
      <Line x1="5" y1="10" x2="19" y2="10" {...s} />
      <Line x1="9" y1="4" x2="9" y2="7" {...s} />
      <Line x1="15" y1="4" x2="15" y2="7" {...s} />
    </GeometricIcon>
  );
}

export function Sparkle({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Path d="M12 5v4M12 15v4M5 12h4M15 12h4M7.05 7.05l2.83 2.83M14.12 14.12l2.83 2.83M16.95 7.05l-2.83 2.83M9.88 14.12l-2.83 2.83" {...s} />
    </GeometricIcon>
  );
}

export function Users({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Circle cx="9.5" cy="9" r="2.5" {...s} />
      <Path d="M5 18c0-2.5 2-4.5 4.5-4.5S14 15.5 14 18" {...s} />
      <Circle cx="15.5" cy="10" r="2" {...s} />
      <Path d="M13 18c0-2 1.5-3.5 3-3.5" {...s} />
    </GeometricIcon>
  );
}

export function Package({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Path d="M12 5l7 3.5V16L12 19.5 5 16V8.5L12 5z" {...s} />
      <Line x1="12" y1="5" x2="12" y2="19.5" {...s} />
      <Line x1="5" y1="8.5" x2="12" y2="12" {...s} />
      <Line x1="19" y1="8.5" x2="12" y2="12" {...s} />
    </GeometricIcon>
  );
}

export function Coin({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Circle cx="12" cy="12" r="7" {...s} />
      <Line x1="12" y1="8" x2="12" y2="16" {...s} />
      <Path d="M9.5 10.5h3a1.75 1.75 0 010 3.5H9.5" {...s} />
    </GeometricIcon>
  );
}

export function Inbox({ size = 24, color = 'currentColor', strokeWidth = 1.5, style }: IconProps) {
  const s = iconStroke(color, strokeWidth);
  return (
    <GeometricIcon size={size} color={color} strokeWidth={strokeWidth} style={style}>
      <Path d="M5 7h14v10H5V7z" {...s} />
      <Path d="M5 13h4.5l1 2h3l1-2H19" {...s} />
    </GeometricIcon>
  );
}
