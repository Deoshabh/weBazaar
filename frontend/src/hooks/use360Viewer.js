
import { useState, useRef, useCallback, useEffect } from 'react';
import anime from 'animejs';

export function use360Viewer({ images, sensitivity = 3 }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const dragStartX = useRef(null);
  const velocityRef = useRef(0);
  const lastX = useRef(null);
  const animationRef = useRef(null);
  const autoRotateAnimRef = useRef(null);

  // Ensure we have frames to work with
  const frameCount = images?.length || 0;

  const clampFrame = useCallback((f) => {
      if (frameCount === 0) return 0;
      return ((f % frameCount) + frameCount) % frameCount;
  }, [frameCount]);

  const handleDragStart = useCallback((clientX) => {
    dragStartX.current = clientX;
    lastX.current = clientX;
    
    // Stop any ongoing inertia or auto-rotation
    if (animationRef.current) anime.remove(animationRef.current);
    if (autoRotateAnimRef.current) {
        autoRotateAnimRef.current.pause();
        autoRotateAnimRef.current = null;
    }
  }, []);

  const handleDragMove = useCallback((clientX) => {
    if (dragStartX.current === null || frameCount === 0) return;
    
    const deltaX = clientX - lastX.current;
    velocityRef.current = deltaX;
    lastX.current = clientX;
    
    // Calculate frame change based on total drag distance from start
    // Using simple delta accumulation might drift, but here we update state continuously.
    // A better approach for "scrubbing" is tracking total delta.
    
    // Let's rely on relative movement per event for simplicity in React state updates
    // But to avoid "stutter" with small sensitivity, we might want to accumulate sub-pixels.
    // For now, raw pixel-to-frame mapping:
    
    // We actually need to track global position if we want 1:1, but here we want speed control.
    // Sensitivity = pixels per frame. High sensitivity = slow rotation.
    // Actually, usually "sensitivity" means speed. Let's say dragFactor.
    // If sensitivity is "pixels needed to move 1 frame":
    
    const moveAmount = deltaX; 
    // If we move 10px and sensitivity is 5, we move 2 frames.
    
    // To support sub-pixel/slow movement, we should accumulate.
    // But for a simple MVP, let's just add delta/sensitivity.
    // Proper way:
    
    // We update state.
    // Note: updating state on every pixel move might be expensive if rendering is heavy.
    // Canvas rendering is fast.
    
    // For smoother control, we can invert sensitivity: higher = faster? 
    // Let's stick to "pixels per frame" as '1/sensitivity' is speed.
    // A good default is 10px drag = 1 frame? Or 3px?
    
    // Let's implement an accumulator if we want precise low-speed.
    
    const frameDelta = -1 * (deltaX / sensitivity); // Invert: drag left (negative) -> rotate right (positive frame index)? 
    // Standard: Drag left -> rotate object left (show right side). 
    // If frames are 0..36 (front..right..back..left), increasing index usually rotates object "counter-clockwise" or viewer "clockwise".
    // Let's try direct mapping first.
    
    setCurrentFrame(prev => clampFrame(Math.round(prev + (deltaX > 0 ? -1 : 1)))); 
    // Wait, simple integer step is jumpy.
    
  }, [frameCount, sensitivity, clampFrame]);
  
  // Improved Drag Handler with accumulator
  const accumulatedDelta = useRef(0);
  
  const handleDragMoveImproved = useCallback((clientX) => {
      if (dragStartX.current === null || frameCount === 0) return;
      
      const deltaX = clientX - lastX.current;
      velocityRef.current = deltaX;
      lastX.current = clientX;
      
      accumulatedDelta.current += deltaX;
      
      if (Math.abs(accumulatedDelta.current) >= sensitivity) {
          const framesToMove = Math.floor(Math.abs(accumulatedDelta.current) / sensitivity) * (accumulatedDelta.current > 0 ? -1 : 1);
          setCurrentFrame(prev => clampFrame(prev + framesToMove));
          accumulatedDelta.current = accumulatedDelta.current % sensitivity; // Keep remainder
      }
  }, [frameCount, sensitivity, clampFrame]);

  const handleDragEnd = useCallback(() => {
    dragStartX.current = null;
    const velocity = velocityRef.current;
    
    // Momentum
    if (Math.abs(velocity) > 0.5) {
        const target = { val: 0 };
        const momentumDuration = Math.min(Math.abs(velocity) * 100 + 300, 1000); // Dynamic duration
        const distance = velocity * 10; // How far to spin
        
        animationRef.current = anime({
          targets: target,
          val: distance,
          easing: 'easeOutExpo',
          duration: momentumDuration,
          update: (anim) => {
             // We need to apply the DELTA of the animation value, not absolute.
             // Or easier: animate a 'velocity' value down to 0 and apply it per frame?
             // AnimeJS is good at tweening values.
             // Let's tween a virtual "frame offset" from 0 to N.
          }
        });
        
        // Simpler momentum: animate a generic object to simulate decay
        let vel = velocity;
        const decay = () => {
             if (dragStartX.current !== null) return; // User grabbed again
             
             vel *= 0.92; // Friction
             if (Math.abs(vel) < 0.1) return;
             
             setCurrentFrame(prev => clampFrame(prev + (vel > 0 ? -1 : 1))); 
             // Note: using integer set state in loop is bad for React 18 batching if not careful, but works for RAF.
             // For AnimeJS, we should use its tick.
             
             requestAnimationFrame(decay);
        };
        requestAnimationFrame(decay);
    }
  }, [clampFrame]);

  // Auto-rotate
  const startAutoRotate = useCallback((rpm = 2) => {
    if (frameCount === 0) return;
    if (autoRotateAnimRef.current) return; // already running

    const msPerRotation = 60000 / rpm;
    
    // We animate a value from 0 to frameCount essentially, infinitely.
    // Actually, better to just update frame every X ms.
    
    /* 
       Issues with AnimeJS for infinite looping discrete frames:
       It's designed for smooth values.
       We can animate a proxy object { frameIndex: 0 } -> { frameIndex: frameCount } 
       and in update() set the state.
    */
   
    const proxy = { frame: currentFrame };
    
    autoRotateAnimRef.current = anime({
        targets: proxy,
        frame: currentFrame + frameCount,
        duration: msPerRotation,
        easing: 'linear',
        loop: true,
        update: () => {
            setCurrentFrame(Math.floor(proxy.frame) % frameCount);
        }
    });

  }, [frameCount, currentFrame]);

  const stopAutoRotate = useCallback(() => {
      if (autoRotateAnimRef.current) {
          autoRotateAnimRef.current.pause();
          autoRotateAnimRef.current = null;
      }
  }, []);

  useEffect(() => {
      return () => {
          if (autoRotateAnimRef.current) autoRotateAnimRef.current.pause();
          if (animationRef.current) anime.remove(animationRef.current);
      }
  }, []);

  return {
    currentFrame,
    handleDragStart,
    handleDragMove: handleDragMoveImproved,
    handleDragEnd,
    startAutoRotate,
    stopAutoRotate,
    currentImageSrc: images?.[currentFrame] || ''
  };
}
