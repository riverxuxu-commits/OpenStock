import type { Market } from '@/lib/market/types';
import type { MarketProvider } from '@/lib/market/providers/types';

export function createTencentProvider(): MarketProvider {
  return {
    getMarket(): Market {
      return 'SSE';
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getQuote(_symbol: string): Promise<import('@/lib/market/types').Quote | null> {
      // Tencent provider is a stub for Phase 1.
      // Will be implemented in Phase 2.
      return null;
    },
  };
}
