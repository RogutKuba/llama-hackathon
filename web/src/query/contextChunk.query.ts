import { useMutation, useQuery } from '@tanstack/react-query';
import { useCurrentSiteId } from '@/lib/pathUtils';

type ContextChunkEntity = {
  id: string;
  createdAt: string;
  content: string;
  position: number;
  sourceId: string;
  sourceType: string;
  processed: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

export const useContextChunks = () => {
  const siteId = useCurrentSiteId();

  const query = useQuery({
    queryKey: ['contextChunks'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/context-chunk/${siteId}`);
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

export const useCreateCrawler = () => {
  const mutation = useMutation({
    mutationFn: async (data: { siteId: string; url: string }) => {
      const res = await fetch(`${API_URL}/crawler`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      return res.json();
    },
    meta: {
      SUCCESS_MESSAGE: 'Context chunk created successfully!',
    },
  });

  return {
    createCrawler: mutation.mutateAsync,
    ...mutation,
  };
};
