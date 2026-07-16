import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-7 py-3.5 text-base',
          variant === 'gradient' && 'text-white shadow-glow',
          variant === 'primary' && 'text-white',
          variant === 'secondary' && 'glass text-primary hover:border-accent',
          variant === 'ghost' && 'text-secondary hover:text-primary hover:bg-white/5',
          variant === 'danger' && 'glass text-danger border-danger/30 hover:bg-danger/10',
          className
        )}
        style={
          variant === 'gradient' || variant === 'primary'
            ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', ...props.style }
            : props.style
        }
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
