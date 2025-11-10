// useScrollAnimation.js — Hook for scroll-triggered fade-in animations
import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation(options = {}) {
  // Start as visible to prevent initial hide
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if element is already in viewport
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInViewport) {
      setIsVisible(true);
      // If once is true (default), don't set up observer
      if (options.once !== false) {
        return;
      }
    } else {
      setIsVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally disconnect after first trigger
          if (options.once !== false) {
            observer.disconnect();
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.01,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [elementRef, isVisible];
}

