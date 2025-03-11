import { tool } from '@langchain/core/tools';
import { ApifyClient } from 'apify-client';
import { z } from 'zod';
import log from '@apify/log';
import OpenAI from "openai";

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const extractCompanyNameTool = tool(
  async(input) => {
    log.info('in extract_company_name');
    log.info(JSON.stringify(input));
    return JSON.stringify({
      companyName: input.companyName
    });
  },
  {
    name: 'extract_company_name',
    description: 'Convert the user\'s request into a JSON object with the company name.',
    schema: z.object({
      companyName: z.string().describe('The name of the company to scrape from Crunchbase.')
    })
  }
)

const callCrunchbaseScraperTool = tool(
  async (input) => {
    log.info('in call_crunchbase_scraper');
    log.info(JSON.stringify(input));
    try {
      // harvest/crunchbase-company-details-scraper
      const run = await client.actor("tDkWrG7WqwYB4ZsTs").call({
        crunchbaseUrl: `https://www.crunchbase.com/organization/${input.companyName}`
      });
      const { items: listings } = await client.dataset(run.defaultDatasetId).listItems();
    
      log.info(`Found ${listings.length}.`);
      return JSON.stringify(listings);
    } catch (err: any) {
      log.error('call_crunchbase_scraper error: ' + err.message);
      return JSON.stringify({ error: err.message });
    }
  },
  {
    name: 'call_crunchbase_scraper',
    description: 'Fetch company details from Crunchbase.',
    schema: z.object({
      companyName: z.string().describe('The name of the company to scrape from Crunchbase.')
    })
  }
);

const webSearchTool = tool(
  async (input) => {
    log.info('in search_query_tool');
    log.info(JSON.stringify(input));
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini-search-preview",
      messages: [{
          "role": "user",
          "content": input.topic,
      }],
    });
    return JSON.stringify(completion.choices[0].message.content);
  }, {
    name: 'search_query_tool',
    description: 'Search the web for news about a topic.',
    schema: z.object({
      topic: z.string().describe("The topic to search for news about")
    })
  }
);

export const agentTools = [
  extractCompanyNameTool,
  callCrunchbaseScraperTool,
  webSearchTool
];