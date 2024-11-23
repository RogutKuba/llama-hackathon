import { useMutation, useQuery } from '@tanstack/react-query';
import { SiteEntity } from '@/db/schema/site.db';

export const useSites = () => {
  const query = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await fetch('/api/get-sites');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json() as Promise<SiteEntity[]>;
    },
  });

  return {
    sites: query.data,
    ...query,
  };
};

export const useCreateSite = () => {
  const mutation = useMutation({
    mutationFn: async (data: { name: string; url: string }) => {
      await fetch('/api/create-site', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    meta: {
      SUCCESS_MESSAGE: 'Site created successfully!',
    },
  });

  return {
    createSite: mutation.mutateAsync,
    ...mutation,
  };
};
