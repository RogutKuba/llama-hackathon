import { z } from 'zod';
import { NextResponse } from 'next/server';
import {
  ContextChunkEntity,
  contextChunkTable,
} from '@/db/schema/contextChunk.db';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { firecrawlCrawl } from '@/lib/firecrawl';

const postParams = z.object({
  siteId: z.string(),
  documentationUrl: z.string().url(),
  rawText: z.string(),
});

const MAX_CONTEXT_CHUNK_SIZE = 100000;

const breakUpTextIntoChunks = (text: string) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_CONTEXT_CHUNK_SIZE) {
    chunks.push(text.slice(i, i + MAX_CONTEXT_CHUNK_SIZE));
  }
  return chunks;
};

const getQueryParams = z.object({
  siteId: z.string(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = getQueryParams.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!queryParams.success) {
    return NextResponse.json(
      { error: 'Invalid request query params:' + queryParams.error.message },
      { status: 400 }
    );
  }
  const { siteId } = queryParams.data;

  const contextChunks = await db
    .select()
    .from(contextChunkTable)
    .where(eq(contextChunkTable.siteId, siteId));
  return NextResponse.json(contextChunks);
}

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
if (!NEXT_PUBLIC_URL) {
  throw new Error('NEXT_PUBLIC_URL is not set');
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = postParams.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Invalid request body:' + parsedBody.error.message },
      { status: 400 }
    );
  }
  const { siteId, documentationUrl, rawText } = parsedBody.data;

  if (rawText.length > 0) {
    const chunks = breakUpTextIntoChunks(rawText);

    const sourceId = crypto.randomUUID();
    const chunkEntities: ContextChunkEntity[] = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      content: chunk,
      position: index,
      siteId,
      sourceId,
      sourceType: 'raw-text',
      processed: false,
    }));

    await db.insert(contextChunkTable).values(chunkEntities);
  }

  // if documentationUrl is provided, start firecrawl crawling
  await firecrawlCrawl(documentationUrl, {
    limit: 1,
    webhook: `${NEXT_PUBLIC_URL}/api/crawler-webhook/${siteId}`,
  });

  return NextResponse.json({ success: true });
}
