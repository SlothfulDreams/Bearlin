import { textVariants } from '@/components/themed-text.variants';
import { buttonVariants, labelVariants } from '@/components/ui/action-button.variants';
import { levelClasses } from '@/components/ui/level-badge.variants';

describe('NativeWind variants', () => {
  it('produces stable button and text classes', () => {
    expect(buttonVariants({ variant: 'primary', compact: true })).toContain('bg-primary');
    expect(buttonVariants({ variant: 'primary', compact: true })).toContain('min-h-[38px]');
    expect(labelVariants({ variant: 'danger' })).toContain('text-white');
    expect(textVariants({ type: 'display' })).toContain('text-display');
  });

  it('keeps every CEFR class statically discoverable', () => {
    expect(levelClasses.A1).toEqual({
      background: 'bg-level-a1-bg',
      text: 'text-level-a1-text dark:text-level-a1-text',
    });
    expect(levelClasses.C2).toEqual({
      background: 'bg-level-c2-bg',
      text: 'text-level-c2-text dark:text-level-c2-text',
    });
  });
});
