/**
 * Lever ATS Scraper
 * 
 * Lever also has a public JSON API
 * URL pattern: https://jobs.lever.co/{company}
 * JSON API: https://api.lever.co/v0/postings/{company}
 */

import type { CompanyConfig, Job } from "../index";

interface LeverJob {
  id: string;
  text: string;  // job title
  categories: {
    location?: string;
    team?: string;
    department?: string;
  };
  hostedUrl: string;
  createdAt: number;
}

export async function fetchLeverJobs(company: CompanyConfig): Promise<Job[]> {
  const apiUrl = `https://api.lever.co/v0/postings/${company.slug}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "JobScout/1.0 (github.com/ewatfika/jobscout)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Lever board not found for ${company.slug}`);
        return [];
      }
      throw new Error(`Lever API error: ${response.status}`);
    }

    const data = await response.json() as LeverJob[];

    return data.map((job): Job => ({
      id: `lever-${company.slug}-${job.id}`,
      company: company.name,
      title: job.text,
      location: job.categories?.location || "Not specified",
      url: job.hostedUrl,
      department: job.categories?.team || job.categories?.department,
      postedAt: new Date(job.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching Lever jobs for ${company.name}:`, error);
    throw error;
  }
}
