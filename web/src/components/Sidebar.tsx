'use client';

import React from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

export const Sidebar = () => {
  const { user } = useUser();

  return (
    <nav className='min-w-64 h-full min-h-screen flex flex-col justify-between bg-background border-r'>
      <div className='flex-grow p-4'>
        <h2 className='text-xl font-bold mb-4'>Menu</h2>
        <ul>
          <li className='mb-2 hover:text-gray-400 cursor-pointer'>Home</li>
          <li className='mb-2 hover:text-gray-400 cursor-pointer'>About</li>
          <li className='mb-2 hover:text-gray-400 cursor-pointer'>Contact</li>
        </ul>
      </div>

      <div className='p-4 flex justify-center items-center'>
        <UserButton showName />
      </div>
    </nav>
  );
};
