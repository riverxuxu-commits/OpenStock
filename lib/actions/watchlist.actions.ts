'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { revalidatePath } from 'next/cache';
import { getWatchlistQuotes as getMarketQuotes } from '@/lib/market';

// -- CRUD Operations --

export async function addToWatchlist(userId: string, symbol: string, company: string, market: Market = 'US') {
    try {
        await connectToDatabase();

        const upperSymbol = symbol.toUpperCase();

        // Backward compat: update legacy items without market field, or upsert new
        const existing = await Watchlist.findOne({ userId, symbol: upperSymbol, market: { $exists: false } });
        if (existing) {
            existing.market = market;
            existing.company = company;
            await existing.save();
            revalidatePath('/watchlist');
            return JSON.parse(JSON.stringify(existing));
        }

        const newItem = await Watchlist.findOneAndUpdate(
            { userId, symbol: upperSymbol, market },
            {
                userId,
                symbol: upperSymbol,
                market,
                company,
                addedAt: new Date()
            },
            { upsert: true, new: true }
        );

        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newItem));
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw new Error('Failed to add to watchlist');
    }
}

export async function removeFromWatchlist(userId: string, symbol: string, market?: Market) {
    try {
        await connectToDatabase();
        const filter: Record<string, unknown> = { userId, symbol: symbol.toUpperCase() };
        if (market) filter.market = market;
        await Watchlist.findOneAndDelete(filter);
        revalidatePath('/watchlist');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error('Failed to remove from watchlist');
    }
}

export async function getUserWatchlist(userId: string, market?: Market) {
    try {
        await connectToDatabase();
        const filter: Record<string, unknown> = { userId };
        if (market) filter.market = market;
        const watchlist = await Watchlist.find(filter).sort({ addedAt: -1 });
        return JSON.parse(JSON.stringify(watchlist));
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}

export async function getUserWatchlistByTab(userId: string, tab: string) {
    try {
        await connectToDatabase();
        const filter: Record<string, unknown> = { userId };

        if (tab === 'us') {
            filter.market = 'US';
        } else if (tab === 'ashare') {
            filter.market = { $in: ['SSE', 'SZSE'] };
        }

        const watchlist = await Watchlist.find(filter).sort({ addedAt: -1 });
        return JSON.parse(JSON.stringify(watchlist));
    } catch (error) {
        console.error('Error fetching watchlist by tab:', error);
        return [];
    }
}

// Check if a symbol is in the user's watchlist
export async function isStockInWatchlist(userId: string, symbol: string, market?: Market) {
    try {
        await connectToDatabase();
        const filter: Record<string, unknown> = { userId, symbol: symbol.toUpperCase() };
        if (market) filter.market = market;
        const item = await Watchlist.findOne(filter);
        return !!item;
    } catch (error) {
        console.error('Error checking watchlist status:', error);
        return false;
    }
}

// -- Market-aware quote fetching --

export async function getWatchlistQuotes(userId: string, tab: string = 'all') {
    try {
        const items = await getUserWatchlistByTab(userId, tab);
        if (!items || items.length === 0) return [];

        const quotes = await getMarketQuotes(
            items.map((item: { symbol: string; market: Market }) => ({
                symbol: item.symbol,
                market: item.market,
            }))
        );

        return quotes;
    } catch (error) {
        console.error('Error fetching watchlist quotes:', error);
        return [];
    }
}

// -- Legacy Support (if needed by other components) --

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}