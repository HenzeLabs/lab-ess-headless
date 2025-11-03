# Shopping Cart Feature

## Overview
The shopping cart allows users to review selected items, adjust quantities, and proceed to checkout.

## User Stories
- As a shopper, I want to see all items in my cart so I can review my purchases
- As a shopper, I want to update item quantities so I can adjust my order
- As a shopper, I want to remove items so I can change my mind
- As a shopper, I want to see the total price so I can know the cost
- As a shopper, I want to proceed to checkout so I can complete my purchase

## Acceptance Criteria
- All cart items display with images, titles, prices
- Quantity adjustment works correctly
- Remove item functionality works
- Cart total calculates correctly
- Trust signals are visible below summary
- Checkout button is prominent and accessible
- Empty cart state displays appropriately
- Cart persists across sessions
- Mobile responsive design

## Technical Notes
- Path: `/cart` (src/app/cart/page.tsx)
- Server component with client-side updates
- Cart API routes: `/api/cart`
- Shopify Cart API integration
- Local storage for cart persistence
- Conversion-focused layout with 2/3 items, 1/3 summary at lg breakpoint
