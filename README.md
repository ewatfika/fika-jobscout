# Job Scout 🔍

**Get a Slack notification every time a company posts a new job. Automatically.**

You pick the companies. Job Scout watches their job boards and pings your Slack channel the moment something new goes live. No more manually refreshing career pages.

```
You pick companies  →  Job Scout watches their job boards  →  New role appears  →  Slack ping
```

> Built for VC platform teams to monitor portfolio hiring velocity, but works for anyone tracking jobs at specific companies.

**Setup takes ~15 minutes. No coding experience needed.**

---

## What you'll need

- A Mac or Linux computer (Windows works too with some tweaks)
- [Node.js](https://nodejs.org/en/download) installed (free, takes 2 min - download the "LTS" version)
- A Slack workspace where you can create a channel for job alerts

---

## Setup (15 min)

### Step 1: Get the code

Download this repo by clicking the green **Code** button above → **Download ZIP**, then unzip it somewhere on your computer (e.g. your Desktop).

Or if you're comfortable with Terminal:
```bash
git clone https://github.com/ewatfika/jobscout
cd jobscout
```

### Step 2: Install dependencies

Open Terminal, navigate to the folder, and run:
```bash
npm install
```

### Step 3: Create your Slack webhook

A webhook is just a URL that lets Job Scout post messages to your Slack channel.

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → **From scratch**
2. Name it "Job Scout", pick your workspace
3. Click **Incoming Webhooks** → toggle it **On**
4. Click **Add New Webhook to Workspace** → pick the channel you want alerts in
5. Copy the webhook URL (it looks like `https://hooks.slack.com/services/...`)

### Step 4: Add your webhook

Create a file called `.env` in the job-scout folder and add this line (swap in your actual URL):

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 5: Add your companies

Open `index.ts` in any text editor and edit the `COMPANIES` list:

```typescript
export const COMPANIES: CompanyConfig[] = [
  { name: "Anthropic", ats: "greenhouse", slug: "anthropic" },
  { name: "Stripe",    ats: "greenhouse", slug: "stripe" },
  { name: "Netflix",   ats: "lever",      slug: "netflix" },
  { name: "Ramp",      ats: "ashby",      slug: "ramp" },
];
```

**Finding a company's slug:** look at their careers page URL and grab the last part:

| Careers page URL | Platform | Slug |
|---|---|---|
| `boards.greenhouse.io/anthropic` | greenhouse | `anthropic` |
| `jobs.lever.co/netflix` | lever | `netflix` |
| `jobs.ashbyhq.com/ramp` | ashby | `ramp` |
| `pathspot.breezy.hr` | breezy | `pathspot` |
| `acme.bamboohr.com/careers` | bamboohr | `acme` |
| `ats.rippling.com/acme/jobs` | rippling | `acme` |

Not sure which platform a company uses? Just look at their careers page URL - the platform name is usually right there.

### Step 6: Test it

```bash
npm start
```

You should see it check each company and ping your Slack channel for anything new. On first run it'll send notifications for all current openings, then only notify you on net-new postings going forward.

---

## Run it automatically every morning

You have two options depending on how hands-on you want to be.

### Option 1: Deploy to Railway (recommended)

[Railway](https://railway.app) is the easiest way to run Job Scout 24/7 without keeping your laptop on. It's free to start and takes about 5 minutes.

1. Create a free account at [railway.app](https://railway.app)
2. Click **New Project** -> **Deploy from GitHub repo** -> select this repo
3. Add your environment variable: go to your project -> **Variables** -> add `SLACK_WEBHOOK_URL` with your webhook URL
4. Add a cron schedule: go to **Settings** -> **Cron Schedule** -> enter `0 9 * * *` (runs every day at 9am UTC)

That's it. Railway will run Job Scout on schedule automatically, no laptop required.

Other platforms that work the same way: [Render](https://render.com), [Fly.io](https://fly.io) — all have free tiers.

### Option 2: Cron on your own computer

If you'd rather run it locally, open Terminal and run `crontab -e`, then add:

```
0 9 * * * cd /path/to/jobscout && npm start >> /tmp/jobscout.log 2>&1
```

Replace `/path/to/jobscout` with wherever you saved the folder (e.g. `/Users/yourname/Desktop/jobscout`).

Use [crontab.guru](https://crontab.guru) to build a custom schedule.

> **Note:** Your computer needs to be on and awake at the scheduled time for this to fire. If your laptop is often closed, go with Railway instead.

---

## Supported job board platforms

| Platform | Works? |
|---|---|
| Greenhouse | ✅ |
| Lever | ✅ |
| Ashby | ✅ |
| Breezy HR | ✅ |
| BambooHR | ✅ |
| Rippling | ✅ |
| Workday | 🔜 |
| LinkedIn | 🔜 |

---

## Optional: filter by keyword or location

Only want to hear about engineering roles? Or only remote jobs? Edit the `FILTERS` section in `index.ts`:

```typescript
export const FILTERS = {
  keywords: ["engineer", "product"],      // only notify for these roles
  exclude:  ["intern", "contractor"],     // never notify for these
  locations: ["Remote", "New York"],      // only these locations
};
```

Leave any list empty (`[]`) to skip that filter.

---

## What the Slack notification looks like

```
🆕 New Job Posted

Company: Anthropic
Role: Senior Software Engineer
Location: San Francisco, CA
Department: Engineering
Link: https://boards.greenhouse.io/anthropic/jobs/123456

[ View Job ]  ← clickable button
```

---

## License

MIT

---

Built by [Emma @ Fika Ventures](https://www.linkedin.com/in/emma-w-42a469182/) 💼
