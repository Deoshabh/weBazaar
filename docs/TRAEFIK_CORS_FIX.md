# Traefik CORS Fix - Implementation Guide

## Overview

This guide explains the Traefik configuration to fix CORS and preflight issues for your backend API.

## Configuration Changes

### 1. **docker-compose.traefik.yml** (NEW FILE)

This file contains the complete Traefik setup with:

- **Traefik Service**: Reverse proxy handling routing and SSL/TLS
- **Backend Service**: Node.js Express app (port 5000)
- **Frontend Service**: Next.js app (port 3000)
- **CORS Middleware**: Configured at the Traefik level

### 2. Key Configuration Details

#### Traefik Routes Configuration

**Backend API (api.weBazaar.in)**

```yaml
traefik.http.routers.backend.rule=Host(`api.weBazaar.in`)
traefik.http.routers.backend.entrypoints=websecure  # ✅ ONLY HTTPS, no HTTP
traefik.http.routers.backend.middlewares=cors-headers
traefik.http.services.backend.loadbalancer.server.port=5000
```

**Why this matters:**

- `entrypoints=websecure` ensures only HTTPS connections are accepted
- This prevents HTTP requests that would redirect and break preflight OPTIONS requests
- The CORS middleware is attached only to the backend router

#### CORS Headers Middleware

```yaml
traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist=https://weBazaar.in,https://www.weBazaar.in
traefik.http.middlewares.cors-headers.headers.accesscontrolallowmethods=GET, POST, PUT, PATCH, DELETE, OPTIONS
traefik.http.middlewares.cors-headers.headers.accesscontrolallowheaders=Authorization, Content-Type, X-Requested-With
traefik.http.middlewares.cors-headers.headers.accesscontrolallowcredentials=true
```

**What this does:**

- Adds CORS headers at the Traefik proxy level (before reaching Node.js)
- OPTIONS requests are forwarded to the backend without any redirects
- Properly handles preflight requests for POST /api/v1/auth/login and /api/v1/auth/register

### 3. Backend (server.js) - No Changes Needed ✅

Your backend already has:

- `app.options("*", cors())` - Handles ALL preflight requests
- Proper CORS configuration with `credentials: true`
- Listening on port 5000
- Health check endpoint at `/health`

### 4. Deployment Steps

#### Step 1: Build and Start Services

```bash
docker-compose -f docker-compose.traefik.yml up -d
```

#### Step 2: Verify Traefik Dashboard

- Access at: `http://localhost:8080` or `https://your-domain:8080`
- Check that routes are configured correctly
- Verify backend service is registered and healthy

#### Step 3: Test CORS Preflight

**From your browser console (when on weBazaar.in):**

```javascript
// Test OPTIONS preflight
fetch("https://api.weBazaar.in/api/v1/auth/login", {
  method: "OPTIONS",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((r) => console.log("OPTIONS Status:", r.status))
  .catch((e) => console.error("Error:", e));

// Test actual login
fetch("https://api.weBazaar.in/api/v1/auth/login", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email: "test@example.com", password: "password" }),
})
  .then((r) => r.json())
  .then((d) => console.log("Login Response:", d))
  .catch((e) => console.error("Error:", e));
```

#### Step 4: Expected Results

✅ **Successful CORS Configuration:**

- OPTIONS request returns 204/200 with CORS headers
- No redirect errors
- `Access-Control-Allow-*` headers present in response
- POST requests to `/api/v1/auth/login` and `/api/v1/auth/register` work
- Cookies are sent/received correctly

❌ **If you still see CORS errors:**

1. Verify frontend domain in `accesscontrolalloworiginlist` (must match exactly)
2. Check that OPTIONS response includes all required headers
3. Ensure credentials: true is set in CORS config
4. Verify backend service is healthy: `curl https://api.weBazaar.in/health`

### 5. Environment Variables

Ensure your `.env` file in the backend root contains:

```env
MONGO_URI=mongodb://your-mongo-uri
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
MINIO_ENDPOINT=your-minio-endpoint
MINIO_PORT=your-minio-port
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=your-bucket-name
```

### 6. Important Notes

**Why OPTIONS requests were failing before:**

- Redirect middleware (if present) would send 301/302 to OPTIONS requests
- Browser sees redirect instead of CORS headers
- Request is blocked by browser's CORS policy

**Why this fix works:**

- OPTIONS requests bypass redirects entirely in Traefik
- CORS headers are added at proxy level (immediate response)
- Backend still has backup CORS handling via `app.options("*", cors())`
- Double CORS handling (proxy + backend) is safe and beneficial

**Port 5000 vs 3000:**

- Backend runs on port 5000 (configured in docker-compose)
- Frontend runs on port 3000 (Node.js port)
- Traefik routes based on domain names, not ports
- Users never see these internal ports

## Troubleshooting

### Traefik Dashboard Not Accessible

```bash
# Check if Traefik is running
docker ps | grep traefik

# View logs
docker logs traefik

# Restart if needed
docker-compose -f docker-compose.traefik.yml restart traefik
```

### Backend Service Health Checks Failing

```bash
# Check backend logs
docker logs weBazaar-backend

# Test health endpoint directly
curl http://localhost:5000/health

# Verify environment variables are set
docker inspect weBazaar-backend
```

### SSL Certificate Issues

```bash
# Check certificate status
docker logs traefik | grep letsencrypt

# View certificate file
ls -la letsencrypt/

# Force certificate renewal (if needed)
docker-compose -f docker-compose.traefik.yml restart traefik
```

## Security Considerations

1. **CORS Origin Restriction**: Only `https://weBazaar.in` and `https://www.weBazaar.in` are allowed
2. **Credentials**: Enabled for authenticated requests
3. **Methods**: Only necessary HTTP methods are allowed
4. **Headers**: Only required headers are exposed
5. **HTTPS Only**: Backend API only accepts secure connections

## References

- [Traefik Documentation](https://doc.traefik.io/)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://www.npmjs.com/package/cors)
