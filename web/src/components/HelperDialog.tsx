'use client';

import * as React from 'react';

import {
  CommandDialog,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@radix-ui/react-dialog';
import {
  ActionResponse,
  getAction,
  performActionInDom,
} from '@/query/action.query';
import { useState } from 'react';
import { useEffect } from 'react';
import { takeWindowScreenshot } from '@/lib/screenshot';
import { annotatePage, unannotatePage } from '@/lib/markPage';
import { CustomCursor } from '@/app/browser-actions/CustomCursor';
import { useTrajectory } from '@/lib/traj';
import { useCheckRefresh } from '@/lib/checkRefresh';

type CursorParams = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  actionCallbackData: ActionResponse;
  clearCursorParamsCallback: () => void;
  nextActionCallback: () => void;
};

export const HelperDialog = () => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { clearTrajectory } = useTrajectory();

  useCheckRefresh({
    wasRefreshedCallback: async (params) => {
      console.log('wasRefreshedCallback', params);
      setPrompt(params.prompt);

      await takeNextAction();
    },
  });

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
    handleOpenChange(false, true);
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

    const actionResponse = await getAction({
      user_prompt: params.prompt,
      // url: window.location.href,
      screenshot: params.screenshot,
      coordinates: params.coordinates,
    });

    if (!actionResponse) {
      return;
    }

    handleActionResponse(actionResponse);

    return actionResponse;
  };

  const handleOpenChange = async (open: boolean, wasSubmitted?: boolean) => {
    console.log('handleOpenChange', open);
    // if opening, take screenshot first
    if (open) {
      console.log('clearing screenshot');
      setOpen(open);
    } else {
      setOpen(open);

      // await 200ms
      if (wasSubmitted) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        // annotate the page
        const { screenshot, coordinates } = await annotateAndTakeScreenshot();

        await getFirstAction({
          screenshot,
          prompt,
          coordinates,
        });
      }
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
      return;
    }

    handleActionResponse(actionResponse);
  };

  const handleActionResponse = (actionResponse: ActionResponse) => {
    // if action is scroll, don't animate, just perform the action
    if (actionResponse.result.action.toLowerCase().includes('scroll')) {
      performActionInDom(actionResponse);

      // wait 2 seconds and take the next action
      setTimeout(() => {
        takeNextAction();
      }, 2000);
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
