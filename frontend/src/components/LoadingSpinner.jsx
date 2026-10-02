import { clsx } from 'clsx';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

const LoadingSpinner = ({ size = 'md', className }) => (
  <div
    className={clsx(
      'animate-spin rounded-full border-brand-600 border-t-transparent dark:border-brand-400 dark:border-t-transparent',
      sizes[size] || sizes.md,
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
