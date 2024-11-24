'use client';

import { AppContainer } from '@/components/AppContainer';
import { HelperDialog } from '@/components/HelperDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { annotatePage } from '@/lib/markPage';
import { useMemo } from 'react';

export default function Home() {
  const handleMarkPage = () => {
    annotatePage();
  };

  const randomWords = [
    'apple',
    'banana',
    'cherry',
    'dog',
    'elephant',
    'giraffe',
    'horse',
    'iguana',
    'jaguar',
    'kangaroo',
    'leopard',
  ];

  const prefixes = useMemo(() => {
    return new Array(100).fill(0).map((_, i) => {
      const full = crypto.randomUUID();
      const prefix = full.split('-')[0];
      const word = randomWords[i % randomWords.length];

      return {
        prefix,
        word,
      };
    });
  }, []);

  const [selectedPrefix, setSelectedPrefix] = useState<string>('init');

  return (
    <AppContainer className=''>
      <HelperDialog />

      <h1>Welcome to Firecrawl</h1>

      <div className='flex gap-4'>
        <Button>Nothing button</Button>

        <Button onClick={handleMarkPage}>Mark Page</Button>
      </div>

      <div className='flex flex-wrap gap-4 mt-4'>
        {prefixes.map(({ prefix, word }, index) => (
          <div key={prefix} className='p-4 border border-gray-300 rounded-md'>
            <h2>
              {selectedPrefix} --- {word}
            </h2>

            <Button onClick={() => setSelectedPrefix(prefix)}>
              Button {index}
            </Button>
          </div>
        ))}
      </div>
    </AppContainer>
  );
}
