import { ActionResponse, performActionInDom } from '@/query/action.query';
import { useEffect, useRef } from 'react';

interface CursorProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number; // in milliseconds
  actionCallbackData: ActionResponse;
  clearCursorParamsCallback: () => void;
}

export const CustomCursor = ({
  start,
  end,
  duration,
  actionCallbackData,
  clearCursorParamsCallback,
}: CursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (cursor) {
      // Set initial position
      cursor.style.left = `0px`;
      cursor.style.top = `-25px`;

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

      console.log('ending', end);

      // when animation is done, perform the action
      animation.onfinish = () => {
        performActionInDom(actionCallbackData);
        clearCursorParamsCallback();
      };

      return () => animation.cancel();
    }
  }, [start, end, duration]);

  return (
    <div ref={cursorRef} className='absolute z-1000 w-4 h-4'>
      <div className='w-fit text-xs bg-green-300 border border-gray-500 rounded-full px-2 py-1 whitespace-nowrap'>
        AI Tour Guide
      </div>

      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='36'
        height='48'
        viewBox='0 0 24 24'
      >
        <path
          fill='#FFF'
          stroke='#000'
          stroke-width='1'
          d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'
        ></path>
      </svg>
    </div>
  );
};
