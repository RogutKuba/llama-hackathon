import { useMutation, useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

type SiteEntity = {
  id: string;
  name: string;
  url: string;
};

export const useSites = () => {
  const query = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/site`);
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
      const response = await fetch(`${API_URL}/site`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Could not create site');
      }
      return response.json();
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
