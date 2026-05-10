import type { Market } from '@/lib/market/types';
import type { MarketProvider, ProviderName } from '@/lib/market/providers/types';
import { createSinaProvider } from '@/lib/market/providers/sina';
import { createTencentProvider } from '@/lib/market/providers/tencent';

function getProviderInstance(name: ProviderName): MarketProvider {
  switch (name) {
    case 'sina':
      return createSinaProvider();
    case 'tencent':
      return createTencentProvider();
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

function getEnvConfig(market: Market): { primary: ProviderName; fallback: ProviderName | null } {
  const prefix = market === 'SSE' ? 'SSE' : market === 'SZSE' ? 'SZSE' : 'US';

  const primary = (process.env[`${prefix}_PROVIDER`] as ProviderName) || (market === 'US' ? 'finnhub' as ProviderName : 'sina' as ProviderName);
  const fallbackRaw = process.env[`${prefix}_FALLBACK_PROVIDER`] as ProviderName | undefined;

  return {
    primary,
    fallback: fallbackRaw || null,
  };
}

export function getProvider(market: Market): MarketProvider {
  const { primary } = getEnvConfig(market);
  return getProviderInstance(primary);
}

export function getProviderWithFallback(market: Market): { primary: MarketProvider; fallback: MarketProvider | null } {
  const { primary, fallback } = getEnvConfig(market);
  return {
    primary: getProviderInstance(primary),
    fallback: fallback ? getProviderInstance(fallback) : null,
  };
}
