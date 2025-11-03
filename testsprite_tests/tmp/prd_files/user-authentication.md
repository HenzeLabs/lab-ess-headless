# User Authentication Feature

## Overview
User authentication system allowing customers to create accounts, log in, and manage their profile and orders.

## User Stories
- As a new user, I want to register an account so I can track my orders
- As a returning user, I want to log in so I can access my account
- As a logged-in user, I want to view my order history so I can track purchases
- As a user, I want to log out so I can secure my account

## Acceptance Criteria
- Registration form validates all required fields
- Login form authenticates users securely
- JWT tokens are issued and stored securely
- Password validation meets security requirements
- Error messages are clear and helpful
- Forms are accessible with proper labels
- Session management works correctly
- Logout clears session data

## Technical Notes
- Login path: `/account/login` (src/app/account/login/page.tsx)
- Register path: `/account/register` (src/app/account/register/page.tsx)
- JWT authentication using jose library
- Shopify Customer API integration
- Secure cookie storage for tokens
- Middleware for protected routes
