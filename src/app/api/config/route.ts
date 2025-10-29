import { NextRequest, NextResponse } from 'next/server';
import {
  getConfig,
  getAllConfig,
  setConfig,
  setBatchConfig,
  deleteConfig,
  searchConfig,
  getConfigByPrefix,
} from '@/lib/configStore';
import { verifyAdminAuth, logAuthAttempt } from '@/middleware/auth';

/**
 * GET /api/config
 * Query params:
 * - key: Get a specific config value
 * - prefix: Get all configs with a specific prefix
 * - search: Search configs by pattern
 * - all: Get all configs (set to "true")
 *
 * READ operations are public, WRITE operations require authentication
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const prefix = searchParams.get('prefix');
    const search = searchParams.get('search');
    const all = searchParams.get('all');

    // Get specific key
    if (key) {
      const value = getConfig(key);
      if (value === null) {
        return NextResponse.json(
          { error: 'Configuration key not found', key },
          { status: 404 },
        );
      }
      return NextResponse.json({ key, value });
    }

    // Get by prefix
    if (prefix) {
      const configs = getConfigByPrefix(prefix);
      return NextResponse.json({ prefix, configs, count: configs.length });
    }

    // Search configs
    if (search) {
      const configs = searchConfig(search);
      return NextResponse.json({ search, configs, count: configs.length });
    }

    // Get all configs
    if (all === 'true') {
      const configs = getAllConfig();
      return NextResponse.json({ configs, count: configs.length });
    }

    return NextResponse.json(
      {
        error: 'Missing query parameter. Use: key, prefix, search, or all=true',
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error in GET /api/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/config
 * Body:
 * - key: The config key to update
 * - value: The new value
 * - updated_by: (optional) Who made the change
 *
 * REQUIRES AUTHENTICATION
 */
export async function PUT(req: NextRequest) {
  // Verify authentication
  const authResult = verifyAdminAuth(req);
  if (!authResult.authorized) {
    logAuthAttempt(req, false, authResult.reason);
    return NextResponse.json(
      {
        error: 'Unauthorized',
        reason: authResult.reason,
        hint: 'Provide a valid admin token via Authorization: Bearer <token> or X-Admin-Token header',
      },
      { status: 401 },
    );
  }

  logAuthAttempt(req, true);

  try {
    const body = await req.json();
    const { key, value, updated_by } = body;

    // Use authenticated user if updated_by not provided
    const actualUpdatedBy = updated_by || authResult.user || 'api';

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: key and value' },
        { status: 400 },
      );
    }

    const result = setConfig(key, String(value), actualUpdatedBy);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update configuration' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Configuration updated successfully',
      key,
      value,
      updated_by: actualUpdatedBy,
    });
  } catch (error) {
    console.error('Error in PUT /api/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/config/batch
 * Body:
 * - updates: Array of { key, value } objects
 * - updated_by: (optional) Who made the changes
 *
 * REQUIRES AUTHENTICATION
 */
export async function POST(req: NextRequest) {
  // Verify authentication
  const authResult = verifyAdminAuth(req);
  if (!authResult.authorized) {
    logAuthAttempt(req, false, authResult.reason);
    return NextResponse.json(
      {
        error: 'Unauthorized',
        reason: authResult.reason,
        hint: 'Provide a valid admin token via Authorization: Bearer <token> or X-Admin-Token header',
      },
      { status: 401 },
    );
  }

  logAuthAttempt(req, true);

  try {
    const body = await req.json();
    const { updates, updated_by } = body;

    // Use authenticated user if updated_by not provided
    const actualUpdatedBy = updated_by || authResult.user || 'api';

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty updates array' },
        { status: 400 },
      );
    }

    // Validate all updates have key and value
    const invalid = updates.find((u) => !u.key || u.value === undefined);
    if (invalid) {
      return NextResponse.json(
        { error: 'All updates must have key and value fields' },
        { status: 400 },
      );
    }

    const result = setBatchConfig(updates, actualUpdatedBy);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update configurations' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'Configurations updated successfully',
      count: result.count,
      updated_by: actualUpdatedBy,
    });
  } catch (error) {
    console.error('Error in POST /api/config/batch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/config
 * Query params:
 * - key: The config key to delete
 *
 * REQUIRES AUTHENTICATION
 */
export async function DELETE(req: NextRequest) {
  // Verify authentication
  const authResult = verifyAdminAuth(req);
  if (!authResult.authorized) {
    logAuthAttempt(req, false, authResult.reason);
    return NextResponse.json(
      {
        error: 'Unauthorized',
        reason: authResult.reason,
        hint: 'Provide a valid admin token via Authorization: Bearer <token> or X-Admin-Token header',
      },
      { status: 401 },
    );
  }

  logAuthAttempt(req, true);

  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required query parameter: key' },
        { status: 400 },
      );
    }

    const result = deleteConfig(key);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete configuration' },
        { status: result.error === 'Key not found' ? 404 : 500 },
      );
    }

    return NextResponse.json({
      message: 'Configuration deleted successfully',
      key,
      deleted_by: authResult.user,
    });
  } catch (error) {
    console.error('Error in DELETE /api/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
