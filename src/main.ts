import { Actor } from 'apify';
import log from '@apify/log';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Input, Output } from './types.js';
import { agentTools } from './tools.js'
import { responseSchema } from './types.js'
import { setContextVariable } from "@langchain/core/context";
import { RunnableLambda } from "@langchain/core/runnables";
import { formatHtml } from './utils.js';

await Actor.init();
const input = await Actor.getInput<Input>();
if (!input) throw new Error('No input provided.');

await Actor.charge({ eventName: 'init' });
const { OPENAI_API_KEY = '', companyRequest } = input;

console.log(companyRequest)

let llmAPIKey;
if(!OPENAI_API_KEY || OPENAI_API_KEY.length == 0) {
  llmAPIKey = process.env.OPENAI_API_KEY;
  await Actor.charge({ eventName: 'llm-input', count: companyRequest.length });
} else {
  llmAPIKey = OPENAI_API_KEY;
}

const agentModel = new ChatOpenAI({ 
  apiKey: llmAPIKey,
  modelName: "gpt-4o-mini",  
}).bind({
  response_format: { type: "json_object" },
  tools: agentTools
});

const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  responseFormat: responseSchema
});

try {
  const handleRunTimeRequestRunnable = RunnableLambda.from(
    async ({ companyRequest: companyRequest }) => {
      setContextVariable("companyRequest", companyRequest);
      const modelResponse = await agent.invoke({
        messages: [new HumanMessage(`
## Task Description
Act as a company research agent that extracts company names from user requests and retrieves comprehensive information about those companies, delivering insights in a structured format.

## Process
1. Analyze the user's request to identify and extract exactly one company name mentioned in their input. Only extract a company that is explicitly mentioned.
2. Retrieve detailed company information by calling the call_linkedin_scraper function with the extracted company name.
3. Perform a web search to gather recent news articles, press releases, and important developments related to the company.
4. Return this data in a JSON format.
## Example Interaction
User: "Can you tell me about Microsoft's recent cloud computing initiatives?"
Agent: [Extracts "Microsoft" → Retrieves company data → Searches for recent cloud computing news → Returns structured information about Microsoft's cloud computing initiatives]
          `)]
      }, {
        recursionLimit: 10
      });
      return modelResponse.structuredResponse as Output;
    }
  );

  const output: Output = await handleRunTimeRequestRunnable.invoke({ 
    companyRequest: companyRequest
  });
  
  log.info(JSON.stringify(output));

  await Actor.setValue('company_report.html', formatHtml(output), { contentType: 'text/html' });

  await Actor.charge({ eventName: 'company-output' });

  await Actor.pushData(output);
} catch (e: any) {
  console.log(e);
  await Actor.pushData({ error: e.message });
}
await Actor.exit();