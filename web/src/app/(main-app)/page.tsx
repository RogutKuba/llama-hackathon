'use client';

import { AppContainer } from '@/components/AppContainer';
import { CreateSiteForm } from '@/components/CreateSiteForm';
import { HelperDialog } from '@/components/HelperDialog';
import { CustomCursor } from '../browser-actions/CustomCursor';
import { useState } from 'react';

export default function Home() {
  const [cursorParams, setCursorParams] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    duration: number;
  } | null>(null);

  const handleButtonClick = () => {
    if (cursorParams) {
      setCursorParams(null);
    } else {
      setCursorParams({
        start: { x: 100, y: 100 },
        end: { x: 500, y: 500 },
        duration: 5000,
      });
    }
  };

  return (
    <AppContainer className=''>
      <HelperDialog />

      {cursorParams ? <CustomCursor {...cursorParams} /> : null}

      <h1>Welcome to Firecrawl</h1>

      <button onClick={handleButtonClick}>
        {cursorParams ? 'Stop' : 'Start'}
      </button>
    </AppContainer>
  );
}
