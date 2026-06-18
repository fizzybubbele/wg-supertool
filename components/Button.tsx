import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { IconName, Plus, Receipt, iconSize } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { radius, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  iconName?: IconName;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

function renderIcon(iconName: IconName, color: string, size: number) {
  switch (iconName) {
    case 'plus':
      return <Plus color={color} size={size} strokeWidth={1.75} />;
    case 'receipt':
      return <Receipt color={color} size={size} strokeWidth={1.75} />;
    default:
      return <Plus color={color} size={size} strokeWidth={1.75} />;
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  iconName,
  style,
  fullWidth = false,
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  const isIconOnly = Boolean(iconName && !label);

  const variantStyle = getVariantStyle(variant, colors);
  const textColor = getTextColor(variant, colors);

  return (
    <PressableScale
      disabled={isDisabled}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        isIconOnly && styles.iconOnly,
        variantStyle,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : iconName && !label ? (
        <View style={styles.iconSlot}>{renderIcon(iconName, textColor, iconSize.button)}</View>
      ) : (
        <View style={styles.labelRow}>
          {iconName ? (
            <View style={styles.inlineIconSlot}>
              {renderIcon(iconName, textColor, iconSize.buttonInline)}
            </View>
          ) : null}
          {label ? <Text style={[styles.label, { color: textColor }]}>{label}</Text> : null}
        </View>
      )}
    </PressableScale>
  );
}

function getVariantStyle(variant: ButtonVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.accent };
    case 'secondary':
      return { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1 };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'destructive':
      return { backgroundColor: colors.errorSoft, borderColor: colors.border, borderWidth: 1 };
  }
}

function getTextColor(variant: ButtonVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'primary':
      return colors.onAccent;
    case 'secondary':
      return colors.ink;
    case 'ghost':
      return colors.accent;
    case 'destructive':
      return colors.error;
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  iconOnly: {
    height: 44,
    minHeight: 44,
    paddingHorizontal: 0,
    width: 44,
  },
  iconSlot: {
    alignItems: 'center',
    height: iconSize.button,
    justifyContent: 'center',
    width: iconSize.button,
  },
  inlineIconSlot: {
    alignItems: 'center',
    height: iconSize.buttonInline,
    justifyContent: 'center',
    width: iconSize.buttonInline,
  },
  disabled: {
    opacity: 0.5,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '600',
    lineHeight: iconSize.buttonInline,
  },
});
