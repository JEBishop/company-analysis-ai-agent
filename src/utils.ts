import { NewsStory } from "./types.js";

export const formatHtml = (data: any) => {
    const company = Array.isArray(data?.results) ? data?.results[0] : data?.results;
    return `
        <html>
        <head>
            <title>${company?.basic_info?.name} Report</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; background: #f4f4f4; }
                h1 { color: #333; }
                h2 { color: #444; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
                p, ul { background: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                ul { list-style: none; }
                li { margin-bottom: 5px; }
                a { color: #007BFF; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>${company?.basic_info?.name}</h1>
            <h2>Description</h2>
            <p>${company?.basic_info?.description}</p>
            <h2>Website</h2>
            <p><a href="${company?.basic_info?.website}">${company?.basic_info?.website}</a></p>
            <h2>Crunchbase URL</h2>
            <p><a href="${company?.funding?.crunchbase_url}">${company?.funding?.crunchbase_url}</a></p>
            <h2>LinkedIn URL</h2>
            <p><a href="${company?.basic_info?.linkedin_url}">${company?.basic_info?.linkedin_url}</a></p>
            <h2>Headquarters</h2>
            <p>${company?.locations?.headquarters?.city}, ${company?.locations?.headquarters?.state}, ${company?.locations?.headquarters?.country}</p>
            <h2>Employee Count</h2>
            <p>${company?.stats?.employee_count}</p>
            <h2>Specialties</h2>
            <ul>${company?.basic_info?.specialties?.map((s: string) => `<li>${s}</li>`)?.join('')}</ul>
            <h2>Industries</h2>
            <ul>${company?.basic_info?.industries?.map((i: string) => `<li>${i}</li>`)?.join('')}</ul>
            <h2>Funding Rounds</h2>
            <p>Total: ${company?.funding?.total_rounds}</p>
            <h3>Latest Funding Info</h3>
            <ul>
                <li>Type: ${company?.funding?.latest_round?.type}</li>
                <li>Date: ${company?.funding?.latest_round?.date?.year}-${company?.funding?.latest_round?.date?.month}-${company?.funding?.latest_round?.date?.day}</li>
            </ul>
            <h2>Recent News</h2>
            ${data?.news?.map((news: NewsStory) => `
                <h3><a href="${news?.link}">${news?.title}</a></h3>
                <p><strong>Source:</strong> ${news?.source}</p>
                <p>${news?.summary}</p>
            `)?.join('')}
        </body>
        </html>
    `;
}
