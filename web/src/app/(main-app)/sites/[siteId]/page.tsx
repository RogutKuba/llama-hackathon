'use client';

import { AddContextForm } from '@/components/AddContextForm';
import { AppContainer } from '@/components/AppContainer';
import { useContextChunks } from '@/query/contextChunk.query';

export default function SitePage() {
  const { contextChunks } = useContextChunks();

  return (
    <AppContainer>
      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-bold'>Add Context Chunks</h1>
        <AddContextForm />
      </div>

      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-bold'>Context Chunks</h1>
        <div className='flex flex-col gap-4'>
          {contextChunks?.map((chunk) => (
            <div key={chunk.id}>{chunk.content}</div>
          ))}
        </div>
      </div>
    </AppContainer>
  );
}
