import { db } from '@/db/db';
import { contextChunkTable } from '@/db/schema/contextChunk.db';
import { NextResponse } from 'next/server';

type WebhookEvent = {
  success: boolean;
  type: 'crawl.started' | 'crawl.page' | 'crawl.completed' | 'crawl.failed';
  id: string;
  data?: {
    markdown: string;
    html: string;
    rawHtml: string;
    screenshot: string;
    links: string[];
    actions: {
      screenshots: string[];
    };
    metadata: {
      title: string;
      description: string;
      language: string;
      sourceURL: string;
    };
    llm_extraction: Record<string, unknown>;
    warning: string;
  }[];
  error?: string;
};

export const POST = async (req: Request) => {
  // get siteId from request params
  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { success: false, error: 'Site ID is required' },
      { status: 400 }
    );
  }

  const event: WebhookEvent = await req.json();

  // Check if the event is a page crawl event
  if (event.type === 'crawl.page' && event.data) {
    try {
      // Save the scraped data to the context chunk table
      await saveToContextChunkTable({
        siteId,
        webhookEvent: event,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error saving data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save data' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, error: 'Invalid event type' },
      { status: 400 }
    );
  }
};

const saveToContextChunkTable = async (params: {
  siteId: string;
  webhookEvent: WebhookEvent;
}) => {
  const { siteId, webhookEvent } = params;

  const markdown = webhookEvent.data?.[0]?.markdown;

  if (!markdown) {
    return;
  }

  // save to context chunk table
  await db.insert(contextChunkTable).values({
    id: crypto.randomUUID(),
    createdAt: new Date(),
    siteId,
    content: markdown,
    position: 0,
    sourceId: webhookEvent.id,
    sourceType: 'website',
  });
};
