import { Actor } from 'apify';
import log from '@apify/log';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Input } from './types.js';
import { agentTools } from './tools.js'
import { responseSchema } from './types.js'
import { setContextVariable } from "@langchain/core/context";
import { RunnableLambda } from "@langchain/core/runnables";

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
Extract company names from user requests and retrieve detailed information about those companies.

## Process
1. Use extractCompanyNameTool to extract one or more company names in the user's input. Only extract company names that are included in the request.
2. For each identified company, call callCrunchbaseScraperTool to fetch company details.
3. Organize and present the information in a clear, structured format to the user.

## Implementation Steps
1. Parse the user's input to understand their request.
2. Call extractCompanyNameTool with the company names from the user's input.
3. For each company name returned by extractCompanyNameTool:
   - Call callCrunchbaseScraperTool with the company name as the parameter
   - Input: The extracted company name
   - Output: Detailed company information from Crunchbase in JSON format
          `)]
      }, {
        recursionLimit: 10
      });
      return modelResponse.structuredResponse;
    }
  );

  const output: any = await handleRunTimeRequestRunnable.invoke({ 
    companyRequest: companyRequest
  });

  log.info(JSON.stringify(output));

  await Actor.charge({ eventName: 'job-results-output', count: output.length });

  await Actor.pushData(output);
} catch (e: any) {
  console.log(e);
  await Actor.pushData({ error: e.message });
}
await Actor.exit();