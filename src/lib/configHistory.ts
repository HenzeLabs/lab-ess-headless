import { exec } from 'child_process';
import { promisify } from 'util';
import { parse } from 'csv-parse/sync';
import { ConfigRecord } from './configStore';

const execAsync = promisify(exec);

export interface HistoryEntry {
  value: string;
  updated_by: string;
  updated_at: string;
  version: number;
  commit?: string;
  message?: string;
}

export interface ConfigHistoryResult {
  key: string;
  current: ConfigRecord;
  history: HistoryEntry[];
}

/**
 * Get version history for a configuration key from git
 * @param key - The configuration key
 * @returns History of changes with diff information
 */
export async function getConfigHistory(
  key: string,
): Promise<ConfigHistoryResult | null> {
  try {
    // Get git log for the config file
    const { stdout } = await execAsync(
      `git log --all --pretty=format:"%H|%an|%at|%s" -- data/config_store/config.csv`,
      { maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer
    );

    const commits = stdout.trim().split('\n').filter(Boolean);
    const history: HistoryEntry[] = [];

    for (const commit of commits) {
      const [hash, , , message] = commit.split('|'); // author and timestamp unused

      try {
        // Get file content at this commit
        const { stdout: fileContent } = await execAsync(
          `git show ${hash}:data/config_store/config.csv`,
        );

        const records = parse(fileContent, { columns: true }) as ConfigRecord[];
        const record = records.find((r) => r.key === key);

        if (record) {
          history.push({
            value: record.value,
            updated_by: record.updated_by,
            updated_at: record.updated_at,
            version: Number(record.version),
            commit: hash.substring(0, 7),
            message: message || 'Configuration update',
          });
        }
      } catch (error) {
        // Skip commits where file doesn't exist or can't be parsed
        continue;
      }
    }

    // Get current value
    const { stdout: currentContent } = await execAsync(
      'cat data/config_store/config.csv',
    );
    const currentRecords = parse(currentContent, {
      columns: true,
    }) as ConfigRecord[];
    const current = currentRecords.find((r) => r.key === key);

    if (!current) {
      return null;
    }

    // Deduplicate history by value (keep only when value changed)
    const uniqueHistory: HistoryEntry[] = [];
    let lastValue: string | null = null;

    for (const entry of history) {
      if (entry.value !== lastValue) {
        uniqueHistory.push(entry);
        lastValue = entry.value;
      }
    }

    return {
      key,
      current,
      history: uniqueHistory,
    };
  } catch (error) {
    console.error(`Error getting history for ${key}:`, error);

    // Fallback: return just current value with no history
    try {
      const { stdout: currentContent } = await execAsync(
        'cat data/config_store/config.csv',
      );
      const currentRecords = parse(currentContent, {
        columns: true,
      }) as ConfigRecord[];
      const current = currentRecords.find((r) => r.key === key);

      if (current) {
        return {
          key,
          current,
          history: [],
        };
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }

    return null;
  }
}

/**
 * Get simplified history from backup files
 * @param key - The configuration key
 * @returns Array of historical values from daily backups
 */
export async function getConfigHistoryFromBackups(
  key: string,
): Promise<HistoryEntry[]> {
  try {
    // List backup files
    const { stdout } = await execAsync(
      'ls -1 data/config_store/backups/config-*.csv 2>/dev/null || echo ""',
    );

    const backupFiles = stdout.trim().split('\n').filter(Boolean);
    const history: HistoryEntry[] = [];

    for (const file of backupFiles.reverse()) {
      try {
        const { stdout: content } = await execAsync(
          `cat data/config_store/backups/${file}`,
        );
        const records = parse(content, { columns: true }) as ConfigRecord[];
        const record = records.find((r) => r.key === key);

        if (record) {
          // Extract date from filename: config-2025-10-29-150000.csv
          const dateMatch = file.match(/config-(\d{4}-\d{2}-\d{2})-(\d{6})/);
          const backupDate = dateMatch
            ? `${dateMatch[1]}T${dateMatch[2].substring(0, 2)}:${dateMatch[2].substring(2, 4)}:${dateMatch[2].substring(4, 6)}Z`
            : record.updated_at;

          history.push({
            value: record.value,
            updated_by: record.updated_by,
            updated_at: backupDate,
            version: Number(record.version),
          });
        }
      } catch (error) {
        continue;
      }
    }

    return history;
  } catch (error) {
    console.error('Error reading backup history:', error);
    return [];
  }
}

/**
 * Revert configuration to a specific version
 * @param key - The configuration key
 * @param targetValue - The value to revert to
 * @param updatedBy - Who is performing the revert
 * @returns Success status
 */
export async function revertConfigToVersion(
  key: string,
  targetValue: string,
  updatedBy: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import setConfig dynamically to avoid circular dependency
    const { setConfig } = await import('./configStore');

    const result = setConfig(key, targetValue, updatedBy);

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error during revert',
    };
  }
}
