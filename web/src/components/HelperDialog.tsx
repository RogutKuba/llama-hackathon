'use client';

import * as React from 'react';

import {
  CommandDialog,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@radix-ui/react-dialog';
import { ActionResponse, getAction } from '@/query/action.query';
import { useState } from 'react';
import { useEffect } from 'react';
import { takeWindowScreenshot } from '@/lib/screenshot';
import { annotatePage, unannotatePage } from '@/lib/markPage';
import { CustomCursor } from '@/app/browser-actions/CustomCursor';

type CursorParams = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  actionCallbackData: ActionResponse;
  clearCursorParamsCallback: () => void;
  nextActionCallback: () => void;
};

type HelperDialogProps = {
  setSentData: (params: { prompt: string; screenshot: string }) => void;
};

export const HelperDialog = (props: HelperDialogProps) => {
  const { setSentData } = props;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const [cursorParams, setCursorParams] = useState<CursorParams | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    console.log('onSubmit');
    handleOpenChange(false);
  };

  const getFirstAction = async (params: {
    screenshot: string;
    prompt: string;
    coordinates: {
      x: number;
      y: number;
      type: string;
      text: string;
      ariaLabel: string;
    }[];
  }) => {
    console.log('getFirstAction');
    setLoading(true);

    console.log('prompt', params.prompt);
    console.log('screenshot', params.screenshot);
    if (!params.prompt || !params.screenshot) {
      setLoading(false);
      return;
    }

    console.log('getting first action');

    setSentData({
      prompt: params.prompt,
      screenshot: params.screenshot,
    });

    const actionResponse = await getAction({
      user_prompt: params.prompt,
      // url: window.location.href,
      screenshot: params.screenshot,
      coordinates: params.coordinates,
    });

    setLoading(false);

    setCursorParams({
      start: { x: 100, y: 100 },
      end: { x: actionResponse.result.x, y: actionResponse.result.y },
      duration: 1000,
      actionCallbackData: actionResponse,
      clearCursorParamsCallback: () => setCursorParams(null),
      nextActionCallback: () => {},
    });

    return actionResponse;
  };

  const handleOpenChange = async (open: boolean) => {
    console.log('handleOpenChange', open);
    // if opening, take screenshot first
    if (open) {
      console.log('clearing screenshot');
      setOpen(open);
    } else {
      setOpen(open);

      // await 200ms
      await new Promise((resolve) => setTimeout(resolve, 200));

      // annotate the page
      const { labels, coordinates } = annotatePage();

      console.log('taking screenshot');
      const img = await takeWindowScreenshot();

      unannotatePage(labels);

      await getFirstAction({
        screenshot: img,
        prompt,
        coordinates,
      });
    }
  };

  const loopActions = async () => {
    console.log('loopActions');
  };

  return (
    <>
      {/* {loading && <div className='fixed inset-0 bg-black/20 z-50' />} */}
      {cursorParams && <CustomCursor {...cursorParams} />}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <DialogTitle className='p-4 text-md font-medium flex items-center gap-2'>
          <img
            src='/clippy.webp'
            className='w-12 h-12 bg-gray-500 rounded-full border-2 border-gray-600'
          />
          Welcome to the AI tour guide
        </DialogTitle>
        <CommandInput
          placeholder='Ask me anything'
          onValueChange={(value: string) => setPrompt(value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
        />
        <CommandList />
      </CommandDialog>
    </>
  );
};
