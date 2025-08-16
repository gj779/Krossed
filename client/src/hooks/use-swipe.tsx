import { useState, useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
}

export function useSwipe(handlers: SwipeHandlers) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    const { x, y } = position;
    
    if (Math.abs(x) > threshold) {
      if (x > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (y < -threshold) {
      handlers.onSwipeUp?.();
    }
    
    setPosition({ x: 0, y: 0 });
  }, [isDragging, position, handlers]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    const { x, y } = position;
    
    if (Math.abs(x) > threshold) {
      if (x > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (y < -threshold) {
      handlers.onSwipeUp?.();
    }
    
    setPosition({ x: 0, y: 0 });
  }, [isDragging, position, handlers]);

  const swipeProps = {
    ref: elementRef,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    swipeProps,
    position,
    isDragging,
  };
}
