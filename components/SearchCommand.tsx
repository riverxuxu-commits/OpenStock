"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import {Button} from "@/components/ui/button";
import {Loader2,  TrendingUp} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";
import {detectMarket} from "@/lib/utils";

function isAShareCode(input: string): boolean {
    return /^\d{6}$/.test(input.trim());
}

function getMarketLabel(market: Market): string {
    switch (market) {
        case 'SSE': return 'SSE (上海)';
        case 'SZSE': return 'SZSE (深圳)';
        default: return market;
    }
}

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks }: SearchCommandProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setOpen(v => !v)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const handleSearch = async () => {
        const trimmed = searchTerm.trim();
        if (!trimmed) return setStocks(initialStocks);

        setLoading(true)
        try {
            // Detect A-share 6-digit code
            if (isAShareCode(trimmed)) {
                const market = detectMarket(trimmed);
                const label = getMarketLabel(market);
                setStocks([{
                    symbol: trimmed,
                    name: `${trimmed} (${label})`,
                    exchange: market,
                    type: 'Stock',
                    isInWatchlist: false,
                }]);
            } else {
                const results = await searchStocks(trimmed);
                setStocks(results);
            }
        } catch {
            setStocks([])
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm("");
        setStocks(initialStocks);
    }

    return (
        <>
            {renderAs === 'text' ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="search-text"
                >
                    {label}
                </button>
            ): (
                <Button onClick={() => setOpen(true)} className="search-btn">
                    {label}
                </Button>
            )}
            <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
                <div className="search-field">
                    <CommandInput value={searchTerm} onValueChange={setSearchTerm} placeholder="Search stocks or enter A-share code..." className="search-input" />
                    {loading && <Loader2 className="search-loader" />}
                </div>
                <CommandList className="search-list">
                    {loading ? (
                        <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
                    ) : displayStocks?.length === 0 ? (
                        <div className="search-list-indicator">
                            {isSearchMode ? 'No results found' : 'No stocks available'}
                        </div>
                    ) : (
                        <ul>
                            <div className="search-count">
                                {isSearchMode ? 'Search results' : 'Popular stocks'}
                                {` `}({displayStocks?.length || 0})
                            </div>
                            {displayStocks?.map((stock) => {
                                const market = isAShareCode(stock.symbol) ? detectMarket(stock.symbol) : 'US';
                                return (
                                    <li key={stock.symbol} className="search-item">
                                        <Link
                                            href={`/stocks/${stock.symbol}`}
                                            onClick={handleSelectStock}
                                            className="search-item-link"
                                        >
                                            <TrendingUp className="h-4 w-4 text-gray-500" />
                                            <div className="flex-1">
                                                <div className="search-item-name">
                                                    {stock.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {stock.symbol}
                                                    {market !== 'US' ? ` | ${getMarketLabel(market)}` : ` | ${stock.exchange} | ${stock.type}`}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                    }
                </CommandList>
            </CommandDialog>
        </>
    )
}