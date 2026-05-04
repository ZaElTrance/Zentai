// ============================================================================
// HenVideo — Tag Chip Component
// Safe focus handling, no complex animations, TV D-pad compatible
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { COLORS, LONG_PRESS_DURATION } from '../theme';
import styles from '../styles';

interface TagChipProps {
  tag: string;
  count?: number;
  selected: boolean;
  multiSelectMode: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  count,
  selected,
  multiSelectMode,
  onToggle,
  onLongPress,
}) => {
  const [focused, setFocused] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => {
    setFocused(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
      longPressTimer.current = null;
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const chipBg = selected
    ? COLORS.primary
    : focused
      ? COLORS.surfaceHover
      : COLORS.surfaceLight;
  const chipBorder = multiSelectMode
    ? COLORS.multiSelect
    : focused
      ? COLORS.white
      : 'transparent';
  const chipBorderWidth = focused ? 3 : selected ? 2 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.tagChip,
        {
          backgroundColor: chipBg,
          borderColor: chipBorder,
          borderWidth: chipBorderWidth,
          transform: [{ scale: focused ? 1.1 : 1 }],
        },
        multiSelectMode && styles.tagChipMultiSelect,
        selected && styles.tagChipSelected,
      ]}
      onPress={onToggle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      {multiSelectMode && selected && (
        <View style={styles.checkmarkCircle}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
      <Text
        style={[
          styles.tagChipText,
          selected && styles.tagChipTextSelected,
          focused && styles.tagChipTextFocused,
          multiSelectMode && styles.tagChipTextMulti,
        ]}
      >
        {tag}{count !== undefined ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default TagChip;
