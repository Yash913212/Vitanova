import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function ImagePreview({ uri, onRemove }) {
  if (!uri) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      {onRemove && (
        <TouchableOpacity style={styles.closeBtn} onPress={onRemove}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md, backgroundColor: COLORS.surface },
  image: { width: '100%', height: 220, borderRadius: RADIUS.lg },
  closeBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: COLORS.textInverse, fontSize: 14, fontWeight: '700' },
});
