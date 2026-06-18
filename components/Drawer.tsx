import { type ReactNode, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useThemeColors } from '@/hooks/useThemeColors';
import { motion, radius, spacing } from '@/constants/tokens';

type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Drawer({ visible, onClose, children, style }: DrawerProps) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(400);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: reducedMotion ? 0 : motion.durationSheet,
        easing: Easing.bezier(...motion.easingDrawer),
      });
      backdropOpacity.value = withTiming(1, {
        duration: reducedMotion ? 0 : motion.durationSheet,
        easing: Easing.bezier(...motion.easingOut),
      });
    } else {
      translateY.value = 400;
      backdropOpacity.value = 0;
    }
  }, [visible, reducedMotion, translateY, backdropOpacity]);

  const closeDrawer = () => {
    translateY.value = withTiming(400, {
      duration: reducedMotion ? 0 : motion.durationSheet,
      easing: Easing.bezier(...motion.easingDrawer),
    });
    backdropOpacity.value = withTiming(0, {
      duration: reducedMotion ? 0 : motion.durationSheet,
    });
    setTimeout(onClose, reducedMotion ? 0 : motion.durationSheet);
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 80 || event.velocityY > 500) {
        runOnJS(closeDrawer)();
      } else {
        translateY.value = withTiming(0, {
          duration: motion.durationPress,
          easing: Easing.bezier(...motion.easingOut),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={closeDrawer}>
      <View style={styles.root}>
        <AnimatedPressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }, backdropStyle]}
          onPress={closeDrawer}
        />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
              sheetStyle,
              style,
            ]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.md,
    width: 36,
  },
});
