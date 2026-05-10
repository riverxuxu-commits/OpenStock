export type Market = 'US' | 'SSE' | 'SZSE' | 'HKEX';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  market: Market;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  marketCap?: number;
  currency?: string;
  logo?: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  market: Market;
}
