// ============================================================================
// HenVideo — Styles
// Netflix/Plex/Disney+ inspired 10-foot TV UI
// ============================================================================

import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ==================== HEADER ====================
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginRight: 12,
  },
  tvBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.multiSelect,
  },
  tvBadgeText: {
    color: COLORS.multiSelect,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  videoCount: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  multiSelectBanner: {
    marginTop: 10,
    backgroundColor: COLORS.multiSelectBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.multiSelect,
  },
  multiSelectBannerText: {
    color: COLORS.multiSelect,
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== TAB BAR (Home / Search) ====================
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 24,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  // ==================== TAGS ====================
  tagsSection: {
    backgroundColor: COLORS.surface,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tagCount: {
    color: COLORS.primary,
    fontSize: 14,
  },
  tagsScroll: {
    paddingHorizontal: 0,
  },
  tagsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  // Tag chip
  tagChip: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tagChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  tagChipMultiSelect: {
    borderWidth: 2,
    borderColor: COLORS.multiSelect,
  },
  tagChipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  tagChipTextFocused: {
    fontWeight: '700',
  },
  tagChipTextMulti: {
    color: COLORS.multiSelect,
  },
  checkmarkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.multiSelect,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  clearButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceHover,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== VIDEO CARDS ====================
  videosSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  videoGrid: {
    paddingBottom: 20,
  },
  cardWrapper: {
    margin: 6,
  },
  videoCard: {
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sourceBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  playIcon: {
    fontSize: 22,
    color: COLORS.white,
    marginLeft: 3,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardViews: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniTag: {
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  miniTagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  focusLabelBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(229, 9, 20, 0.95)',
    paddingVertical: 7,
    alignItems: 'center',
  },
  focusLabelText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ==================== MULTI-SELECT BAR ====================
  multiSelectBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 2,
    borderTopColor: COLORS.multiSelect,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  multiSelectBarInner: {},
  multiSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  multiSelectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.multiSelect,
    marginRight: 8,
  },
  multiSelectInfoText: {
    color: COLORS.multiSelect,
    fontSize: 14,
    fontWeight: '600',
  },
  multiSelectActions: {
    flexDirection: 'row',
  },
  msButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  msButtonFocused: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.surfaceHover,
  },
  msButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  msButtonPrimaryFocused: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.primaryLight,
  },
  msButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  msButtonPrimaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ==================== EMPTY / LOADING ====================
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  // ==================== FOOTER ====================
  footer: {
    padding: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },

  // ==================== SEARCH ====================
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  searchInputFocused: {
    borderColor: COLORS.primary,
  },
  searchHistorySection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchHistoryTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchHistoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchHistoryChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchHistoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchResultItemFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceHover,
  },
  searchResultThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  searchResultTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  searchResultContext: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  // ==================== PLAYER ====================
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backButtonFocused: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.surfaceHover,
  },
  backButtonArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  playerHeaderInfo: {
    flex: 1,
  },
  playerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  playerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 11,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  loadingBarInner: {
    width: '60%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDetail: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    paddingVertical: 8,
  },
  backLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  controlsHint: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
  },
  controlsText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },

  // ==================== PAGE INDICATOR ====================
  pageIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pageIndicatorText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
