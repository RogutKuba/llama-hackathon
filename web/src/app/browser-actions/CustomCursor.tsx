import { useEffect, useRef } from 'react';

interface CursorProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number; // in milliseconds
}

export const CustomCursor = ({ start, end, duration }: CursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (cursor) {
      // Set initial position
      cursor.style.left = `${start.x}px`;
      cursor.style.top = `${start.y}px`;

      // Animate to the end position
      const animation = cursor.animate(
        [
          { transform: `translate(${start.x}px, ${start.y}px)` },
          { transform: `translate(${end.x}px, ${end.y}px)` },
        ],
        {
          duration: duration,
          fill: 'forwards',
          easing: 'ease-in-out',
        }
      );

      return () => animation.cancel();
    }
  }, [start, end, duration]);

  return (
    <div className='h-20 w-20'>
      <h2>awdwad</h2>
      <div ref={cursorRef} className='absolute z-1000 w-4 h-4'>
        <div className='w-fit text-xs bg-green-300 border border-gray-500 rounded-full px-2 py-1 whitespace-nowrap'>
          AI Tour Guide
        </div>

        <img src='/cursor-icon.svg' />
      </div>
    </div>
  );
};
