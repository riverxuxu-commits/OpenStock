import type { Quote, Market } from '@/lib/market/types';

export interface MarketProvider {
  getQuote(symbol: string): Promise<Quote | null>;
  getMarket(): Market;
}

export type ProviderName = 'sina' | 'tencent' | 'finnhub';
