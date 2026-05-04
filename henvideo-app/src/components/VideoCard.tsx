// ============================================================================
// HenVideo — Video Card Component
// Uses CdnImage (expo-image with Referer header) for hanime-cdn.com images
// Designed for 6-cards-in-a-row layout
// ============================================================================

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { COLORS } from '../theme';
import CdnImage from './CdnImage';
import type { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  onSelect: () => void;
  index: number;
  style?: any;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  index,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasPoster = !!video.posterUrl && !imgError;

  return (
    <View
      style={[
        {
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: COLORS.surface,
          borderWidth: focused ? 3 : 1,
          borderColor: focused ? COLORS.primary : COLORS.border,
          elevation: focused ? 12 : 3,
          transform: [{ scale: focused ? 1.05 : 1 }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onSelect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        activeOpacity={0.85}
        hasTVPreferredFocus={index === 0}
      >
        {/* Poster image */}
        <View style={{
          flex: 1,
          backgroundColor: COLORS.surfaceLight,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          {hasPoster ? (
            <CdnImage
              uri={video.posterUrl}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 40, height: 40, opacity: 0.3 }}
              resizeMode="contain"
            />
          )}

          {/* Rating badge */}
          {video.rating > 0 && (
            <View style={{
              position: 'absolute',
              top: 5,
              left: 5,
              backgroundColor: 'rgba(0,0,0,0.85)',
              paddingHorizontal: 5,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{ color: COLORS.gold, fontSize: 10, fontWeight: '700' }}>
                {video.rating}
              </Text>
            </View>
          )}

          {/* Uncensored badge */}
          {video.isUncensored && (
            <View style={{
              position: 'absolute',
              top: 5,
              right: 5,
              backgroundColor: 'rgba(0,0,0,0.85)',
              paddingHorizontal: 4,
              paddingVertical: 1,
              borderRadius: 3,
            }}>
              <Text style={{ color: COLORS.multiSelect, fontSize: 8, fontWeight: '700' }}>
                UNC
              </Text>
            </View>
          )}

          {/* Play overlay on focus */}
          {focused && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(229, 9, 20, 0.35)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(229, 9, 20, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: COLORS.white,
              }}>
                <Text style={{ fontSize: 16, color: COLORS.white, marginLeft: 2 }}>▶</Text>
              </View>
            </View>
          )}
        </View>

        {/* Title bar at bottom */}
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.9)',
          paddingHorizontal: 6,
          paddingVertical: 5,
          minHeight: 32,
          justifyContent: 'center',
        }}>
          <Text style={{
            color: COLORS.white,
            fontSize: 11,
            fontWeight: '700',
            lineHeight: 14,
          }} numberOfLines={2}>
            {video.name}
          </Text>
        </View>

        {/* "OK ▶ Play" label on focus */}
        {focused && (
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(229, 9, 20, 0.95)',
            paddingVertical: 4,
            alignItems: 'center',
          }}>
            <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
              OK ▶ Lire
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VideoCard;
