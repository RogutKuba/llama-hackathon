const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
if (!FIRECRAWL_API_KEY) {
  throw new Error('FIRECRAWL_API_KEY is not set');
}

type FirecrawlScrapeResponse = {
  success: boolean;
  data: {
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
  };
};

export const firecrawlScrape = async (
  url: string
): Promise<FirecrawlScrapeResponse> => {
  const response = await fetch(`https://api.firecrawl.dev/v1/scrape`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  return response.json() as Promise<FirecrawlScrapeResponse>;
};

/**
 * {
  "success": true,
  "data": {
    "markdown": "<string>",
    "html": "<string>",
    "rawHtml": "<string>",
    "screenshot": "<string>",
    "links": [
      "<string>"
    ],
    "actions": {
      "screenshots": [
        "<string>"
      ]
    },
    "metadata": {
      "title": "<string>",
      "description": "<string>",
      "language": "<string>",
      "sourceURL": "<string>",
      "<any other metadata> ": "<string>",
      "statusCode": 123,
      "error": "<string>"
    },
    "llm_extraction": {},
    "warning": "<string>"
  }
}
 */
