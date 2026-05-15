# US Market Monitor v2 — Deployment Guide
## Fully free, works on Netlify, no Yahoo Finance

---

## What changed from the previous version

Yahoo Finance blocks server-side requests (CORS). This version uses two
reliable free APIs instead:

  - Finnhub  → live prices + 1-year price history (60 calls/min free)
  - Financial Modeling Prep (FMP) → PE, EPS, market cap (250 calls/day free)

You need two free API keys (no credit card, ~2 min to set up).

---

## Step 1 — Get your two free API keys

FINNHUB (live prices):
1. Go to https://finnhub.io
2. Click "Get free API key" and sign up
3. Copy your key from the dashboard (looks like: ct1abc123...)

FINANCIAL MODELING PREP (fundamentals):
1. Go to https://financialmodelingprep.com/developer/docs
2. Click "Get my API key" and sign up free
3. Copy your key from the dashboard (looks like: aBcDeFgH...)

---

## Step 2 — Push to GitHub

If this is your first time:

  Open Git Bash in this folder and run:

    git init
    git add .
    git commit -m "v2 with Finnhub and FMP"
    git branch -M main
    git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/stock-monitor.git
    git push -u origin main

If you already have the repo from before, just run:

    git add .
    git commit -m "v2 with Finnhub and FMP"
    git push

---

## Step 3 — Add environment variables in Netlify

1. Go to https://netlify.com → open your site
2. Click Site configuration → Environment variables
3. Add these two variables:

   Key: FINNHUB_API_KEY
   Value: (your Finnhub key)

   Key: FMP_API_KEY
   Value: (your FMP key)

4. Click Save
5. Go to Deploys → Trigger deploy → Deploy site

---

## Step 4 — Open your app

Visit your Netlify URL. Live data should now load correctly.

---

## Troubleshooting

Data still not loading:
  → Open browser F12 → Console and look for specific errors
  → In Netlify, go to Functions tab — confirm "quote" and "fundamentals" are listed
  → Make sure you redeployed AFTER adding the environment variables

FMP shows N/A for some fields:
  → FMP free tier has 250 calls/day. If you refresh many times it may hit the limit.
  → The app will still work; it will just show "—" for those fields.

BRK-B not loading:
  → Finnhub uses "BRK.B" format. The code handles this automatically.

---

## Costs: $0

  Finnhub free:  60 API calls/minute — plenty for 10 stocks
  FMP free:      250 calls/day — enough for several refreshes per day
  Netlify free:  100GB bandwidth, 125,000 function calls/month
  Analysis tab:  runs in your browser, zero cost
