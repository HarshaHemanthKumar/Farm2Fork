import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from './theme';

export const Input = ({ label, error, containerStyle, ...props }) => (
  <View style={[styles.container, containerStyle]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor={theme.colors.textMuted}
      {...props}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 2, borderColor: theme.colors.border, borderRadius: theme.radius.md,
    padding: 12, fontSize: 16, backgroundColor: theme.colors.surface, color: theme.colors.text,
  },
  inputError: { borderColor: theme.colors.danger },
  error: { fontSize: 12, color: theme.colors.danger, marginTop: 4 },
});
