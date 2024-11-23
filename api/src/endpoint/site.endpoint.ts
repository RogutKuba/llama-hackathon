import { Hono } from 'hono';
import { siteTable } from '../db/schema/site.db';
import { getDbConnection } from '../db/db';
import { AppContext } from '..';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { ErrorResponses } from './errors';

const getSitesRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      description: 'List all user diss tracks',
      content: {
        'application/json': {
          schema: z.array(z.any()),
        },
      },
    },
    ...ErrorResponses,
  },
});

const createSiteRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            url: z.string(),
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
            message: z.string(),
          }),
        },
      },
    },
    ...ErrorResponses,
  },
});

export const siteRouter = new OpenAPIHono<AppContext>()
  .openapi(getSitesRoute, async (ctx) => {
    const db = getDbConnection(ctx);

    const sites = await db.select().from(siteTable);

    return ctx.json(sites);
  })
  .openapi(createSiteRoute, async (ctx) => {
    const db = getDbConnection(ctx);
    const { name, url } = ctx.req.valid('json');

    console.log(name, url);

    // Insert the new site into the database
    await db.insert(siteTable).values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      name,
      url,
    });

    return ctx.json({ message: 'Site created successfully!' });
  });
