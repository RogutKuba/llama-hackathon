import { SignIn, useUser } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='h-screen w-screen flex-grow flex justify-center items-center'>
      <SignIn />
    </div>
  );
}
