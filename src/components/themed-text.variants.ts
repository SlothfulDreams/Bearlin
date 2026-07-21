import { cva } from 'class-variance-authority';

export const textVariants = cva('font-sans', {
  variants: {
    type: {
      body: 'text-body font-normal',
      bodyStrong: 'text-body font-bold',
      display: 'text-display',
      title: 'text-title',
      subtitle: 'text-subtitle',
      section: 'text-section',
      small: 'text-small font-normal',
      smallBold: 'text-small font-bold',
      caption: 'text-caption font-medium',
      label: 'text-label',
      link: 'text-small font-semibold',
      linkPrimary: 'text-small font-bold',
      code: 'font-mono text-xs font-medium android:font-bold',
    },
  },
  defaultVariants: { type: 'body' },
});
