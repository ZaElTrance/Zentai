// ============================================================================
// HenVideo — Main App Entry Point
// Direct to HomeScreen with new split layout (no more tabs)
// ============================================================================

import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/components/HomeScreen';
import PlayerScreen from './src/components/PlayerScreen';
import type { VideoItem, SearchResult } from './src/types';

export default function App() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Handle video selection from home grid → go to player
  const handleSelectVideo = useCallback((video: VideoItem) => {
    setSelectedVideo(video);
  }, []);

  // Handle back from player
  const handleBackFromPlayer = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // ---- If video selected, show player ----
  if (selectedVideo) {
    return <PlayerScreen video={selectedVideo} onBack={handleBackFromPlayer} />;
  }

  // ---- Main home screen with split layout ----
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar style="light" />
      <HomeScreen onSelectVideo={handleSelectVideo} />
    </View>
  );
}
