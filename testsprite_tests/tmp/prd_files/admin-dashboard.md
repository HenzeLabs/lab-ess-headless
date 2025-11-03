# Admin Dashboard Feature

## Overview
Admin dashboard providing metrics, analytics, configuration management, and A/B testing capabilities.

## User Stories
- As an admin, I want to view site metrics so I can track performance
- As an admin, I want to see analytics data so I can make informed decisions
- As an admin, I want to manage site configuration so I can customize the site
- As an admin, I want to run A/B tests so I can optimize conversions

## Acceptance Criteria
- Dashboard loads with authentication check
- Metrics display correctly (sessions, conversions, revenue)
- Charts render properly with real data
- Configuration editor works correctly
- A/B test creation and management functions
- Performance monitoring displays current stats
- Security monitoring shows alerts
- Mobile responsive layout

## Technical Notes
- Path: `/admin` (src/app/admin/page.tsx)
- Metrics path: `/admin/metrics` (src/app/admin/metrics/page.tsx)
- Protected routes with JWT middleware
- Google Analytics Data API integration
- Shopify metrics integration
- Real-time data updates with caching
- Recharts for data visualization
