import Image from 'next/image';

export default function Home() {
  const buttons = Array.from({ length: 15 }, (_, index) => (
    <button
      key={index}
      className='rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
    >
      {index === 0 ? 'Login' : 'Garbage'}
    </button>
  ));

  const listItems = [
    'Random Item 1',
    'Random Item 2',
    'Random Item 3',
    'Random Item 4',
    'Random Item 5',
    'Random Item 6',
    'Random Item 7',
    'Random Item 8',
    'Random Item 9',
    'Random Item 10',
  ];

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <h1>Wow this is a cool site!!</h1>
        <div className='flex gap-4 items-center flex-col sm:flex-row'>
          {buttons}
        </div>
        <ul className='list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]'>
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
