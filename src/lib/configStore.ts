import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const CONFIG_PATH = path.join(process.cwd(), 'data/config_store/config.csv');

export interface ConfigRecord {
  key: string;
  value: string;
  updated_by: string;
  updated_at: string;
  version: string;
}

export interface ConfigHistory {
  key: string;
  changes: Array<{
    value: string;
    updated_by: string;
    updated_at: string;
    version: number;
  }>;
}

/**
 * Get a configuration value by key
 * @param key - The configuration key (e.g., "seo.title", "security.rateLimit.default.maxRequests")
 * @param fallback - Optional fallback value if key not found
 * @returns The configuration value or fallback
 */
export function getConfig(key: string, fallback?: string): string | null {
  try {
    const csv = fs.readFileSync(CONFIG_PATH, 'utf8');
    const records = parse(csv, { columns: true }) as ConfigRecord[];
    const item = records.find((r) => r.key === key);
    return item ? item.value : (fallback ?? null);
  } catch (error) {
    console.error(`Error reading config key "${key}":`, error);
    return fallback ?? null;
  }
}

/**
 * Get a configuration value as a number
 * @param key - The configuration key
 * @param fallback - Optional fallback value if key not found
 * @returns The configuration value parsed as a number
 */
export function getConfigNumber(key: string, fallback?: number): number {
  const value = getConfig(key);
  if (value === null) {
    return fallback ?? 0;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? (fallback ?? 0) : parsed;
}

/**
 * Get a configuration value as a boolean
 * @param key - The configuration key
 * @param fallback - Optional fallback value if key not found
 * @returns The configuration value parsed as a boolean
 */
export function getConfigBoolean(key: string, fallback?: boolean): boolean {
  const value = getConfig(key);
  if (value === null) {
    return fallback ?? false;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get all configuration records
 * @returns Array of all configuration records
 */
export function getAllConfig(): ConfigRecord[] {
  try {
    const csv = fs.readFileSync(CONFIG_PATH, 'utf8');
    return parse(csv, { columns: true }) as ConfigRecord[];
  } catch (error) {
    console.error('Error reading all config:', error);
    return [];
  }
}

/**
 * Set a configuration value
 * @param key - The configuration key
 * @param value - The new value
 * @param updatedBy - Username or identifier of who made the change
 * @returns Success status
 */
export function setConfig(
  key: string,
  value: string,
  updatedBy: string = 'system',
): { success: boolean; error?: string } {
  try {
    const csv = fs.readFileSync(CONFIG_PATH, 'utf8');
    const records = parse(csv, { columns: true }) as ConfigRecord[];
    const idx = records.findIndex((r) => r.key === key);
    const now = new Date().toISOString();

    if (idx >= 0) {
      // Update existing record
      records[idx] = {
        key: records[idx].key,
        value,
        updated_by: updatedBy,
        updated_at: now,
        version: String(Number(records[idx].version) + 1),
      };
    } else {
      // Create new record
      records.push({
        key,
        value,
        updated_by: updatedBy,
        updated_at: now,
        version: '1',
      });
    }

    const out = stringify(records, { header: true });
    fs.writeFileSync(CONFIG_PATH, out);

    return { success: true };
  } catch (error) {
    console.error(`Error setting config key "${key}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Set multiple configuration values at once
 * @param updates - Array of key-value pairs to update
 * @param updatedBy - Username or identifier of who made the changes
 * @returns Success status with count of updated records
 */
export function setBatchConfig(
  updates: Array<{ key: string; value: string }>,
  updatedBy: string = 'system',
): { success: boolean; count: number; error?: string } {
  try {
    const csv = fs.readFileSync(CONFIG_PATH, 'utf8');
    const records = parse(csv, { columns: true }) as ConfigRecord[];
    const now = new Date().toISOString();
    let updateCount = 0;

    updates.forEach(({ key, value }) => {
      const idx = records.findIndex((r) => r.key === key);
      if (idx >= 0) {
        records[idx] = {
          key: records[idx].key,
          value,
          updated_by: updatedBy,
          updated_at: now,
          version: String(Number(records[idx].version) + 1),
        };
        updateCount++;
      } else {
        records.push({
          key,
          value,
          updated_by: updatedBy,
          updated_at: now,
          version: '1',
        });
        updateCount++;
      }
    });

    const out = stringify(records, { header: true });
    fs.writeFileSync(CONFIG_PATH, out);

    return { success: true, count: updateCount };
  } catch (error) {
    console.error('Error in batch config update:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a configuration key
 * @param key - The configuration key to delete
 * @returns Success status
 */
export function deleteConfig(key: string): {
  success: boolean;
  error?: string;
} {
  try {
    const csv = fs.readFileSync(CONFIG_PATH, 'utf8');
    const records = parse(csv, { columns: true }) as ConfigRecord[];
    const filteredRecords = records.filter((r) => r.key !== key);

    if (filteredRecords.length === records.length) {
      return { success: false, error: 'Key not found' };
    }

    const out = stringify(filteredRecords, { header: true });
    fs.writeFileSync(CONFIG_PATH, out);

    return { success: true };
  } catch (error) {
    console.error(`Error deleting config key "${key}":`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Search for configuration keys matching a pattern
 * @param pattern - String or regex pattern to match keys
 * @returns Array of matching configuration records
 */
export function searchConfig(pattern: string | RegExp): ConfigRecord[] {
  try {
    const records = getAllConfig();
    const regex =
      typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return records.filter((r) => regex.test(r.key));
  } catch (error) {
    console.error('Error searching config:', error);
    return [];
  }
}

/**
 * Get configuration records by prefix
 * @param prefix - The key prefix to filter by (e.g., "seo.", "security.rateLimit.")
 * @returns Array of matching configuration records
 */
export function getConfigByPrefix(prefix: string): ConfigRecord[] {
  try {
    const records = getAllConfig();
    return records.filter((r) => r.key.startsWith(prefix));
  } catch (error) {
    console.error(`Error getting config by prefix "${prefix}":`, error);
    return [];
  }
}
