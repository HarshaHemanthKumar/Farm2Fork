import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from './theme';

export const Button = ({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }) => {
  const btnStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  return (
    <TouchableOpacity
      style={btnStyles}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.colors.primary : '#FFF'} size="small" />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: theme.radius.md,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  accent: {
    backgroundColor: theme.colors.accent,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: { paddingVertical: 8, paddingHorizontal: 16 },
  size_md: { paddingVertical: 12, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32 },
  disabled: { opacity: 0.5 },
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  text_primary: { color: '#FFF' },
  text_secondary: { color: theme.colors.primary },
  text_accent: { color: '#FFF' },
  text_danger: { color: '#FFF' },
  text_ghost: { color: theme.colors.textSecondary },
  textSize_sm: { fontSize: theme.fontSize.sm },
  textSize_md: { fontSize: theme.fontSize.base },
  textSize_lg: { fontSize: theme.fontSize.lg },
});
