import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/constants/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function PressableScale({ children, disabled, style, ...props }: PressableScaleProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const easing = Easing.bezier(...motion.easingOut);

  const handlePressIn = () => {
    if (disabled) return;
    if (reducedMotion) {
      opacity.value = withTiming(motion.pressOpacity, { duration: motion.durationPress, easing });
      return;
    }
    scale.value = withTiming(motion.pressScale, { duration: motion.durationPress, easing });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motion.durationPress, easing });
    opacity.value = withTiming(1, { duration: motion.durationPress, easing });
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}>
      {children}
    </AnimatedPressable>
  );
}
