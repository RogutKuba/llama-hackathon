import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const TanstackQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (
      _data: unknown,
      query: Query<unknown, unknown, unknown, QueryKey>
    ): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        toast.success(`${query.meta.SUCCESS_MESSAGE}`);
      }
    },
    onError: (
      error: unknown,
      query: Query<unknown, unknown, unknown, QueryKey>
    ): void => {
      if (error instanceof Error) {
        toast.error(
          `${query.meta?.ERROR_SOURCE ?? 'Something went wrong!'}: ${
            error.message
          }`
        );
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      if (error instanceof Error) {
        toast.error(
          `${mutation.meta?.ERROR_SOURCE ?? 'Something went wrong!'}: ${
            error.message
          }`
        );
      }
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        toast.success(`${mutation.meta.SUCCESS_MESSAGE}`);
      }
    },
  }),
});
