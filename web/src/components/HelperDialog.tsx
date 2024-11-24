'use client';

import * as React from 'react';

import {
  CommandDialog,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@radix-ui/react-dialog';
import { getAction } from '@/query/action.query';
import { useState } from 'react';
import { useEffect } from 'react';

type CursorParams = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
};

export const HelperDialog = () => {
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

  const onSubmit = async (data: string) => {
    setOpen(false);
    setLoading(true);
    console.log(data);

    await getAction({
      user_prompt: data,
      url: window.location.href,
    });

    // setCursorParams({
    //   start: { x: 100, y: 100 },
    //   end: { x: action.x, y: action.y },
    //   duration: 5000,
    // });
    setLoading(false);
  };

  return (
    <>
      {loading && <div className='fixed inset-0 bg-black/50 z-50' />}
      <CommandDialog open={open} onOpenChange={setOpen}>
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
              onSubmit(prompt);
            }
          }}
        />
        <CommandList />
      </CommandDialog>
    </>
  );
};
