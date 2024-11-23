import { OpenAPIHono, z, createRoute } from '@hono/zod-openapi';
import { AppContext } from '.';

// CREATE TRACK ROUTE
const startCrawlRoute = createRoute({
	method: 'post',
	path: '/',
	request: {
		params: z.object({
			siteId: z.string(),
			url: z.string().url(),
		}),
	},
	responses: {
		200: {
			description: 'Start a crawl',
			content: {
				'application/json': {
					schema: z.object({
						workflowId: z.string(),
					}),
				},
			},
		},
	},
});

export const crawlRouter = new OpenAPIHono<AppContext>().openapi(startCrawlRoute, async (ctx) => {
	const { siteId, url } = ctx.req.valid('param');

	// spawn workflow
	const firecrawlWorkflow = ctx.env.FIRECRAWL_WORKFLOW;
	const newId = crypto.randomUUID();
	const instance = await firecrawlWorkflow.create({ id: newId, params: { siteId, url } });

	return ctx.json({ workflowId: instance.id }, 200);
});
