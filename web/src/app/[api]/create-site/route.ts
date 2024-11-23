import { z } from 'zod';
import { NextResponse } from 'next/server';
import { db } from '@/db/db'; // Assuming you have a db instance set up
import { siteTable } from '@/db/schema/site.db'; // Adjust the import based on your actual schema

// Define the schema for the request body
const createSiteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL format'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createSiteSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body: ' + parsedBody.error.message },
        { status: 400 }
      );
    }

    const { name, url } = parsedBody.data;

    // Insert the new site into the database
    await db
      .insert(siteTable)
      .values({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        name,
        url,
      })
      .execute();

    return NextResponse.json({ message: 'Site created successfully!' });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
