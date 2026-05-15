exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const ticker = event.path.split('/').pop().replace(/-/g, '.');
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  if (!FINNHUB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'FINNHUB_API_KEY not set' }) };
  }

  try {
    const [metricRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${FINNHUB_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`)
    ]);

    const metricData  = await metricRes.json();
    const profileData = await profileRes.json();

    const m = metricData?.metric || {};
    const p = profileData || {};

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mktCap:  p.marketCapitalization ? p.marketCapitalization * 1e6 : null,
        pe:      m['peBasicExclExtraTTM']   ?? m['peTTM']      ?? null,
        eps:     m['epsBasicExclExtraItemsTTM'] ?? m['epsTTM']  ?? null,
        revenue: m['revenuePerShareTTM']    ?? null,
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
