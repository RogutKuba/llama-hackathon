'use client';

import { AddContextDialog } from '@/components/AddContextDialog';
import { AppContainer } from '@/components/AppContainer';
import { useContextChunks } from '@/query/contextChunk.query';

export default function SitePage() {
  const { contextChunks } = useContextChunks();

  return (
    <AppContainer>
      <div className='flex w-full justify-between'>
        <h1 className='text-2xl font-bold'>Add Context Chunks</h1>
        <div>
          <AddContextDialog />
        </div>
      </div>

      <div className='flex flex-col gap-4 mt-4'>
        <h1 className='text-lg font-medium'>Current Context Chunks</h1>
        <div className='grid grid-cols-2 gap-4'>
          {contextChunks?.map((chunk) => (
            <ContextChunk key={chunk.id} chunk={chunk} />
          ))}
        </div>
      </div>
    </AppContainer>
  );
}

const ContextChunk = ({
  chunk,
}: {
  chunk: {
    content: string;
    sourceId: string;
  };
}) => {
  return (
    <div className='p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow'>
      <h2 className='text-lg font-bold'>{chunk.sourceId}</h2>
      <div className='mt-2 text-gray-700'>{chunk.content.slice(0, 300)}...</div>
    </div>
  );
};
