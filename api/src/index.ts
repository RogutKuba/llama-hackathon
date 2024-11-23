import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { siteRouter } from './endpoint/site.endpoint';
import { crawlerRouter } from './endpoint/crawler.endpoint';
import { contextChunkRouter } from './endpoint/contextChunk.endpoint';

export type AppContext = {
  Bindings: {
    // env vars
    DATABASE_URL: string;
    FIRECRAWL_API_KEY: string;
    FIRECRAWL_WEBHOOK_URL: string;
  };
  Variables: {};
};

const app = new Hono<AppContext>();

app
  .use('*', logger())
  .use('*', cors())
  .route('/site', siteRouter)
  .route('/context-chunk', contextChunkRouter)
  .route('/crawler', crawlerRouter);

export default app;
