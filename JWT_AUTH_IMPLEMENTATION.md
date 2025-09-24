# JWT Authentication Implementation

## ✅ Complete Production-Ready JWT Authentication System

### Overview
A secure JWT-based authentication system has been implemented with access and refresh tokens, following industry best practices.

## 🔐 Security Features

### 1. **Dual Token System**
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie

### 2. **Cookie Security**
- `httpOnly`: Prevents JavaScript access
- `Secure`: HTTPS-only in production
- `SameSite=Strict`: CSRF protection
- Automatic cleanup on logout

### 3. **Rate Limiting**
- 5 login attempts per IP
- 15-minute lockout period
- In-memory tracking (upgradeable to Redis)

### 4. **Input Validation**
- Email format validation
- Password minimum length (8 characters)
- Zod schema validation
- Generic error messages to prevent user enumeration

### 5. **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 📁 File Structure

```
src/
├── lib/
│   └── auth/
│       ├── jwt.ts          # JWT token management
│       └── middleware.ts   # Authentication middleware
└── app/
    └── api/
        └── auth/
            ├── login/       # POST: Login endpoint
            ├── logout/      # POST: Logout endpoint
            ├── refresh/     # POST: Refresh token endpoint
            └── verify/      # GET: Verify authentication
```

## 🔑 API Endpoints

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "customer_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST `/api/auth/refresh`
Automatically uses refresh token from cookies.

**Success Response (200):**
```json
{
  "accessToken": "new.access.token",
  "user": {...},
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### POST `/api/auth/logout`
Clears all authentication cookies and revokes Shopify token.

### GET `/api/auth/verify`
Requires `Authorization: Bearer <accessToken>` header.

**Success Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "customer_123",
    "email": "user@example.com"
  }
}
```

## 🔧 Environment Variables

Add to `.env.local`:
```bash
# Generate with: openssl rand -base64 32
JWT_ACCESS_SECRET=your-super-secure-access-token-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret
```

## 💻 Frontend Integration

### Login Example:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
if (response.ok) {
  // Store access token in memory/state
  localStorage.setItem('accessToken', data.accessToken);
  // Redirect to dashboard
}
```

### API Request with Auth:
```javascript
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

### Token Refresh:
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include', // Important for cookies
});

if (response.ok) {
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
}
```

## 🛡️ Security Best Practices Implemented

1. **No sensitive data in JWT payload**
2. **Shopify token only stored in refresh token**
3. **Generic error messages** to prevent user enumeration
4. **Automatic token rotation** on refresh
5. **Secure cookie flags** in production
6. **Rate limiting** on authentication endpoints
7. **Input validation** with Zod schemas
8. **CORS preflight** support

## 🚀 Production Checklist

- [x] JWT secret generation
- [x] Secure cookie configuration
- [x] Rate limiting implementation
- [x] Input validation
- [x] Error handling
- [x] Security headers
- [x] Token refresh mechanism
- [x] Logout functionality
- [ ] Redis for distributed rate limiting (optional)
- [ ] Token blacklist for invalidation (optional)
- [ ] Multi-factor authentication (future)

## 📊 Benefits

1. **Stateless Authentication**: Scales horizontally
2. **Secure**: Industry-standard security practices
3. **Performance**: No database lookup for every request
4. **Flexible**: Easy to add claims to tokens
5. **Standard**: Works with any JWT-compatible library

## 🔍 Testing

Run the test script:
```bash
node test-auth.mjs
```

This validates:
- Input validation
- Error handling
- Response format
- Security headers

## 📝 Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens auto-rotate on refresh
- All sensitive operations require fresh authentication
- Consider implementing token blacklist for immediate revocation