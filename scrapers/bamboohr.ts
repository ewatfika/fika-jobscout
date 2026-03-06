/**
 * BambooHR ATS Scraper
 *
 * Public JSON API at https://{subdomain}.bamboohr.com/careers/list
 * The slug is the subdomain of the company's BambooHR board.
 * e.g. elementary.bamboohr.com → slug is "elementary"
 */

import type { CompanyConfig, Job } from "../index";

interface BambooJob {
  id: string;
  jobOpeningName: string;
  departmentLabel: string;
  employmentStatusLabel: string;
  location: {
    city: string;
    state: string;
  };
  isRemote: boolean | null;
}

interface BambooResponse {
  meta: { totalCount: number };
  result: BambooJob[];
}

export async function fetchBambooJobs(company: CompanyConfig): Promise<Job[]> {
  const apiUrl = `https://${company.slug}.bamboohr.com/careers/list`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "JobScout/1.0 (github.com/ewatfika/jobscout)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`BambooHR board not found for ${company.slug}`);
        return [];
      }
      throw new Error(`BambooHR API error: ${response.status}`);
    }

    const data = await response.json() as BambooResponse;

    return data.result.map((job): Job => ({
      id: `bamboo-${company.slug}-${job.id}`,
      company: company.name,
      title: job.jobOpeningName,
      location: job.isRemote
        ? "Remote"
        : [job.location?.city, job.location?.state].filter(Boolean).join(", ") || "Not specified",
      url: `https://${company.slug}.bamboohr.com/careers/${job.id}`,
      department: job.departmentLabel,
    }));
  } catch (error) {
    console.error(`Error fetching BambooHR jobs for ${company.name}:`, error);
    throw error;
  }
}
