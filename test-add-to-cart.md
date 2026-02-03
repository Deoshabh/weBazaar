# Test Plan: Add to Cart / Buy Now Fix

## Issue

Users were getting logged out when clicking "Add to Cart" or "Buy Now" buttons from product cards.

## Root Cause

The API interceptor was redirecting to `/auth/login` when cart API calls failed with 401, even when the user was browsing products (not on a protected page).

## Fix Applied

Removed `/cart` from the protected page routes list in `frontend/src/utils/api.js`. Now only these routes trigger automatic redirect:

- `/checkout`
- `/orders`
- `/profile`
- `/admin`

## Test Scenarios

### Scenario 1: Unauthenticated User

1. **Browse Products** (not logged in)
2. **Click "Add to Cart"**
   - Expected: Toast error "Please login to add items to cart"
   - Expected: No automatic redirect to login
   - Expected: User stays on product page
3. **Click "Buy Now"**
   - Expected: Toast error "Please login to add items to cart"
   - Expected: No automatic redirect to login
   - Expected: User stays on product page

### Scenario 2: Authenticated User

1. **Login** to the application
2. **Browse Products**
3. **Click "Add to Cart"**
   - Expected: Toast success "Added to cart!"
   - Expected: User stays on product page
   - Expected: Cart count increases in header
4. **Click "Buy Now"**
   - Expected: Toast success "Added to cart!"
   - Expected: **User navigates to /cart page** (using Next.js router)
   - Expected: Cart page shows the added item

### Scenario 3: Expired Token

1. **Login** to the application
2. **Wait for token to expire** (or manually delete accessToken cookie)
3. **Click "Add to Cart"**
   - Expected: Interceptor tries to refresh token
   - If refresh succeeds: Item is added to cart
   - If refresh fails: Toast error, no redirect (stays on product page)

### Scenario 4: Protected Pages

1. **Visit /checkout** with expired/invalid token
   - Expected: Automatic redirect to /auth/login
2. **Visit /orders** with expired/invalid token
   - Expected: Automatic redirect to /auth/login
3. **Visit /profile** with expired/invalid token
   - Expected: Automatic redirect to /auth/login

## Files Modified

- `frontend/src/utils/api.js` - Removed `/cart` from protected routes list

## How to Test

```bash
# Start development server
cd frontend
npm run dev

# Open browser
# Navigate to http://localhost:3000
# Test each scenario above
```

## Success Criteria

✅ Users can browse products without getting logged out
✅ Add to Cart works without causing redirects
✅ Buy Now navigates to cart page (not full page reload)
✅ Unauthenticated users see friendly error messages
✅ Protected pages still require authentication
