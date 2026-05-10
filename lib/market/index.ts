import type { Market, Quote } from '@/lib/market/types';
import { getProviderWithFallback } from '@/lib/market/providers/registry';

export async function getQuote(symbol: string, market: Market): Promise<Quote | null> {
  const { primary, fallback } = getProviderWithFallback(market);

  try {
    const quote = await primary.getQuote(symbol);
    if (quote) return quote;
  } catch (err) {
    console.error(`Primary provider failed for ${market}:${symbol}`, err);
  }

  if (fallback) {
    try {
      const quote = await fallback.getQuote(symbol);
      if (quote) return quote;
    } catch (err) {
      console.error(`Fallback provider failed for ${market}:${symbol}`, err);
    }
  }

  return null;
}

export async function getWatchlistQuotes(
  items: { symbol: string; market: Market }[]
): Promise<Quote[]> {
  const results = await Promise.allSettled(
    items.map((item) => getQuote(item.symbol, item.market))
  );

  return results
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<Quote>).value);
}
