/**
 * Token Blacklist Service
 *
 * In production, this should be replaced with a Redis-based solution
 * for distributed systems. This in-memory implementation is suitable
 * for single-instance deployments.
 */

// In-memory store for blacklisted tokens
// Key: token JTI, Value: expiration timestamp
const blacklistedTokens = new Map<string, number>();

// Cleanup interval (runs every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Add a token to the blacklist
 * @param jti Token ID (JTI claim)
 * @param expiresAt Token expiration timestamp (in seconds)
 */
export function blacklistToken(jti: string, expiresAt: number): void {
  if (!jti) {
    throw new Error('Token JTI is required for blacklisting');
  }

  // Store expiration timestamp
  blacklistedTokens.set(jti, expiresAt);
}

/**
 * Check if a token is blacklisted
 * @param jti Token ID (JTI claim)
 * @returns true if token is blacklisted and not expired
 */
export function isTokenBlacklisted(jti: string): boolean {
  if (!jti) {
    return false;
  }

  const expiresAt = blacklistedTokens.get(jti);
  if (!expiresAt) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  // If token has expired, remove it from blacklist
  if (expiresAt <= now) {
    blacklistedTokens.delete(jti);
    return false;
  }

  return true;
}

/**
 * Remove a token from the blacklist
 * @param jti Token ID (JTI claim)
 */
export function removeFromBlacklist(jti: string): void {
  blacklistedTokens.delete(jti);
}

/**
 * Clean up expired tokens from the blacklist
 */
export function cleanupBlacklist(): void {
  const now = Math.floor(Date.now() / 1000);

  for (const [jti, expiresAt] of blacklistedTokens.entries()) {
    if (expiresAt <= now) {
      blacklistedTokens.delete(jti);
    }
  }
}

/**
 * Get the size of the blacklist (for monitoring)
 */
export function getBlacklistSize(): number {
  return blacklistedTokens.size;
}

/**
 * Clear all blacklisted tokens (use with caution)
 */
export function clearBlacklist(): void {
  blacklistedTokens.clear();
}

// Set up automatic cleanup
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Start the automatic cleanup process
 */
export function startCleanupTimer(): void {
  if (cleanupTimer) {
    return; // Already running
  }

  cleanupTimer = setInterval(() => {
    cleanupBlacklist();
  }, CLEANUP_INTERVAL);

  // Don't block Node.js from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Stop the automatic cleanup process
 */
export function stopCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

// Start cleanup timer automatically
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  startCleanupTimer();
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', stopCleanupTimer);
  process.on('SIGTERM', stopCleanupTimer);
}