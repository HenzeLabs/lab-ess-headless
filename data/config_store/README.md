# Configuration Store

This directory contains the CSV-based configuration store for the Lab Essentials application. This system provides a durable, auditable way to manage runtime configuration without requiring code deployments.

## Overview

The configuration store addresses the audit findings from [labessentials_audit_status.json](../../reports/labessentials_audit_status.json) by providing:

- **Persistent storage**: Configuration changes are stored in CSV format with full history
- **Audit trail**: Every change tracks who made it, when, and maintains version numbers
- **Runtime updates**: Parameters can be changed without code deployments via API
- **Git-tracked**: All configuration is version-controlled in the repository
- **Zero infrastructure**: No database required - uses simple CSV files

## File Structure

```
data/config_store/
├── config.csv          # Main configuration database
└── README.md          # This file
```

## Configuration Format

The CSV file has the following columns:

- `key`: Dot-notation configuration key (e.g., "seo.siteName", "security.rateLimit.api.maxRequests")
- `value`: The configuration value (stored as string, parsed as needed)
- `updated_by`: Username or system identifier who made the change
- `updated_at`: ISO 8601 timestamp of the change
- `version`: Auto-incrementing version number for the key

## Current Configuration Categories

### SEO Parameters
- `seo.siteName`: Site name for metadata
- `seo.siteUrl`: Canonical site URL
- `seo.defaultTitle`: Default page title
- `seo.defaultDescription`: Default meta description
- `seo.defaultImage`: Default Open Graph image
- `seo.twitterHandle`: Twitter/X handle
- `seo.organizationName`: Organization name for schema
- `seo.organizationUrl`: Organization URL for schema

### Security Parameters
- `security.rateLimit.default.windowMs`: Default rate limit window
- `security.rateLimit.default.maxRequests`: Default max requests per window
- `security.rateLimit.api.windowMs`: API rate limit window
- `security.rateLimit.api.maxRequests`: API max requests
- `security.rateLimit.auth.windowMs`: Auth rate limit window
- `security.rateLimit.auth.maxRequests`: Auth max requests
- `security.rateLimit.cart.windowMs`: Cart rate limit window
- `security.rateLimit.cart.maxRequests`: Cart max requests
- `security.rateLimit.admin.windowMs`: Admin rate limit window
- `security.rateLimit.admin.maxRequests`: Admin max requests
- `security.rateLimit.search.windowMs`: Search rate limit window
- `security.rateLimit.search.maxRequests`: Search max requests

## API Endpoints

### Read Operations

**Get a specific configuration value**
```bash
GET /api/config?key=seo.siteName
```

**Get all configurations with a prefix**
```bash
GET /api/config?prefix=seo.
```

**Search configurations by pattern**
```bash
GET /api/config?search=rateLimit
```

**Get all configurations**
```bash
GET /api/config?all=true
```

### Write Operations

**Update a single configuration**
```bash
PUT /api/config
Content-Type: application/json

{
  "key": "seo.siteName",
  "value": "Lab Essentials - New Name",
  "updated_by": "lauren@example.com"
}
```

**Batch update multiple configurations**
```bash
POST /api/config
Content-Type: application/json

{
  "updates": [
    { "key": "seo.siteName", "value": "New Name" },
    { "key": "seo.defaultTitle", "value": "New Title" }
  ],
  "updated_by": "lauren@example.com"
}
```

**Delete a configuration**
```bash
DELETE /api/config?key=some.key
```

## Using in Code

### Reading Configuration

```typescript
import { getConfig, getConfigNumber, getConfigBoolean } from '@/lib/configStore';

// Get a string value
const siteName = getConfig('seo.siteName');

// Get a number value
const maxRequests = getConfigNumber('security.rateLimit.api.maxRequests');

// Get a boolean value
const featureEnabled = getConfigBoolean('features.newCheckout');

// Get with fallback
const title = getConfig('seo.title', 'Default Title');
```

### Writing Configuration

```typescript
import { setConfig, setBatchConfig } from '@/lib/configStore';

// Set a single value
setConfig('seo.siteName', 'New Name', 'admin@example.com');

// Set multiple values
setBatchConfig([
  { key: 'seo.siteName', value: 'New Name' },
  { key: 'seo.defaultTitle', value: 'New Title' }
], 'admin@example.com');
```

### Advanced Queries

```typescript
import { searchConfig, getConfigByPrefix, getAllConfig } from '@/lib/configStore';

// Search by pattern
const rateLimits = searchConfig(/rateLimit/);

// Get by prefix
const seoConfigs = getConfigByPrefix('seo.');

// Get all configurations
const allConfigs = getAllConfig();
```

## Testing

Run the configuration store tests:

```bash
node scripts/test-config-store.mjs
```

This validates:
- CSV file structure
- Required configuration keys
- Data type validity
- Sample configuration values

## Security Considerations

1. **Authentication**: The API endpoints should be protected with authentication middleware in production
2. **Authorization**: Restrict configuration changes to authorized users only
3. **Validation**: Add validation rules for configuration values before allowing updates
4. **Git History**: All changes are tracked in git, providing an additional audit layer

## Migration from Environment Variables

When migrating from environment variables:

1. Add the new config key to `config.csv`
2. Update the code to use `getConfig()` instead of `process.env`
3. Keep environment variable as fallback for backwards compatibility
4. Document the migration in this README

Example:
```typescript
// Before
const title = process.env.SEO_TITLE || 'Default';

// After (with fallback)
const title = getConfig('seo.title') || process.env.SEO_TITLE || 'Default';
```

## Future Enhancements

- Add a simple admin UI for non-technical stakeholders
- Implement configuration rollback functionality
- Add configuration validation schemas
- Create configuration change webhooks
- Add configuration import/export tools
- Implement environment-specific configurations (dev, staging, prod)
