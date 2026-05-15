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
    const now   = Math.floor(Date.now() / 1000);
    const from  = now - (400 * 24 * 60 * 60); // 400 days back for safety

    const [quoteRes, candleRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=W&from=${from}&to=${now}&token=${FINNHUB_KEY}`)
    ]);

    const quote  = await quoteRes.json();
    const candle = await candleRes.json();

    // Log for debugging
    console.log('Candle status:', candle.s, 'Count:', candle.c?.length);

    const closes = (candle.s === 'ok' && Array.isArray(candle.c)) ? candle.c : [];

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
