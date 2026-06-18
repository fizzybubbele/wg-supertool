import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputChangeEventData,
  type TextInputProps,
} from 'react-native';

import { radius, spacing, typography } from '@/constants/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

type FormInputProps = TextInputProps & {
  label?: string;
};

export function FormInput({ onChangeText, onFocus, onBlur, style, ...props }: FormInputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  const handleWebChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
    if (Platform.OS !== 'web') {
      return;
    }

    const text =
      event.nativeEvent.text ??
      (event.nativeEvent as TextInputChangeEventData & { target?: { value?: string } }).target
        ?.value ??
      '';

    onChangeText?.(text);
  };

  return (
    <TextInput
      placeholderTextColor={colors.inkSubtle}
      style={[
        styles.input,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: focused ? colors.accent : colors.border,
          borderWidth: focused ? 2 : 1,
          color: colors.ink,
        },
        Platform.OS === 'web' && styles.inputWeb,
        style,
      ]}
      onChangeText={onChangeText}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      {...(Platform.OS === 'web' ? { onChange: handleWebChange } : {})}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: radius.md,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  inputWeb: {
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
});
