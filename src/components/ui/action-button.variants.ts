import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'min-h-12 justify-center rounded-control border px-5 active:scale-[0.99] active:opacity-80 disabled:opacity-[0.45]',
  {
    variants: {
      variant: {
        primary: 'border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark',
        secondary: 'border-line bg-element dark:border-line-dark dark:bg-element-dark',
        ghost: 'border-transparent bg-transparent',
        danger: 'border-danger bg-danger dark:border-danger-dark dark:bg-danger-dark',
      },
      compact: {
        true: 'min-h-[38px] px-4',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', compact: false },
  },
);

export const labelVariants = cva('text-small font-bold', {
  variants: {
    variant: {
      primary: 'text-white dark:text-content',
      secondary: 'text-content dark:text-content-dark',
      ghost: 'text-primary dark:text-primary-dark',
      danger: 'text-white dark:text-content',
    },
  },
  defaultVariants: { variant: 'primary' },
});
