/**
 * Greenhouse ATS Scraper
 * 
 * Greenhouse has a public JSON API - no scraping needed!
 * URL pattern: https://boards.greenhouse.io/{company}/jobs
 * JSON API: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
 */

import type { CompanyConfig, Job } from "../index";

interface GreenhouseJob {
  id: number;
  title: string;
  location: {
    name: string;
  };
  absolute_url: string;
  departments: Array<{ name: string }>;
  updated_at: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

export async function fetchGreenhouseJobs(company: CompanyConfig): Promise<Job[]> {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "JobScout/1.0 (github.com/ewatfika/jobscout)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Greenhouse board not found for ${company.slug}`);
        return [];
      }
      throw new Error(`Greenhouse API error: ${response.status}`);
    }

    const data = await response.json() as GreenhouseResponse;

    return data.jobs.map((job): Job => ({
      id: `gh-${company.slug}-${job.id}`,
      company: company.name,
      title: job.title,
      location: job.location?.name || "Not specified",
      url: job.absolute_url,
      department: job.departments?.[0]?.name,
      postedAt: job.updated_at,
    }));
  } catch (error) {
    console.error(`Error fetching Greenhouse jobs for ${company.name}:`, error);
    throw error;
  }
}
