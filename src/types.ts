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

export interface Company {
  basic_info: {
    name: string;
    universal_name: string;
    description: string;
    website: string;
    linkedin_url: string;
    specialties: string[];
    industries: string[];
    is_verified: boolean;
    founded_info: {
      year: number | null;
      month: number | null;
      day: number | null;
    };
    page_type: string;
    verification: {
      is_verified: boolean;
      last_verified_at: number;
    };
  };
  stats: {
    employee_count: number;
    follower_count: number;
    employee_count_range: {
      start: number;
      end: number | null;
    };
    student_count: number | null;
  };
  locations: {
    headquarters: {
      country: string;
      state: string;
      city: string;
      postal_code: string;
      line1: string;
      line2: string | null;
      is_hq: boolean;
      description: string | null;
    };
    geo_coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  media: {
    logo_url: string;
    cover_url: string;
    cropped_cover_url: string;
  };
  funding: {
    total_rounds: number;
    latest_round: {
      type: string;
      date: {
        year: number;
        month: number;
        day: number;
      };
      url: string;
      investors_count: number;
    };
    crunchbase_url: string;
  };
  links: {
    website: string;
    linkedin: string;
    job_search: string;
    sales_navigator: string | null;
    crunchbase: string;
  };
}

export interface Output {
  results: Company[];
  news: NewsStory[];
}

export const responseSchema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "A brief (4-6 sentence) summary of the company's profile."
          },
          basic_info: {
            type: "object",
            properties: {
              name: { type: "string" },
              universal_name: { type: "string" },
              description: { type: "string" },
              website: { type: "string", format: "uri" },
              linkedin_url: { type: "string", format: "uri" },
              specialties: { type: "array", items: { type: "string" } },
              industries: { type: "array", items: { type: "string" } },
              is_verified: { type: "boolean" },
              founded_info: {
                type: "object",
                properties: {
                  year: { type: ["integer", "null"] },
                  month: { type: ["integer", "null"] },
                  day: { type: ["integer", "null"] }
                }
              },
              page_type: { type: "string" },
              verification: {
                type: "object",
                properties: {
                  is_verified: { type: "boolean" },
                  last_verified_at: { type: "integer" }
                }
              }
            }
          },
          stats: {
            type: "object",
            properties: {
              employee_count: { type: "integer" },
              follower_count: { type: "integer" },
              employee_count_range: {
                type: "object",
                properties: {
                  start: { type: "integer" },
                  end: { type: ["integer", "null"] }
                }
              },
              student_count: { type: ["integer", "null"] }
            }
          },
          locations: {
            type: "object",
            properties: {
              headquarters: {
                type: "object",
                properties: {
                  country: { type: "string" },
                  state: { type: "string" },
                  city: { type: "string" },
                  postal_code: { type: "string" },
                  line1: { type: "string" },
                  line2: { type: ["string", "null"] },
                  is_hq: { type: "boolean" },
                  description: { type: ["string", "null"] }
                }
              },
              geo_coordinates: {
                type: "object",
                properties: {
                  latitude: { type: "number" },
                  longitude: { type: "number" }
                }
              }
            }
          },
          media: {
            type: "object",
            properties: {
              logo_url: { type: "string", format: "uri" },
              cover_url: { type: "string", format: "uri" },
              cropped_cover_url: { type: "string", format: "uri" }
            }
          },
          funding: {
            type: "object",
            properties: {
              total_rounds: { type: "integer" },
              latest_round: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  date: {
                    type: "object",
                    properties: {
                      year: { type: "integer" },
                      month: { type: "integer" },
                      day: { type: "integer" }
                    }
                  },
                  url: { type: "string", format: "uri" },
                  investors_count: { type: "integer" }
                }
              },
              crunchbase_url: { type: "string", format: "uri" }
            }
          },
          links: {
            type: "object",
            properties: {
              website: { type: "string", format: "uri" },
              linkedin: { type: "string", format: "uri" },
              job_search: { type: "string", format: "uri" },
              sales_navigator: { type: ["string", "null"] },
              crunchbase: { type: "string", format: "uri" }
            }
          }
        }
      }
    },
    news: { type: "array", items: { type: "object", properties: {
      title: { type: "string" },
      source: { type: "string" },
      link: { type: "string" },
      summary: { type: "string" }
    }, required: ["title", "source", "link", "summary"] } },
  },
  required: ["results", "news"]
};
