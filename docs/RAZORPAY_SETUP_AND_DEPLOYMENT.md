# Razorpay Setup and Deployment Guide

## 🔑 Razorpay Configuration

### Current Test Credentials

```
Key ID: rzp_test_SBfFobfvhPtFYL
Key Secret: vTZJIY2T5zJmIqRk7aeuidrJ
```

### Environment Variables Setup

#### Backend (.env.production)

```bash
RAZORPAY_KEY_ID=rzp_test_SBfFobfvhPtFYL
RAZORPAY_KEY_SECRET=vTZJIY2T5zJmIqRk7aeuidrJ
```

#### Frontend (.env.production)

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SBfFobfvhPtFYL
```

**Note**: The frontend env variable is kept for backwards compatibility, but the app now fetches the key from the backend API for better security.

## 🚀 Dokploy Deployment Steps

### 1. Update Backend Environment Variables

1. Login to Dokploy dashboard
2. Navigate to your backend service
3. Go to **Environment Variables** section
4. Add/Update these variables:
   ```
   RAZORPAY_KEY_ID=rzp_test_SBfFobfvhPtFYL
   RAZORPAY_KEY_SECRET=vTZJIY2T5zJmIqRk7aeuidrJ
   ```
5. **Save** the changes
6. **Redeploy** the backend service

### 2. Update Frontend Environment Variables

1. Navigate to your frontend service in Dokploy
2. Go to **Environment Variables** section
3. Add/Update:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SBfFobfvhPtFYL
   NEXT_PUBLIC_API_URL=https://api.weBazaar.in/api/v1
   ```
4. **Save** the changes
5. **Redeploy** the frontend service

### 3. Verify Configuration

After deployment, check:

1. **Backend logs** for Razorpay initialization:

   ```
   ✅ Razorpay credentials configured
   ```

2. **Frontend console** should NOT show:

   ```
   ❌ rzp_live_YOUR_KEY_ID (placeholder key)
   ```

3. **Test the payment flow**:
   - Add product to cart
   - Go to checkout
   - Select Razorpay payment
   - Razorpay modal should open with correct test key

## 🔒 Security Architecture

### Key Flow (New Approach)

```
Frontend → Backend API → Razorpay Key
                ↓
         (Secure transfer)
                ↓
         Razorpay Modal
```

**Benefits:**

- Key not exposed in frontend build
- Can rotate keys without frontend redeployment
- Centralized key management

### API Endpoint

```javascript
POST /api/v1/orders/:id/razorpay
Response: {
  razorpayOrderId: "order_...",
  amount: 250000,
  currency: "INR",
  key: "rzp_test_SBfFobfvhPtFYL"  // Sent from backend
}
```

## 🧪 Testing Razorpay Integration

### Test Cards (Razorpay Test Mode)

**Successful Payment:**

```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**Failed Payment:**

```
Card Number: 4000 0000 0000 0002
```

**UPI (Test):**

```
UPI ID: success@razorpay
```

### Test Flow

1. **Add to Cart**: Should work without login
2. **Buy Now**: Should work without login (but redirect to login if not authenticated)
3. **Checkout**: Must be logged in
4. **Place Order**:
   - COD: Order created immediately
   - Razorpay: Modal opens → Complete payment → Verify → Order confirmed

## 🐛 Troubleshooting

### Issue: "rzp_live_YOUR_KEY_ID" in console

**Cause**: Environment variable not loaded

**Fix:**

1. Verify env variables in Dokploy
2. Redeploy both services
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Issue: 401 Unauthorized from Razorpay

**Causes:**

1. Wrong API credentials
2. Credentials not set in environment
3. Using live key with test secret (or vice versa)

**Fix:**

```bash
# Verify both keys match the mode (test or live)
RAZORPAY_KEY_ID=rzp_test_...  # ✅ Correct
RAZORPAY_KEY_SECRET=vTZJIY... # ✅ Correct

# ❌ Wrong combination:
RAZORPAY_KEY_ID=rzp_live_...  # Live key
RAZORPAY_KEY_SECRET=test_secret # Test secret
```

### Issue: "Buy Now" causes logout

**Cause**: API interceptor redirecting on cart operations

**Status**: ✅ FIXED

**Solution**: Updated API interceptor to only redirect on protected routes:

```javascript
const isProtectedRoute = [
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
  "/admin",
].some((route) => window.location.pathname.startsWith(route));
```

Cart operations from product pages no longer trigger logout.

## 📋 Deployment Checklist

- [ ] Backend environment variables updated in Dokploy
- [ ] Frontend environment variables updated in Dokploy
- [ ] Backend redeployed
- [ ] Frontend redeployed
- [ ] Test mode enabled (test keys configured)
- [ ] Tested: Browse products (no login)
- [ ] Tested: Add to cart (no login)
- [ ] Tested: Buy Now (redirects to login if needed)
- [ ] Tested: Checkout with Razorpay
- [ ] Tested: COD order
- [ ] Verified: No "YOUR_KEY_ID" in logs
- [ ] Verified: Orders showing correct totalAmount
- [ ] Verified: Order status updates work

## 🔄 Switching to Production Mode

When ready for production:

1. Get production keys from Razorpay dashboard
2. Update both env files:
   ```bash
   # Replace test keys with production keys
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
   RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
   ```
3. Redeploy both services
4. Test with real payment (small amount first!)
5. Monitor Razorpay dashboard for transactions

## 📞 Support

**Razorpay Documentation**: https://razorpay.com/docs/

**Dashboard**: https://dashboard.razorpay.com/

**Common Issues**:

- Test mode vs Live mode mismatch
- Webhook signature verification
- Amount conversion (INR to paise: multiply by 100)
