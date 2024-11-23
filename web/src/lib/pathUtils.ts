import { useParams } from 'next/navigation';

export const useCurrentSiteId = () => {
  const params = useParams<{
    siteId: string;
  }>();
  return params.siteId;
};
