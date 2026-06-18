import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';

export type GeometricIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Wraps SVG in a fixed box so icons align consistently in buttons, tabs, and rows. */
export function GeometricIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.5,
  children,
  style,
}: GeometricIconProps) {
  return (
    <View style={[styles.box, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {children}
      </Svg>
    </View>
  );
}

export function iconStroke(color: string, strokeWidth: number) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
}

/** Standard icon sizes — keeps visual weight consistent across UI. */
export const iconSize = {
  tab: 22,
  button: 20,
  buttonInline: 18,
  checkbox: 13,
  rowAction: 16,
  empty: 32,
} as const;

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
