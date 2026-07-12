import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default:     'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5',
        success:     'border-success/50 text-success dark:border-success [&>svg]:text-success bg-success/5',
        warning:     'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning bg-warning/5',
        info:        'border-info/50 text-info dark:border-info [&>svg]:text-info bg-info/5',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

// Convenience alert with auto-icon
const alertIcons = {
  default:     Info,
  info:        Info,
  success:     CheckCircle2,
  warning:     AlertTriangle,
  destructive: AlertCircle,
} as const;

interface InlineAlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function InlineAlert({ variant = 'default', title, children, className }: InlineAlertProps) {
  const Icon = alertIcons[variant ?? 'default'];
  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export { Alert, AlertTitle, AlertDescription, InlineAlert };
