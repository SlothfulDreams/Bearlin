import { useQuery } from '@tanstack/react-query';

import type { ContentFilters } from '@/data/content-repository';
import type { CefrLevel } from '@/data/schemas';
import { contentRepository } from '@/data/repositories';

export const contentKeys = {
  all: ['content'] as const,
  home: (level?: CefrLevel) => [...contentKeys.all, 'home', level ?? 'A1'] as const,
  search: (filters: ContentFilters) => [...contentKeys.all, 'search', filters] as const,
  detail: (id: string) => [...contentKeys.all, 'detail', id] as const,
  chapter: (contentId: string, chapterId: string) => [...contentKeys.all, 'chapter', contentId, chapterId] as const,
  dictionary: (id: string) => [...contentKeys.all, 'dictionary', id] as const,
  grammar: (id: string) => [...contentKeys.all, 'grammar', id] as const,
};

export function useHomeFeed(level: CefrLevel = 'A1') {
  return useQuery({ queryKey: contentKeys.home(level), queryFn: () => contentRepository.getHomeFeed(level) });
}

export function useContentSearch(filters: ContentFilters = {}) {
  return useQuery({ queryKey: contentKeys.search(filters), queryFn: () => contentRepository.searchContent(filters) });
}

export function useContentDetail(id: string) {
  return useQuery({ queryKey: contentKeys.detail(id), queryFn: () => contentRepository.getContent(id), enabled: Boolean(id) });
}

export function useChapter(contentId: string, chapterId: string) {
  return useQuery({ queryKey: contentKeys.chapter(contentId, chapterId), queryFn: () => contentRepository.getChapter(contentId, chapterId), enabled: Boolean(contentId && chapterId) });
}

export function useDictionaryEntry(id?: string) {
  return useQuery({ queryKey: contentKeys.dictionary(id ?? ''), queryFn: () => contentRepository.getDictionaryEntry(id!), enabled: Boolean(id) });
}

export function useGrammarPoint(id: string) {
  return useQuery({ queryKey: contentKeys.grammar(id), queryFn: () => contentRepository.getGrammarPoint(id), enabled: Boolean(id) });
}
