# 🚀 VPS Setup Guide - Soketi & Shiprocket Webhook (Nixpack Build)

## ✅ Environment Variables Added

I've added the necessary configuration to your environment files:

### Backend (`backend/.env`)

```env
# Shiprocket
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_WEBHOOK_TOKEN=48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2

# Soketi
SOKETI_APP_ID=app-id
SOKETI_APP_KEY=app-key
SOKETI_APP_SECRET=app-secret
SOKETI_HOST=your-soketi-host.com
SOKETI_PORT=6001
SOKETI_USE_TLS=true
```

### Frontend (`frontend/.env.local` and `frontend/.env.production`)

```env
# Soketi Public Config
NEXT_PUBLIC_SOKETI_KEY=app-key
NEXT_PUBLIC_SOKETI_HOST=your-soketi-host.com
NEXT_PUBLIC_SOKETI_PORT=6001
NEXT_PUBLIC_SOKETI_TLS=true
NEXT_PUBLIC_SOKETI_CLUSTER=mt1
```

---

## 📝 Configuration Steps

### 1. Get Soketi Credentials from Your Dokploy Instance

Since you mentioned Soketi is already running on your VPS via Dokploy:

1. **Access your Dokploy dashboard**
2. **Find your Soketi instance** and get:
   - App ID
   - App Key
   - App Secret
   - Host URL (e.g., `ws.weBazaar.in` or `soketi.weBazaar.in`)

3. **Update both environment files** with your actual values:

#### Backend `.env`:

```env
SOKETI_APP_ID=your-actual-app-id
SOKETI_APP_KEY=your-actual-app-key
SOKETI_APP_SECRET=your-actual-app-secret
SOKETI_HOST=ws.weBazaar.in  # or your Soketi subdomain
SOKETI_PORT=6001
SOKETI_USE_TLS=true
```

#### Frontend `.env.production`:

```env
NEXT_PUBLIC_SOKETI_KEY=your-actual-app-key  # Same as SOKETI_APP_KEY
NEXT_PUBLIC_SOKETI_HOST=ws.weBazaar.in  # Same as SOKETI_HOST
NEXT_PUBLIC_SOKETI_PORT=6001
NEXT_PUBLIC_SOKETI_TLS=true
```

### 2. Configure Shiprocket Credentials

Update `backend/.env`:

```env
SHIPROCKET_EMAIL=your-actual-shiprocket-email
SHIPROCKET_PASSWORD=your-actual-shiprocket-password
```

### 3. Configure Shiprocket Webhook

1. **Login to Shiprocket Dashboard**
2. **Go to**: Settings → API → Webhooks
3. **Add New Webhook**:
   - **URL**: `https://api.weBazaar.in/api/webhooks/shiprocket`
   - **Method**: POST
   - **Custom Headers**: Add header
     - Name: `x-api-key`
     - Value: `48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2`
4. **Enable Events**:
   - ✅ AWB Generated
   - ✅ Picked Up
   - ✅ Shipped
   - ✅ In Transit
   - ✅ Out for Delivery
   - ✅ Delivered
   - ✅ RTO Initiated
   - ✅ Cancelled

5. **Test Webhook** (button in Shiprocket dashboard)
6. **Save**

---

## 🏗️ Nixpack Build Deployment

### Option 1: Via Git Push (Recommended)

```bash
# Commit the changes
git add .
git commit -m "Add Soketi and Shiprocket webhook integration"
git push

# Dokploy will automatically:
# 1. Detect changes
# 2. Build with Nixpack
# 3. Deploy both frontend and backend
# 4. Apply new environment variables
```

### Option 2: Via Dokploy Dashboard

1. **Go to your Dokploy dashboard**
2. **Select your backend project**
3. **Go to Environment Variables**
4. **Add/Update** the Shiprocket and Soketi variables
5. **Trigger rebuild**

6. **Repeat for frontend project**
7. **Add/Update** the Soketi public variables
8. **Trigger rebuild**

---

## 🧪 Testing

### 1. Test Backend is Running

```bash
curl https://api.weBazaar.in/api/health
```

### 2. Test Webhook Endpoint

```bash
curl -X POST https://api.weBazaar.in/api/webhooks/shiprocket \
  -H "Content-Type: application/json" \
  -H "x-api-key: 48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2" \
  -d '{
    "awb": "TEST123",
    "current_status": "IN TRANSIT",
    "sr_order_id": 12345,
    "timestamp": "2026-02-05T10:00:00Z"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Webhook received and queued for processing",
  "eventId": "TEST123-IN_TRANSIT-..."
}
```

### 3. Test Soketi Connection

Open browser console on your frontend:

```javascript
// Should see WebSocket connection
// Check Network tab → WS for soketi connection
```

---

## 🔍 Troubleshooting

### Backend Not Receiving Webhooks

1. **Check logs in Dokploy**:

   ```
   📦 Shiprocket webhook received: { awb: '...', status: '...' }
   ```

2. **Verify webhook in Shiprocket**:
   - Check webhook logs in Shiprocket dashboard
   - Look for success/failure indicators

3. **Test manually**:
   ```bash
   # From your local machine
   .\test-webhook.ps1
   ```

### Soketi Not Connecting

1. **Check Soketi is running**:

   ```bash
   curl http://your-soketi-host:9601/metrics
   ```

2. **Verify WebSocket port (6001) is open**:
   - Check firewall rules
   - Verify Dokploy proxy configuration

3. **Check browser console** for errors:
   ```
   Failed to connect to Soketi
   WebSocket connection failed
   ```

### Environment Variables Not Applied

1. **Restart services in Dokploy**
2. **Clear cache and rebuild**
3. **Verify variables are set** in Dokploy dashboard

---

## 📊 Monitoring

### Check Webhook Logs (Admin)

```bash
# Via API (needs admin auth)
curl https://api.weBazaar.in/api/webhooks/logs?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check Database

```javascript
// Connect to MongoDB
use shoes_auth

// Check webhook logs
db.webhooklogs.find().sort({createdAt: -1}).limit(10)

// Check orders with tracking
db.orders.find({"shipping.awb_code": {$exists: true}})
```

---

## 🚀 Production Checklist

- [ ] Update Soketi credentials in both `.env` files
- [ ] Update Shiprocket email/password in backend `.env`
- [ ] Configure Shiprocket webhook URL
- [ ] Commit and push code to trigger Nixpack build
- [ ] Wait for Dokploy deployment
- [ ] Test webhook endpoint with curl
- [ ] Create test shipment in Shiprocket
- [ ] Verify real-time updates in frontend
- [ ] Monitor webhook logs for errors

---

## 📝 Important Notes

### For Nixpack Build:

- ✅ No Dockerfile needed (Nixpack auto-detects)
- ✅ Environment variables set via Dokploy
- ✅ Automatic builds on git push
- ✅ Zero-downtime deployments

### Webhook URL:

```
Production: https://api.weBazaar.in/api/webhooks/shiprocket
NOT using: ngrok (since you're on VPS)
```

### Soketi:

```
Already running in Dokploy
Just need credentials from your instance
```

---

## 🎯 Next Steps

1. **Get Soketi credentials** from your Dokploy Soketi instance
2. **Update environment files** with actual values
3. **Push code**: `git push`
4. **Configure Shiprocket webhook** in dashboard
5. **Test with real order**

---

**Ready for production!** 🚀

All code is deployed, just need to configure the credentials.
