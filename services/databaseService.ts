
// Use named import for Dexie to ensure proper class type resolution for methods like version()
import { Dexie, type Table } from 'dexie';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { iPhoneListing, MarketAnalysis } from '../types';

/**
 * World-Class Hybrid Database Engine
 * Primary: Dexie.js (IndexedDB) for zero-latency local storage.
 * Secondary: Supabase for persistent external cloud sync.
 */

export class SniperDatabase extends Dexie {
  listings!: Table<iPhoneListing>;
  watchlist!: Table<iPhoneListing>;
  config!: Table<{ key: string; value: string }>;

  private supabase: SupabaseClient | null = null;

  constructor() {
    super('iTrackSniperDB');
    // Fix: Using named import for Dexie ensures 'version' is correctly recognized as a member of the class in the prototype chain
    this.version(2).stores({
      listings: 'id, title, priceNum, model',
      watchlist: 'id, title, priceNum',
      config: 'key'
    });
    this.initCloud();
  }

  private async initCloud() {
    const url = await this.config.get('supabase_url');
    const key = await this.config.get('supabase_key');
    if (url?.value && key?.value) {
      this.supabase = createClient(url.value, key.value);
    }
  }

  async setCloudConfig(url: string, key: string) {
    await this.config.put({ key: 'supabase_url', value: url });
    await this.config.put({ key: 'supabase_key', value: key });
    this.supabase = createClient(url, key);
  }

  async getCloudConfig() {
    const url = await this.config.get('supabase_url');
    const key = await this.config.get('supabase_key');
    return { url: url?.value || '', key: key?.value || '' };
  }

  async saveScan(model: string, analysis: MarketAnalysis) {
    // 1. Save Locally (Instant)
    await this.listings.bulkPut(analysis.listings);

    // 2. Sync to Cloud (Background)
    if (this.supabase) {
      try {
        await this.supabase.from('listings').upsert(
          analysis.listings.map(l => ({
            id: l.id,
            title: l.title,
            price_num: l.priceNum,
            location: l.location,
            url: l.url,
            storage_gb: l.storageGb,
            battery_health: l.batteryHealth,
            risk_score: l.riskScore,
            profit_potential: l.profitPotential,
            model: model
          })),
          { onConflict: 'id' }
        );
      } catch (err) {
        console.warn('Cloud Sync Failed:', err);
      }
    }
  }

  async toggleWatchlist(listing: iPhoneListing): Promise<boolean> {
    const exists = await this.watchlist.get(listing.id);
    if (exists) {
      await this.watchlist.delete(listing.id);
      if (this.supabase) {
        await this.supabase.from('watchlist').delete().eq('listing_id', listing.id);
      }
      return false;
    } else {
      await this.watchlist.put(listing);
      if (this.supabase) {
        await this.watchlist.put({
          ...listing
        });
        // Note: For actual Supabase production, you'd use a specific table for watchlist items
      }
      return true;
    }
  }

  async isInWatchlist(id: string): Promise<boolean> {
    const item = await this.watchlist.get(id);
    return !!item;
  }

  async getWatchlist(): Promise<iPhoneListing[]> {
    return this.watchlist.toArray();
  }

  async getArchive(): Promise<iPhoneListing[]> {
    return this.listings.orderBy('priceNum').reverse().toArray();
  }

  isCloudEnabled(): boolean {
    return !!this.supabase;
  }
}

export const db = new SniperDatabase();
export const cloudDb = db;
