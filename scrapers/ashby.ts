/**
 * Ashby ATS Scraper
 *
 * Uses the public posting API (more reliable than the GraphQL endpoint).
 * URL pattern: https://jobs.ashbyhq.com/{company}
 * API: https://api.ashbyhq.com/posting-api/job-board/{slug}
 */

import type { CompanyConfig, Job } from "../index";

interface AshbyPostingJob {
  id: string;
  title: string;
  department: string;
  team: string;
  employmentType: string;
  location: string;
  publishedAt: string;
  isListed: boolean;
  jobUrl: string;
}

interface AshbyPostingResponse {
  jobs: AshbyPostingJob[];
}

export async function fetchAshbyJobs(company: CompanyConfig): Promise<Job[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ashby API error: ${response.status} for ${company.slug}`);
  }

  const data = await response.json() as AshbyPostingResponse;
  const jobs = data.jobs ?? [];

  return jobs
    .filter((job) => job.isListed !== false)
    .map((job): Job => ({
      id: `ashby-${company.slug}-${job.id}`,
      company: company.name,
      title: job.title,
      location: job.location || "Not specified",
      url: job.jobUrl,
      department: job.department || job.team,
      postedAt: job.publishedAt,
    }));
}
