'use client';

import { Sidebar } from '@/components/Sidebar';
import { TanstackQueryClient } from '@/query/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={TanstackQueryClient}>
      <Sidebar />
      {children}
      <Toaster richColors theme='light' duration={1000} />
    </QueryClientProvider>
  );
}
