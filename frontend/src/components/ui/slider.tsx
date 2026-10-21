import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

/**
 * Radix Slider: supports single value or range (pass an array of values). One
 * thumb is rendered per value. Styled with the brand `.slider-*` classes.
 */
export const Slider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...props }, ref) {
  const { t } = useTranslation('ui');
  const thumbs = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root ref={ref} className={cn('slider', className)} {...props}>
      <SliderPrimitive.Track className="slider-track">
        <SliderPrimitive.Range className="slider-range" />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="slider-thumb"
          aria-label={t('status.value', { index: i + 1 })}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
