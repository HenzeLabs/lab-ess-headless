# Phase 2 Quick Start Guide

**Get Started in 30 Minutes**

---

## Overview

This guide helps you start Phase 2 development immediately. Follow these steps to set up your environment and begin building the admin dashboard.

---

## Prerequisites

✅ **Phase 1 Complete:**
- v1.0-runtime-config deployed
- All tests passing
- Configuration store working

✅ **Team Ready:**
- Frontend developer available
- Backend developer available
- Designer accessible (for mockups)

✅ **Approvals Obtained:**
- Budget approved (~$116K)
- Resources allocated
- Timeline confirmed (8 weeks)

---

## Quick Setup (30 Minutes)

### Step 1: Create Feature Branch (5 min)

```bash
# Create Phase 2 branch
git checkout -b feature/admin-dashboard-phase2

# Create directory structure
mkdir -p app/admin/config/{components,hooks,styles}
mkdir -p lib/{ga4,clarity,backup}
mkdir -p scripts/reports
```

### Step 2: Install Additional Dependencies (5 min)

```bash
# UI Components (shadcn/ui recommended)
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select

# Analytics packages
npm install @google-analytics/data
npm install @aws-sdk/client-s3

# Utilities
npm install date-fns
npm install recharts  # For charts
npm install react-hook-form
npm install zod  # Already installed, verify
```

### Step 3: Set Up Environment Variables (5 min)

```bash
# Add to .env.local
cat >> .env.local << 'EOF'

# Phase 2: Admin Dashboard
ADMIN_DASHBOARD_ENABLED=true

# Phase 2: GA4 Integration
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_JSON=

# Phase 2: Clarity Integration
CLARITY_PROJECT_ID=
CLARITY_API_KEY=

# Phase 2: S3 Backups
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BACKUP_BUCKET=lab-essentials-config-backups

# Phase 2: Email Reports
SENDGRID_API_KEY=
WEEKLY_REPORT_RECIPIENTS=engineering@lab-essentials.com

# Phase 2: Slack Notifications
SLACK_WEBHOOK_URL=
EOF
```

### Step 4: Create Base Admin Layout (10 min)

```typescript
// app/admin/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminAuth } from '@/middleware/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verify authentication
  // In production, check session/token here

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Lab Essentials Admin</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

```typescript
// app/admin/config/page.tsx
import { getAllConfig } from '@/lib/configStore';
import ConfigTable from './components/ConfigTable';

export default async function ConfigAdminPage() {
  const configs = getAllConfig();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Configuration Management</h2>
      <ConfigTable initialConfigs={configs} />
    </div>
  );
}
```

### Step 5: Create First Component (5 min)

```typescript
// app/admin/config/components/ConfigTable.tsx
'use client';

import { useState } from 'react';
import { ConfigRecord } from '@/lib/configStore';

interface Props {
  initialConfigs: ConfigRecord[];
}

export default function ConfigTable({ initialConfigs }: Props) {
  const [configs, setConfigs] = useState(initialConfigs);

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Key
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Updated By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Updated At
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {configs.map((config) => (
            <tr key={config.key}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {config.key}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {config.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {config.updated_by}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(config.updated_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 6: Test Initial Setup (5 min)

```bash
# Start dev server
npm run dev

# Open browser to:
# http://localhost:3000/admin/config

# You should see:
# - Admin layout
# - Configuration table
# - All 20 parameters listed
```

---

## First Sprint Tasks (Week 1)

### Day 1: Design & Planning

**Morning:**
- [ ] Review UI mockups with designer
- [ ] Finalize component structure
- [ ] Define API contracts

**Afternoon:**
- [ ] Set up project tracking (Jira/Linear)
- [ ] Create task breakdown
- [ ] Assign ownership
- [ ] Kick off daily standups

### Day 2-3: Core Table Component

- [ ] Build sortable table header
- [ ] Add filtering by category
- [ ] Implement search functionality
- [ ] Add pagination (if needed)
- [ ] Style with Tailwind/shadcn

### Day 4-5: Inline Editor

- [ ] Build edit modal component
- [ ] Add form validation
- [ ] Implement API integration
- [ ] Add success/error notifications
- [ ] Test edit flow end-to-end

---

## Development Workflow

### Daily Routine

**Morning Standup (15 min):**
- What did you do yesterday?
- What will you do today?
- Any blockers?

**Development (6-7 hours):**
- Focus on assigned tasks
- Commit frequently
- Write tests as you go
- Update documentation

**End of Day:**
- Push your code
- Update task status
- Note any blockers for tomorrow

### Code Review Process

**Before Creating PR:**
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint warnings addressed
- [ ] Component documented
- [ ] Self-review completed

**PR Checklist:**
- [ ] Descriptive title
- [ ] Screenshots (for UI changes)
- [ ] Test plan included
- [ ] Breaking changes noted
- [ ] Linked to task/ticket

### Testing Strategy

**Unit Tests:**
```typescript
// __tests__/admin/ConfigTable.test.tsx
import { render, screen } from '@testing-library/react';
import ConfigTable from '@/app/admin/config/components/ConfigTable';

describe('ConfigTable', () => {
  it('renders all configurations', () => {
    const configs = [
      { key: 'test.key', value: 'test value', updated_by: 'user', updated_at: new Date().toISOString(), version: '1' }
    ];

    render(<ConfigTable initialConfigs={configs} />);

    expect(screen.getByText('test.key')).toBeInTheDocument();
    expect(screen.getByText('test value')).toBeInTheDocument();
  });
});
```

**Integration Tests:**
- Test full edit flow (open modal → edit → save → verify)
- Test authentication (protected routes)
- Test error handling (network failures)

**E2E Tests:**
- Use existing Playwright setup
- Add admin dashboard test suite
- Test critical user journeys

---

## Common Patterns

### Fetching Configs

```typescript
// hooks/useConfig.ts
import { useEffect, useState } from 'react';
import { ConfigRecord } from '@/lib/configStore';

export function useConfig() {
  const [configs, setConfigs] = useState<ConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      setLoading(true);
      const response = await fetch('/api/config?all=true');
      if (!response.ok) throw new Error('Failed to fetch configs');
      const data = await response.json();
      setConfigs(data.configs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { configs, loading, error, refetch: fetchConfigs };
}
```

### Updating Config

```typescript
async function updateConfig(key: string, value: string) {
  const token = localStorage.getItem('admin_token'); // Or from auth context

  const response = await fetch('/api/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      key,
      value,
      updated_by: currentUser.email
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update config');
  }

  return response.json();
}
```

### Toast Notifications

```typescript
// Use shadcn's toast or build custom
import { toast } from '@/components/ui/use-toast';

// Success
toast({
  title: 'Configuration updated',
  description: `${key} has been updated successfully`,
});

// Error
toast({
  title: 'Update failed',
  description: error.message,
  variant: 'destructive',
});
```

---

## Troubleshooting

### Issue: Admin page not loading

**Check:**
- [ ] Route file exists at `app/admin/config/page.tsx`
- [ ] No TypeScript errors
- [ ] Server restarted after creating new route
- [ ] Browser cache cleared

**Fix:**
```bash
# Kill dev server
# Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Issue: API calls failing with 401

**Check:**
- [ ] Admin token set in environment
- [ ] Token being sent in request headers
- [ ] Authentication middleware working

**Fix:**
```bash
# Verify token exists
grep CONFIG_ADMIN_TOKEN .env.local

# Test API directly
export TOKEN=$(grep CONFIG_ADMIN_TOKEN .env.local | cut -d= -f2)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/config?all=true
```

### Issue: Styles not applying

**Check:**
- [ ] Tailwind configured correctly
- [ ] shadcn/ui installed
- [ ] CSS imported in layout

**Fix:**
```bash
# Verify Tailwind config
cat tailwind.config.js

# Check if shadcn components are installed
ls components/ui/
```

---

## Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)

### Design References
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Admin](https://supabase.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)

### Phase 2 Docs
- [PHASE_2_KICKOFF.md](../PHASE_2_KICKOFF.md) - Full roadmap
- [reports/PHASE_2_ROADMAP.md](../reports/PHASE_2_ROADMAP.md) - Detailed plan

---

## Success Checklist

### End of Week 1

- [ ] Admin layout created and styled
- [ ] Configuration table displaying all parameters
- [ ] Sorting by column working
- [ ] Search/filter functionality working
- [ ] Code reviewed and merged

### End of Week 2

- [ ] Inline editor modal complete
- [ ] Edit functionality working end-to-end
- [ ] Change history modal showing versions
- [ ] Bulk actions toolbar functional
- [ ] User testing completed with 3+ people
- [ ] Ready for staging deployment

---

## Next Steps

After completing this quick start:

1. **Review** [PHASE_2_KICKOFF.md](../PHASE_2_KICKOFF.md) for full details
2. **Schedule** daily standups with team
3. **Set up** project tracking
4. **Begin** Week 1 development tasks
5. **Test** frequently and iterate

---

**Questions?** Reach out to:
- Engineering Lead (technical questions)
- Product Manager (feature questions)
- Designer (UI/UX questions)

**Let's build something amazing!** 🚀
