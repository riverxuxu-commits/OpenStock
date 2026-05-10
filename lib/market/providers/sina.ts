import type { Market } from '@/lib/market/types';
import type { MarketProvider } from '@/lib/market/providers/types';

const DEFAULT_BASE_URL = 'http://hq.sinajs.cn/list=';

function formatSymbol(symbol: string, market: Market): string {
  const prefix = market === 'SSE' ? 'sh' : 'sz';
  return `${prefix}${symbol}`;
}

function parseSinaCSV(raw: string): {
  name: string;
  open: number;
  prevClose: number;
  price: number;
  high: number;
  low: number;
} | null {
  try {
    // Response format: var hq_str_sh600519="Maotai,285.0,284.0,286.5,287.0,283.0,...";
    const match = raw.match(/"(.*?)"/);
    if (!match) return null;

    const parts = match[1].split(',');
    if (parts.length < 4) return null;

    const name = parts[0];
    const open = parseFloat(parts[1]);
    const prevClose = parseFloat(parts[2]);
    const price = parseFloat(parts[3]);
    const high = parseFloat(parts[4]);
    const low = parseFloat(parts[5]);

    if (isNaN(price) || isNaN(open) || isNaN(prevClose)) return null;

    return { name, open, prevClose, price, high, low };
  } catch {
    return null;
  }
}

export function createSinaProvider(): MarketProvider {
  return {
    getMarket(): Market {
      // This is set per-call via symbol formatting
      return 'SSE';
    },

    async getQuote(symbol: string): Promise<import('@/lib/market/types').Quote | null> {
      const baseUrl = process.env.SINA_BASE_URL || DEFAULT_BASE_URL;
      const markets: Market[] = ['SSE', 'SZSE'];

      for (const market of markets) {
        const prefixedSymbol = formatSymbol(symbol, market);
        const url = `${baseUrl}${prefixedSymbol}`;

        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(5000),
          });

          if (!res.ok) continue;

          const text = await res.text();
          const parsed = parseSinaCSV(text);

          if (!parsed) continue;

          return {
            symbol,
            price: parsed.price,
            change: parseFloat((parsed.price - parsed.prevClose).toFixed(2)),
            changePercent: parseFloat((((parsed.price - parsed.prevClose) / parsed.prevClose) * 100).toFixed(2)),
            currency: 'CNY',
            market,
          };
        } catch (err) {
          console.error(`Sina provider error for ${prefixedSymbol}:`, err);
          continue;
        }
      }

      return null;
    },
  };
}
