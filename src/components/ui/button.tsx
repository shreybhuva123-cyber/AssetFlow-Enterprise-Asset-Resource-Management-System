'use client';

import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:     'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
        success:     'bg-success text-success-foreground shadow-sm hover:bg-success/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        xl:      'h-11 rounded-md px-10 text-base',
        icon:    'h-9 w-9',
        'icon-sm':'h-7 w-7',
        'icon-lg':'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Pass a Lucide icon component (e.g. `leftIcon={Plus}`) or any ReactNode */
  leftIcon?: React.ElementType | React.ReactNode;
  /** Pass a Lucide icon component (e.g. `rightIcon={ChevronRight}`) or any ReactNode */
  rightIcon?: React.ElementType | React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // Render icon: if it's a component constructor, instantiate it; otherwise treat as ReactNode
    const renderIcon = (icon: React.ElementType | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in (icon as object))) {
        const IconComp = icon as React.ElementType;
        return <IconComp aria-hidden="true" />;
      }
      return icon as React.ReactNode;
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          renderIcon(leftIcon)
        )}
        <Slottable>{children}</Slottable>
        {!loading && renderIcon(rightIcon)}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
