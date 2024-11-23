import { useMutation, useQuery } from '@tanstack/react-query';
import { ContextChunkEntity } from '@/db/schema/contextChunk.db';
import { useCurrentSiteId } from '@/lib/pathUtils';

export const useContextChunks = () => {
  const siteId = useCurrentSiteId();

  const query = useQuery({
    queryKey: ['contextChunks'],
    queryFn: async () => {
      const response = await fetch(`/api/context-chunk?siteId=${siteId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<ContextChunkEntity[]>;
    },
  });

  return {
    contextChunks: query.data,
    ...query,
  };
};

export const useCreateContextChunk = () => {
  const mutation = useMutation({
    mutationFn: async (data: {
      siteId: string;
      documentationUrl: string;
      rawText: string;
    }) => {
      await fetch('/api/add-context', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    meta: {
      SUCCESS_MESSAGE: 'Context chunk created successfully!',
    },
  });

  return {
    createContextChunk: mutation.mutateAsync,
    ...mutation,
  };
};
