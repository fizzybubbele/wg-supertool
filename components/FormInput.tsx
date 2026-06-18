import { Platform, StyleSheet, TextInput, type TextInputProps } from 'react-native';

type FormInputProps = TextInputProps & {
  label?: string;
};

export function FormInput({ style, ...props }: FormInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9ca3af"
      style={[styles.input, Platform.OS === 'web' && styles.inputWeb, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWeb: {
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
});
