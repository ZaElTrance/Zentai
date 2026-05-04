// ============================================================================
// HenVideo — Multi-Select Action Bar
// Bottom bar shown when multi-select mode is active for tags
// ============================================================================

import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../theme';
import styles from '../styles';

interface MultiSelectBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onApply: () => void;
  onExit: () => void;
}

const MultiSelectBar: React.FC<MultiSelectBarProps> = ({
  selectedCount,
  onDeselectAll,
  onApply,
  onExit,
}) => {
  const [focusedBtn, setFocusedBtn] = useState<string | null>(null);

  return (
    <View style={styles.multiSelectBar}>
      <View style={styles.multiSelectBarInner}>
        <View style={styles.multiSelectInfo}>
          <View style={styles.multiSelectDot} />
          <Text style={styles.multiSelectInfoText}>
            Mode multi-selection — {selectedCount} tag{selectedCount > 1 ? 's' : ''} selectionne{selectedCount > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.multiSelectActions}>
          <TouchableOpacity
            style={[styles.msButton, focusedBtn === 'clear' && styles.msButtonFocused]}
            onPress={onDeselectAll}
            onFocus={() => setFocusedBtn('clear')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonText}>Tout effacer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.msButton,
              styles.msButtonPrimary,
              focusedBtn === 'apply' && styles.msButtonPrimaryFocused,
            ]}
            onPress={onApply}
            onFocus={() => setFocusedBtn('apply')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonPrimaryText}>Appliquer ({selectedCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.msButton, focusedBtn === 'exit' && styles.msButtonFocused]}
            onPress={onExit}
            onFocus={() => setFocusedBtn('exit')}
            onBlur={() => setFocusedBtn(null)}
          >
            <Text style={styles.msButtonText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MultiSelectBar;
