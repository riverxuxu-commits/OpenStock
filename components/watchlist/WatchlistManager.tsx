'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WatchlistStockChip from './WatchlistStockChip';
import TradingViewWatchlist from './TradingViewWatchlist';
import { Button } from '@/components/ui/button';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown } from 'lucide-react';
import { WatchlistItem } from '@/database/models/watchlist.model';

interface WatchlistManagerProps {
    initialItems: WatchlistItem[];
    userId: string;
    initialTab?: string;
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'us', label: 'US' },
    { key: 'ashare', label: 'A股' },
];

export default function WatchlistManager({ initialItems, userId, initialTab = 'all' }: WatchlistManagerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams?.get('tab') || initialTab;

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const toggleSort = () => {
        if (sortOrder === null) setSortOrder('asc');
        else if (sortOrder === 'asc') setSortOrder('desc');
        else setSortOrder(null);
    };

    const sortedItems = useMemo(() => {
        if (!sortOrder) return initialItems;
        return [...initialItems].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.symbol.localeCompare(b.symbol);
            } else {
                return b.symbol.localeCompare(a.symbol);
            }
        });
    }, [initialItems, sortOrder]);

    const handleTabChange = useCallback((tab: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (tab === 'all') {
            params.delete('tab');
        } else {
            params.set('tab', tab);
        }
        const query = params.toString();
        router.push(query ? `/watchlist?${query}` : '/watchlist');
    }, [router, searchParams]);

    const watchlistSymbols = sortedItems.map((item) => item.symbol);

    return (
        <div className="space-y-6">
            {/* Tab Bar */}
            <div className="flex items-center space-x-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800 w-fit">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => handleTabChange(t.key)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            activeTab === t.key
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Chip Section */}
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                        <span className="mr-2">Manage Symbols</span>
                        <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                            {watchlistSymbols.length}
                        </span>
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSort}
                        className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                        title={
                            sortOrder === 'asc'
                                ? 'Sorted A-Z'
                                : sortOrder === 'desc'
                                    ? 'Sorted Z-A'
                                    : 'Default Order'
                        }
                    >
                        {sortOrder === 'asc' && <ArrowDownAZ className="w-4 h-4 mr-2" />}
                        {sortOrder === 'desc' && <ArrowUpZA className="w-4 h-4 mr-2" />}
                        {sortOrder === null && <ArrowUpDown className="w-4 h-4 mr-2" />}
                        <span className="text-xs">
                            {sortOrder === 'asc'
                                ? 'A-Z'
                                : sortOrder === 'desc'
                                    ? 'Z-A'
                                    : 'Sort'}
                        </span>
                    </Button>
                </div>

                {watchlistSymbols.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {sortedItems.map((item) => (
                            <WatchlistStockChip
                                key={`${item.symbol}-${item.market || 'US'}`}
                                symbol={item.symbol}
                                userId={userId}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        {activeTab === 'ashare'
                            ? 'No A-share stocks yet — add A-share codes above.'
                            : 'No stocks in watchlist.'}
                    </p>
                )}
            </div>

            <div className="min-h-[550px]">
                <TradingViewWatchlist symbols={watchlistSymbols} />
            </div>
        </div>
    );
}
