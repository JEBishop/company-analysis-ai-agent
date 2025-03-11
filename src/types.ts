export interface Input {
  companyRequest: string;
  OPENAI_API_KEY: string;
}

export interface NewsStory {
  title: string,
  source: string,
  link: string,
  summary: string
}


export interface Output {
  results: any;
  news: NewsStory[];
}

export const responseSchema = {
  type: "object",
  properties: {
    results: {
      type: ["string", "number", "boolean", "object", "array", "null"],
      items: {
        type: ["string", "number", "boolean", "object", "null"]
      }
    },
    news: { type: "array", items: { type: "object", properties: {
      title: { type: "string" },
      source: { type: "string" },
      link: { type: "string" },
      summary: { type: "string" }
    }, required: ["title", "source", "link", "summary"] } },
  },
  required: ["results"]
};
