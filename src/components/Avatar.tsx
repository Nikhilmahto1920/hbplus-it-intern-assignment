import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  fontSize?: number;
}

export function Avatar({
  uri,
  name,
  size = 48,
  fontSize = 18,
}: AvatarProps) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri && !imgError) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          containerStyle,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.borderLight,
          },
        ]}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        containerStyle,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primaryBorder,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1.5,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
