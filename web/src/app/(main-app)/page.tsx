'use client';

import { AppContainer } from '@/components/AppContainer';
import { CreateSiteForm } from '@/components/CreateSiteForm';
import { HelperDialog } from '@/components/HelperDialog';
import { CustomCursor } from '../browser-actions/CustomCursor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAction } from '@/query/action.query';

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

  const handleGetAction = async () => {
    const action = await getAction({
      user_prompt: 'Click start mouse button',
      url: 'http://localhost:3000',
    });

    setCursorParams({
      start: { x: 100, y: 100 },
      end: { x: action.x, y: action.y },
      duration: 5000,
    });
  };

  return (
    <AppContainer className=''>
      <HelperDialog />

      {cursorParams ? <CustomCursor {...cursorParams} /> : null}

      <h1>Welcome to Firecrawl</h1>

      <div className='flex gap-4'>
        <Button onClick={handleButtonClick}>
          {cursorParams ? 'Stop mouse' : 'Start mouse'}
        </Button>

        <Button onClick={handleGetAction}>Get Action</Button>
      </div>
    </AppContainer>
  );
}
