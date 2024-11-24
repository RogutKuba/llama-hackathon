import { AppContext } from '..';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { ErrorResponses } from './errors';
import { firecrawlCrawl } from '../lib/firecrawl';
import { Context } from 'hono';
import { getDbConnection } from '../db/db';
import { contextChunkTable } from '../db/schema/contextChunk.db';
import { and, eq, inArray } from 'drizzle-orm';

const startCrawlRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            url: z.string(),
            siteId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Site created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            id: z.string(),
            url: z.string(),
          }),
        },
      },
    },
    ...ErrorResponses,
  },
});

const webhookRoute = createRoute({
  method: 'post',
  path: '/webhook/:siteId',
  request: {
    params: z.object({
      siteId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Crawl webhook',
    },
  },
});

export const crawlerRouter = new OpenAPIHono<AppContext>()
  .openapi(startCrawlRoute, async (ctx) => {
    const { url, siteId } = ctx.req.valid('json');

    const crawl = await firecrawlCrawl({
      url,
      apiKey: ctx.env.FIRECRAWL_API_KEY,
      limit: 1,
      webhook: `${ctx.env.FIRECRAWL_WEBHOOK_URL}/${siteId}`,
    });

    console.log('crawl is ', crawl);

    return ctx.json(crawl);
  })
  .openapi(webhookRoute, async (ctx) => {
    const { siteId } = ctx.req.valid('param');
    const body = ctx.req.valid('json');

    switch (body.type) {
      case 'crawl.page':
        await handlePageEvent({ ctx, siteId, event: body });
        break;
      case 'crawl.completed':
        await handleCompletedEvent({ ctx, siteId, event: body });
        break;
    }

    return ctx.json({ success: true });
  });

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

const handlePageEvent = async (params: {
  ctx: Context<AppContext>;
  siteId: string;
  event: WebhookEvent;
}) => {
  const { ctx, siteId, event } = params;
  const db = getDbConnection(ctx);
  console.log('webhook event is ', event);

  if (event.type !== 'crawl.page') {
    return;
  }

  console.log('event data is ', event.data);

  const markdown = event.data?.[0]?.markdown;
  const sourceId = event.data?.[0]?.metadata.sourceURL ?? event.id;

  console.log('markdown is ', markdown);
  console.log('sourceId is ', sourceId);

  if (!markdown) {
    return;
  }

  console.log('saving to context chunk table');

  // save to context chunk table
  const res = await db
    .insert(contextChunkTable)
    .values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      siteId,
      content: markdown,
      position: 0,
      sourceId,
      sourceType: 'website',
    })
    .returning();

  console.log('res is ', res);
};

const handleCompletedEvent = async (params: {
  ctx: Context<AppContext>;
  siteId: string;
  event: WebhookEvent;
}) => {
  const { ctx, siteId, event } = params;
  const db = getDbConnection(ctx);

  // when crawl is completed, send all the context chunks to ayush
  const contextChunksToSend = await db
    .select()
    .from(contextChunkTable)
    .where(
      and(
        eq(contextChunkTable.siteId, siteId),
        eq(contextChunkTable.processed, false)
      )
    );

  if (contextChunksToSend.length === 0) {
    return;
  }

  // send to ayush
  const res = await fetch(ctx.env.EMBEDDING_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      contextChunksToSend.map((c) => ({
        id: c.id,
        content: c.content,
        siteId,
      }))
    ),
  });

  if (!res.ok) {
    console.error(
      'failed to send to embedding api',
      res,
      ctx.env.EMBEDDING_API_URL
    );
    const resBody = await res.text();
    console.error('resBody from embedding api is ', resBody);
    throw new Error('failed to send to embedding api');
  }

  const resBody = await res.text();
  console.log('resBody from embedding api is ', resBody);

  // update the context chunks to processed
  await db
    .update(contextChunkTable)
    .set({ processed: true })
    .where(
      inArray(
        contextChunkTable.id,
        contextChunksToSend.map((c) => c.id)
      )
    );
};
