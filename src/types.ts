export interface CompanyDetails {
  title: string;
  company: string;
  location: string;
  link: string;
  match_score: number;
  match_reason: string;
  sample_cover_letter: string;
}

export interface Input {
  companyRequest: string;
  OPENAI_API_KEY: string;
}

export interface Output {
  results: any;
}


export const responseSchema = {
  type: "object",
  properties: {
    results: {
      type: ["string", "number", "boolean", "object", "array", "null"],
      items: {
        type: ["string", "number", "boolean", "object", "null"]
      }
    }
  },
  required: ["results"]
};
