
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
  label?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeImg, afterImg, label }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const relativeX = x - containerRect.left;
    const position = Math.max(0, Math.min(100, (relativeX / containerRect.width) * 100));
    
    setSliderPos(position);
  };

  useEffect(() => {
    const handleUp = () => setIsResizing(false);
    
    if (isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-stone-200 cursor-col-resize select-none bg-stone-100 group"
      onMouseDown={() => setIsResizing(true)}
      onTouchStart={() => setIsResizing(true)}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImg} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Overlay) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img 
          src={beforeImg} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Before Label */}
        <div className="absolute top-2 left-2 bg-stone-900/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
          BEFORE
        </div>
      </div>

      {/* After Label (only visible when slider moves) */}
      <div 
        className="absolute top-2 right-2 bg-orange-600/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: sliderPos > 90 ? 0 : 1 }}
      >
        AFTER
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-stone-100 text-stone-400 group-hover:scale-110 transition-transform">
          <div className="flex items-center gap-0.5">
            <ChevronLeft className="w-3 h-3" />
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Bottom Center Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-stone-900/40 text-white text-[10px] p-1 text-center font-bold tracking-wider backdrop-blur-[2px]">
        {label}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
