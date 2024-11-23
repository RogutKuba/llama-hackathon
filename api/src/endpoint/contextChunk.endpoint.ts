import { getDbConnection } from '../db/db';
import { AppContext } from '..';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { ErrorResponses } from './errors';
import { contextChunkTable } from '../db/schema/contextChunk.db';
import { eq } from 'drizzle-orm';

const getChunks = createRoute({
  method: 'get',
  path: '/:siteId',
  request: {
    params: z.object({
      siteId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List all context chunks for a site',
      content: {
        'application/json': {
          schema: z.array(z.any()),
        },
      },
    },
    ...ErrorResponses,
  },
});

export const contextChunkRouter = new OpenAPIHono<AppContext>().openapi(
  getChunks,
  async (ctx) => {
    const { siteId } = ctx.req.valid('param');
    const db = getDbConnection(ctx);

    const chunks = await db
      .select()
      .from(contextChunkTable)
      .where(eq(contextChunkTable.siteId, siteId));

    return ctx.json(chunks);
  }
);
