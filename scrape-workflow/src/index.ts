import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { crawlRouter } from './endpoint';

export type AppContext = {
	Bindings: {
		FIRECRAWL_WORKFLOW: Workflow;
		FIRECRAWL_API_KEY: string;
	};
	Variables: {};
};

const app = new Hono<AppContext>();

app.use('*', logger());
app.route('/crawl', crawlRouter);

export default app;
