import { AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'inline' | 'card';
  className?: string;
  onDismiss?: () => void;
}

export function ErrorMessage({
  title = 'Error',
  message,
  variant = 'inline',
  className,
  onDismiss,
}: ErrorMessageProps) {
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-destructive">{title}</h3>
            <p className="text-sm text-destructive/90">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-destructive/70 hover:text-destructive transition-colors"
              aria-label="Tancar"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 text-destructive', className)}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
