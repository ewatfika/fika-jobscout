/**
 * Breezy HR ATS Scraper
 *
 * Public JSON API at https://{slug}.breezy.hr/json
 * The slug is the subdomain of the company's Breezy board.
 * e.g. pathspot.breezy.hr → slug is "pathspot"
 */

import type { CompanyConfig, Job } from "../index";

interface BreezyJob {
  id: string;
  friendly_id: string;
  name: string;
  url: string;
  published_date: string;
  type: { id: string; name: string };
  location: {
    name: string;
    city?: string;
    state?: { name: string };
    country?: { name: string };
    is_remote?: boolean;
  };
  department: string;
}

export async function fetchBreezyJobs(company: CompanyConfig): Promise<Job[]> {
  const apiUrl = `https://${company.slug}.breezy.hr/json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "JobScout/1.0 (github.com/ewatfika/jobscout)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Breezy board not found for ${company.slug}`);
        return [];
      }
      throw new Error(`Breezy API error: ${response.status}`);
    }

    const data = await response.json() as BreezyJob[];

    return data.map((job): Job => ({
      id: `breezy-${company.slug}-${job.id}`,
      company: company.name,
      title: job.name,
      location: job.location?.name || "Not specified",
      url: job.url,
      department: job.department,
      postedAt: job.published_date,
    }));
  } catch (error) {
    console.error(`Error fetching Breezy jobs for ${company.name}:`, error);
    throw error;
  }
}
