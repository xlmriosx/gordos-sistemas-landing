import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Embla-based Carousel following shadcn's context pattern. Compose:
 * <Carousel><CarouselContent><CarouselItem/>…</CarouselContent>
 * <CarouselPrevious/><CarouselNext/></Carousel>.
 */
type EmblaApi = UseEmblaCarouselType[1];
type CarouselOrientation = 'horizontal' | 'vertical';

interface CarouselContextValue {
  emblaRef: UseEmblaCarouselType[0];
  orientation: CarouselOrientation;
  scrollPrev: () => void;
  scrollNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within <Carousel>');
  return ctx;
}

export interface CarouselProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: CarouselOrientation;
  /** Passed straight through to Embla. */
  opts?: Parameters<typeof useEmblaCarousel>[0];
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { orientation = 'horizontal', opts, className, children, ...props },
  ref,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((api: EmblaApi) => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  /* `react(set-state-in-effect)` disabled here on purpose, and it is the one
     case the rule's own help text carves out: this effect synchronizes React
     with an external system. Embla owns the scroll position, it is imperative,
     and it only exists once its ref is attached — so the first read of
     `canScrollPrev`/`canScrollNext` cannot happen during render, and without it
     both arrows render enabled on a carousel that cannot scroll yet. The
     subsequent updates already come from events, which is what the rule wants;
     what it cannot express is the initial read of an API that did not exist a
     render ago. */
  useEffect(() => {
    if (!emblaApi) return;
    // oxlint-disable-next-line react/set-state-in-effect
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        emblaRef,
        orientation,
        scrollPrev: () => emblaApi?.scrollPrev(),
        scrollNext: () => emblaApi?.scrollNext(),
        canPrev,
        canNext,
      }}
    >
      <div ref={ref} className={cn('carousel', className)} role="region" aria-roledescription="carrusel" {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

export const CarouselContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function CarouselContent({ className, ...props }, ref) {
    const { emblaRef, orientation } = useCarousel();
    return (
      <div ref={emblaRef} className="carousel-viewport">
        <div ref={ref} className={cn('carousel-track', `carousel-track--${orientation}`, className)} {...props} />
      </div>
    );
  },
);

export const CarouselItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function CarouselItem({ className, ...props }, ref) {
    return <div ref={ref} className={cn('carousel-item', className)} role="group" aria-roledescription="slide" {...props} />;
  },
);

export function CarouselPrevious({ className }: { className?: string }) {
  const { t } = useTranslation('ui');
  const { scrollPrev, canPrev } = useCarousel();
  return (
    <button type="button" className={cn('carousel-nav carousel-nav--prev', className)} onClick={scrollPrev} disabled={!canPrev} aria-label={t('action.previous')}>
      <ArrowLeft size={16} strokeWidth={1.5} />
    </button>
  );
}

export function CarouselNext({ className }: { className?: string }) {
  const { t } = useTranslation('ui');
  const { scrollNext, canNext } = useCarousel();
  return (
    <button type="button" className={cn('carousel-nav carousel-nav--next', className)} onClick={scrollNext} disabled={!canNext} aria-label={t('action.next')}>
      <ArrowRight size={16} strokeWidth={1.5} />
    </button>
  );
}
