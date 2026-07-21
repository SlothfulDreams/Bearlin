import type { CefrLevel } from '@/data/schemas';

// The dark: text variants keep badge labels readable on the always-pastel chip
// backgrounds; without them ThemedText's `dark:text-content-dark` (cream) wins.
export const levelClasses: Record<CefrLevel, { background: string; text: string }> = {
  A1: { background: 'bg-level-a1-bg', text: 'text-level-a1-text dark:text-level-a1-text' },
  A2: { background: 'bg-level-a2-bg', text: 'text-level-a2-text dark:text-level-a2-text' },
  B1: { background: 'bg-level-b1-bg', text: 'text-level-b1-text dark:text-level-b1-text' },
  B2: { background: 'bg-level-b2-bg', text: 'text-level-b2-text dark:text-level-b2-text' },
  C1: { background: 'bg-level-c1-bg', text: 'text-level-c1-text dark:text-level-c1-text' },
  C2: { background: 'bg-level-c2-bg', text: 'text-level-c2-text dark:text-level-c2-text' },
};
