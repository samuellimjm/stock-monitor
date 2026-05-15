exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Finnhub uses dots not hyphens (e.g. BRK.B not BRK-B)
  const ticker = event.path.split('/').pop().replace(/-/g, '.');
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  if (!FINNHUB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'FINNHUB_API_KEY not set in Netlify environment variables' }) };
  }

  try {
    // Fetch live quote and 1-year daily candles in parallel
    const [quoteRes, candleRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=D&from=${Math.floor(Date.now()/1000) - 365*24*60*60}&to=${Math.floor(Date.now()/1000)}&token=${FINNHUB_KEY}`)
    ]);

    const quote  = await quoteRes.json();
    const candle = await candleRes.json();

    const closes = (candle.s === 'ok' && candle.c) ? candle.c : [];

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
