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
import { useTrajectory } from '@/lib/traj';

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
  const [prompt, setPrompt] = useState('');
  const { clearTrajectory } = useTrajectory();

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
    clearTrajectory();
    console.log('getFirstAction');

    console.log('prompt', params.prompt);
    console.log('screenshot', params.screenshot);
    if (!params.prompt || !params.screenshot) {
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

    if (!actionResponse) {
      return;
    }

    setCursorParams({
      start: { x: 100, y: 100 },
      end: { x: actionResponse.result.x!, y: actionResponse.result.y! },
      duration: 1000,
      actionCallbackData: actionResponse,
      clearCursorParamsCallback: () => setCursorParams(null),
      nextActionCallback: () => takeNextAction(),
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
      const { screenshot, coordinates } = await annotateAndTakeScreenshot();

      await getFirstAction({
        screenshot,
        prompt,
        coordinates,
      });
    }
  };

  const takeNextAction = async () => {
    console.log('takingNextAction');
    const { screenshot, coordinates } = await annotateAndTakeScreenshot();

    const actionResponse = await getAction({
      user_prompt: prompt,
      screenshot,
      coordinates,
    });

    if (!actionResponse) {
      console.log('DONE THE LOOP');
      return;
    }

    setCursorParams({
      start: { x: 100, y: 100 },
      end: { x: actionResponse.result.x!, y: actionResponse.result.y! },
      duration: 1000,
      actionCallbackData: actionResponse,
      clearCursorParamsCallback: () => setCursorParams(null),
      nextActionCallback: () => takeNextAction(),
    });
  };

  const annotateAndTakeScreenshot = async () => {
    const { labels, coordinates } = annotatePage();
    const img = await takeWindowScreenshot();
    unannotatePage(labels);
    return { screenshot: img, coordinates };
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
