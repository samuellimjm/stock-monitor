exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const rawTicker = event.path.split('/').pop();
  const ticker = rawTicker.replace(/-/g, '.');
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
  const AV_KEY = process.env.ALPHAVANTAGE_API_KEY;

  if (!FINNHUB_KEY || !AV_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API keys not set' }) };
  }

  try {
    // Fetch live quote from Finnhub and weekly history from Alpha Vantage in parallel
    const avTicker = rawTicker.replace(/-/g, '.');
    const [quoteRes, histRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`),
      fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${encodeURIComponent(avTicker)}&apikey=${AV_KEY}`)
    ]);

    const quote   = await quoteRes.json();
    const histData = await histRes.json();

    // Extract closing prices from Alpha Vantage weekly data (most recent 52 weeks)
    const weekly = histData['Weekly Time Series'] || {};
    const closes = Object.entries(weekly)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-52)
      .map(([, v]) => parseFloat(v['4. close']));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        price:     quote.c  ?? null,
        prevClose: quote.pc ?? null,
        closes,
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
