exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const ticker = event.path.split('/').pop();
  const FMP_KEY = process.env.FMP_API_KEY;

  if (!FMP_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'FMP_API_KEY not set in Netlify environment variables' }) };
  }

  try {
    // Fetch key metrics and company profile in parallel
    const [metricsRes, profileRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${encodeURIComponent(ticker)}?apikey=${FMP_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(ticker)}?apikey=${FMP_KEY}`)
    ]);

    const metrics = await metricsRes.json();
    const profile = await profileRes.json();

    const m = Array.isArray(metrics) ? metrics[0] : {};
    const p = Array.isArray(profile) ? profile[0] : {};

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mktCap:  p.mktCap          ?? null,
        pe:      p.pe              ?? m.peRatioTTM ?? null,
        eps:     m.netIncomePerShareTTM ?? null,
        revenue: m.revenuePerShareTTM   ?? null,
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
