'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { useSites } from '@/query/sites.query';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SidebarItemClassNames = {
  base: 'w-full flex justify-normal items-center gap-x-2.5 rounded-md px-2 py-2 text-sm font-medium transition hover:bg-muted/70 hover:text-primary/70',
  active: 'text-primary/70 bg-muted/70',
  subItem: 'hover:bg-background bg-background',
};

export const Sidebar = () => {
  const { sites } = useSites();

  return (
    <nav className='min-w-64 h-full min-h-screen flex flex-col justify-between bg-background border-r'>
      <div className='flex-grow p-4'>
        <Link href='/sites/new'>
          <h2 className='text-xl font-bold mb-4'>Add new site</h2>
        </Link>
        <ul>
          {sites?.map((site) => (
            <Link href={`/sites/${site.id}`} key={site.id}>
              <li
                key={site.id}
                className={cn(
                  SidebarItemClassNames.base,
                  'hover:cursor-pointer'
                )}
              >
                {site.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>

      <div className='p-4 flex justify-center items-center'>
        <UserButton showName />
      </div>
    </nav>
  );
};
