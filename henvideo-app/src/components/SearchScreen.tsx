// ============================================================================
// HenVideo — Search Screen
// Server-side search with debounce, history, and TV D-pad navigation
// Hanime.tv only — images via CdnImage with Referer header
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '../theme';
import { searchVideos, formatViews } from '../services/api';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from '../services/cache';
import CdnImage from './CdnImage';
import type { SearchResult } from '../types';

interface SearchScreenProps {
  onSelectVideo: (video: SearchResult) => void;
}

const DEBOUNCE_MS = 600;

const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectVideo }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [focusedResultId, setFocusedResultId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const h = await getSearchHistory();
      setHistory(h);
    })();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await searchVideos(q, 20);
      setResults(response.results);
    } catch (err: any) {
      setError(err.message || 'Erreur de recherche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTextChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(text);
    }, DEBOUNCE_MS);
  };

  const handleSubmit = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      await addToSearchHistory(query.trim());
      const h = await getSearchHistory();
      setHistory(h);
    }
    doSearch(query);
  };

  const handleHistoryTap = (term: string) => {
    setQuery(term);
    doSearch(term);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search input */}
      <View style={{
        paddingHorizontal: 24, paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TextInput
            ref={inputRef}
            style={{
              flex: 1, height: 48,
              backgroundColor: COLORS.surfaceLight, borderRadius: 10,
              borderWidth: 2,
              borderColor: inputFocused ? COLORS.primary : COLORS.border,
              paddingHorizontal: 16,
              color: COLORS.textPrimary, fontSize: 16, fontWeight: '500',
            }}
            value={query}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSubmit}
            placeholder="Rechercher..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            hasTVPreferredFocus
          />
        </View>
      </View>

      {/* History */}
      {!query && history.length > 0 && (
        <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
              Recherches recentes
            </Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>Effacer</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {history.slice(0, 10).map((term) => (
              <TouchableOpacity
                key={term}
                style={{
                  height: 36, paddingHorizontal: 14, borderRadius: 18,
                  backgroundColor: COLORS.surfaceLight, borderWidth: 1,
                  borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => handleHistoryTap(term)}
              >
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14 }}>
            Recherche en cours...
          </Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 60, marginBottom: 12 }}>!</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 18, fontWeight: '600' }}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: 'row', padding: 12,
                backgroundColor: COLORS.surface, borderRadius: 10, marginBottom: 8,
                borderWidth: 2,
                borderColor: focusedResultId === item.id ? COLORS.primary : 'transparent',
              }}
              onPress={() => onSelectVideo(item)}
              onFocus={() => setFocusedResultId(item.id)}
              onBlur={() => setFocusedResultId(null)}
            >
              {/* Thumbnail with CdnImage */}
              <View style={{
                width: 120, height: 68, borderRadius: 8,
                backgroundColor: COLORS.surfaceLight, overflow: 'hidden',
              }}>
                {item.imageUrl ? (
                  <CdnImage
                    uri={item.imageUrl}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>IMG</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 }} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 16 }} numberOfLines={2}>
                  ...{item.contextBefore}
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                    {item.contextMatch}
                  </Text>
                  {item.contextAfter}...
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={{ color: COLORS.gold, fontSize: 11, fontWeight: '700' }}>
                    {item.rating}/10
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    {formatViews(item.views)} vues
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* No results */}
      {!loading && query.length >= 2 && results.length === 0 && !error && (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 60, marginBottom: 12 }}>?</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 18, fontWeight: '600' }}>Aucun resultat</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 6 }}>
            Essayez un autre terme de recherche
          </Text>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;
