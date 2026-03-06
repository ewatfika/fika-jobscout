# Fika Job Scout

Internal tool for tracking hiring activity across the Fika Ventures portfolio.

---

## What it does

- **Scrapes job boards** for all tracked portfolio companies every time it runs
- **Slack notifications** when a new role is posted
- **Web dashboard** to see hiring trends, browse open roles, and filter by function/seniority
- **Candidate matching** — paste a LinkedIn profile, get the top 10 role matches across the portfolio ranked by fit

---

## Running it

### Dashboard (the main thing)

```bash
cd fika-jobscout
PORT=3001 npm run dashboard
```

Open [http://localhost:3001](http://localhost:3001). Keep this running while you're using it.

### Scrape for new jobs

```bash
npm start
```

Run this manually whenever you want to check for new postings, or set it on a cron (see below). The dashboard reflects whatever's in the database, so scrape first to get fresh data.

---

## Environment variables

Create a `.env` file (copy from `.env.example`):

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...   # Slack alerts on new postings
ANTHROPIC_API_KEY=sk-ant-...                              # Required for Find Roles matching
DATABASE_URL=postgresql://...                             # Optional — uses local SQLite if not set
```

---

## Adding or removing a company

Edit the `COMPANIES` array in `index.ts`. Each entry needs three things:

```typescript
{ name: "Siro", ats: "ashby", slug: "siro" }
```

**Finding the slug:** look at the company's careers page URL:

| Careers page URL | ATS | Slug |
|---|---|---|
| `job-boards.greenhouse.io/acme` | `greenhouse` | `acme` |
| `jobs.lever.co/acme` | `lever` | `acme` |
| `jobs.ashbyhq.com/acme` | `ashby` | `acme` |
| `acme.breezy.hr` | `breezy` | `acme` |
| `acme.bamboohr.com/careers` | `bamboohr` | `acme` |
| `ats.rippling.com/acme/jobs` | `rippling` | `acme` |

After adding a company, run `npm start` to pull in their current openings.

---

## Portfolio companies currently tracked

| Company | ATS |
|---|---|
| AKKO | Greenhouse |
| BuildOps | Greenhouse |
| Chowbus | Greenhouse |
| Moment Energy | Greenhouse |
| Noyo | Greenhouse |
| Papaya | Greenhouse |
| Sunbound | Greenhouse |
| Field AI | Lever |
| Grid | Lever |
| Ivo | Lever |
| Ajax | Ashby |
| Allocate | Ashby |
| Apiphany | Ashby |
| Artemis | Ashby |
| Atticus | Ashby |
| Beeble | Ashby |
| Clarify | Ashby |
| Coverbase | Ashby |
| Dispatch | Ashby |
| First Resonance | Ashby |
| Inspectiv | Ashby |
| Payabli | Ashby |
| Sift | Ashby |
| Siro | Ashby |
| Accorded | Breezy HR |
| PathSpot | Breezy HR |
| Upwards | Breezy HR |
| Elementary | BambooHR |
| Bowery Valuation | Rippling |
| SubBase | Rippling |

---

## Find Roles (candidate matching)

On the **Find Roles** tab in the dashboard:

1. Go to the candidate's LinkedIn profile
2. Press `Cmd+A` to select all, `Cmd+C` to copy
3. Paste into the text box
4. Optionally add context (location flexibility, comp, companies to prioritize)
5. Hit **Find Matches**

Claude reads the profile, extracts the candidate's function/seniority/domain, and scores every active role in the portfolio for mutual fit. Scoring is intentionally critical — 80+ means a genuinely compelling match.

The **Copy intro blurb** button on each match generates a one-liner you can paste straight into a message to the portco.

Requires `ANTHROPIC_API_KEY` in `.env`.

---

## Automating the scrape

### Option A: cron on your laptop

```
0 9 * * 1-5 cd /Users/emmawirt/fika-jobscout && npm start >> /tmp/jobscout.log 2>&1
```

Runs weekday mornings at 9am. Add via `crontab -e`.

### Option B: Railway (runs in the cloud, no laptop needed)

1. Push this repo to GitHub (already done — it's at `ewatfika/fika-jobscout`)
2. Create a new project at [railway.app](https://railway.app) → Deploy from GitHub → select `fika-jobscout`
3. Add env vars under **Variables**: `SLACK_WEBHOOK_URL`, `ANTHROPIC_API_KEY`
4. Add a Postgres database (Railway provisions it and sets `DATABASE_URL` automatically)
5. Set a cron under **Settings** → `0 9 * * 1-5`

With Railway + Postgres the data persists across runs in the cloud and the dashboard is accessible from anywhere.
