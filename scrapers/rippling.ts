/**
 * Rippling ATS Scraper
 *
 * Rippling serves job data embedded in __NEXT_DATA__ on their public job board pages.
 * URL pattern: https://ats.rippling.com/{slug}/jobs
 * The slug is the company's Rippling board slug.
 */

import type { CompanyConfig, Job } from "../index";

interface RipplingJob {
  id: string;
  name: string;
  url: string;
  department?: { name: string };
  locations?: Array<{
    name: string;
    workplaceType: string;
  }>;
}

interface RipplingNextData {
  props: {
    pageProps: {
      dehydratedState: {
        queries: Array<{
          state: {
            data: {
              items: RipplingJob[];
            };
          };
        }>;
      };
    };
  };
}

export async function fetchRipplingJobs(company: CompanyConfig): Promise<Job[]> {
  const pageUrl = `https://ats.rippling.com/${company.slug}/jobs`;

  try {
    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Rippling board not found for ${company.slug}`);
        return [];
      }
      throw new Error(`Rippling error: ${response.status}`);
    }

    const html = await response.text();

    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!match) {
      console.warn(`No job data found in Rippling page for ${company.slug}`);
      return [];
    }

    const nextData = JSON.parse(match[1]) as RipplingNextData;
    const queries = nextData.props?.pageProps?.dehydratedState?.queries ?? [];
    const jobsQuery = queries.find(q => q.state?.data?.items);
    const items: RipplingJob[] = jobsQuery?.state?.data?.items ?? [];

    return items.map((job): Job => ({
      id: `rippling-${company.slug}-${job.id}`,
      company: company.name,
      title: job.name,
      location: job.locations?.[0]?.name || "Not specified",
      url: job.url,
      department: job.department?.name,
    }));
  } catch (error) {
    console.error(`Error fetching Rippling jobs for ${company.name}:`, error);
    throw error;
  }
}
