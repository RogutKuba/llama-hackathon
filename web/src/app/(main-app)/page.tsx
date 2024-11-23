'use client';

import { AppContainer } from '@/components/AppContainer';
import { CreateSiteForm } from '@/components/CreateSiteForm';
import { HelperDialog } from '@/components/HelperDialog';

export default function Home() {
  return (
    <AppContainer className=''>
      <HelperDialog />

      <CreateSiteForm />
    </AppContainer>
  );
}
