import { z } from 'zod';
import { NextResponse } from 'next/server';

export const postParams = z.object({
  // files: z.array(z.instanceof(File)),
  documentationUrl: z.string().url(),
  rawText: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = postParams.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Invalid request body:' + parsedBody.error.message },
      { status: 400 }
    );
  }
  const { documentationUrl, rawText } = parsedBody.data;

  console.log(documentationUrl, rawText);
  return NextResponse.json({ message: 'Hello, world!' });
}
