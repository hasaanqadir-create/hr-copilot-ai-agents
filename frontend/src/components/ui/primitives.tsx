import { HTMLAttributes, InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'gradient';
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono font-medium tracking-wide border',
        tone === 'neutral' && 'bg-white/5 text-secondary border-white/10',
        tone === 'accent' && 'bg-accent/10 text-accent border-accent/20',
        tone === 'success' && 'bg-success/10 text-success border-success/20',
        tone === 'warn' && 'bg-warn/10 text-warn border-warn/20',
        tone === 'danger' && 'bg-danger/10 text-danger border-danger/20',
        tone === 'gradient' && 'border-0 text-white',
        className
      )}
      style={tone === 'gradient' ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' } : undefined}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-xl px-4 py-3 text-sm transition-all duration-200',
        'bg-white/5 border text-primary placeholder:text-muted',
        'focus:outline-none focus:border-accent focus:bg-white/8',
        className
      )}
      style={{ borderColor: 'var(--border)' }}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 resize-none',
        'bg-white/5 border text-primary placeholder:text-muted',
        'focus:outline-none focus:border-accent',
        className
      )}
      style={{ borderColor: 'var(--border)' }}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export function Label({ className, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx('mb-2 block text-xs font-medium uppercase tracking-widest text-muted', className)}
      {...props}
    />
  );
}
