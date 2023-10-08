import { useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, setSize]);

  return size;
};

export const useHover = (elementRef) => {
  const [isHovered, setHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.addEventListener('mouseenter', () => setHovered(true));
    element.addEventListener('mouseleave', () => setHovered(false));
  });

  return isHovered;
};

export const useFocus = (elementRef) => {
  const [isFocused, setFocused] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.addEventListener('focus', () => setFocused(true));
    element.addEventListener('blur', () => setFocused(false));
  });

  return isFocused;
};
