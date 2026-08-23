import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const InteractiveHoverButton = React.forwardRef(({
  as: Component = 'button',
  text,
  children,
  className,
  type,
  ...props
}, ref) => {
  const label = text ?? children ?? 'Button';
  const buttonType = Component === 'button' ? (type ?? 'button') : undefined;

  return (
    <Component
      ref={ref}
      type={buttonType}
      className={cn('xj-cta', className)}
      data-slot='interactive-hover-button'
      {...props}
    >
      <span className='xj-cta__label'>{label}</span>
      <span className='xj-cta__hover' aria-hidden='true'>
        <span>{label}</span>
        <ArrowRight size={16} strokeWidth={1.7} />
      </span>
      <span className='xj-cta__fill' aria-hidden='true' />
    </Component>
  );
});

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export { InteractiveHoverButton };
