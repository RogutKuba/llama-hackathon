// <docs-tag name="full-workflow-example">
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

type Env = {
	// Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.
	FIRECRAWL_WORKFLOW: Workflow;
};

// User-defined params passed to your workflow
type Params = {
	siteId: string;
	url: string;
};

export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		//
	}
}
