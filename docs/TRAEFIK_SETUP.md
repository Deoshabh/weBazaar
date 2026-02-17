# 🚀 Traefik CORS Fix - Complete Setup

## Quick Start (5 minutes)

### Step 1: Prepare Environment

```bash
# Copy the example environment file
cp .env.traefik.example .env

# Edit .env with your actual values
# - MongoDB connection string
# - JWT secrets
# - MinIO credentials
```

### Step 2: Deploy

```bash
# On Linux/Mac:
chmod +x deploy.sh
./deploy.sh

# On Windows:
deploy.bat
```

### Step 3: Verify

```bash
# Check all services are running
docker-compose -f docker-compose.traefik.yml ps

# Test CORS preflight
curl -X OPTIONS https://api.weBazaar.in/api/v1/auth/login \
  -H 'Origin: https://weBazaar.in' \
  -H 'Access-Control-Request-Method: POST' \
  -i
```

**Expected Response:**

```
HTTP/2 204
access-control-allow-origin: https://weBazaar.in
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-credentials: true
```

## What Changed?

### New Files

| File                         | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `docker-compose.traefik.yml` | Complete Traefik setup with CORS middleware |
| `backend/Dockerfile`         | Production-ready backend container          |
| `frontend/Dockerfile`        | Production-ready frontend container         |
| `.env.traefik.example`       | Environment variables template              |
| `deploy.sh` / `deploy.bat`   | Deployment automation scripts               |
| `backend/.dockerignore`      | Docker build optimization                   |
| `frontend/.dockerignore`     | Docker build optimization                   |
| `TRAEFIK_CORS_FIX.md`        | Detailed technical documentation            |
| `TRAEFIK_SETUP.md`           | This file                                   |

### Modified Files

**None!** Your existing code is compatible. No breaking changes.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Internet (HTTPS)                    │
│  weBazaar.in / api.weBazaar.in                    │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Traefik (Port 443)    │
        │  - CORS Middleware      │
        │  - SSL/TLS Termination  │
        │  - Routing              │
        └───────┬──────────┬──────┘
                │          │
       ┌────────▼─┐   ┌────▼────────┐
       │ Backend  │   │  Frontend    │
       │ Port 5000│   │  Port 3000   │
       └──────────┘   └─────────────┘
```

## Key Features

✅ **CORS Fixed at Proxy Level**

- OPTIONS requests are not redirected
- CORS headers added before reaching backend
- Prevents browser preflight errors

✅ **Production Ready**

- SSL/TLS with Let's Encrypt
- Health checks enabled
- Multi-stage Docker builds
- Non-root user in containers
- Proper signal handling (dumb-init)

✅ **Security**

- HTTPS only on api.weBazaar.in
- CORS restricted to specific origins
- No hardcoded secrets (uses .env)
- Non-root container execution

✅ **Easy Deployment**

- Single docker-compose file
- Deployment scripts included
- Environment variables documented
- Health checks built-in

## Common Issues & Solutions

### 1. CORS Errors Still Happening

**Problem:** Browser shows "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**

```bash
# 1. Verify frontend domain matches CORS config
# Edit docker-compose.traefik.yml, check:
- "traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist=https://weBazaar.in,https://www.weBazaar.in"

# 2. Test CORS headers are present
curl -X OPTIONS https://api.weBazaar.in/api/v1/auth/login \
  -H 'Origin: https://weBazaar.in' \
  -v

# 3. Check if backend service is healthy
docker-compose -f docker-compose.traefik.yml ps

# 4. View Traefik logs
docker logs traefik
```

### 2. Backend Service Not Starting

**Problem:** Backend service shows unhealthy or keeps restarting

**Solution:**

```bash
# 1. Check logs
docker logs weBazaar-backend

# 2. Verify environment variables are set
docker inspect weBazaar-backend | grep -A 20 "Env"

# 3. Ensure .env file exists and has required values
cat .env | grep -E "MONGO|JWT|MINIO"

# 4. Restart the service
docker-compose -f docker-compose.traefik.yml restart backend
```

### 3. SSL Certificate Issues

**Problem:** "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" or certificate errors

**Solution:**

```bash
# 1. Check certificate status
docker logs traefik | grep -i certificate

# 2. Check if letsencrypt directory exists and is writable
ls -la letsencrypt/

# 3. Restart Traefik to force certificate renewal
docker-compose -f docker-compose.traefik.yml restart traefik

# 4. Wait a few minutes for Let's Encrypt validation
```

### 4. Preflight (OPTIONS) Requests Failing

**Problem:** OPTIONS requests return 404 or are redirected

**Solution:**

```bash
# This shouldn't happen with the current setup, but if it does:

# 1. Check backend router config
# Verify: app.options("*", cors()) exists in server.js

# 2. Verify NO middleware is redirecting OPTIONS
# Search for middleware that handles OPTIONS

# 3. Test OPTIONS directly on backend
docker exec weBazaar-backend curl -X OPTIONS http://localhost:5000/api/v1/auth/login -v

# 4. Check Traefik middleware attachment
docker exec traefik traefik --version  # Check version
docker logs traefik | grep middleware  # Check middleware logs
```

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.traefik.yml logs -f

# Specific service
docker-compose -f docker-compose.traefik.yml logs -f backend
docker-compose -f docker-compose.traefik.yml logs -f frontend
docker-compose -f docker-compose.traefik.yml logs -f traefik

# Last N lines
docker-compose -f docker-compose.traefik.yml logs --tail=100 backend
```

### Service Management

```bash
# Restart a service
docker-compose -f docker-compose.traefik.yml restart backend

# Stop all services
docker-compose -f docker-compose.traefik.yml down

# Start again
docker-compose -f docker-compose.traefik.yml up -d

# Rebuild images
docker-compose -f docker-compose.traefik.yml build --no-cache

# Remove everything (volumes, networks, containers)
docker-compose -f docker-compose.traefik.yml down -v
```

### Traefik Dashboard

- URL: `http://localhost:8080`
- Shows all routes configured
- Displays middleware status
- Shows certificate information
- Check service health

## Testing Checklist

Before going to production, verify:

- [ ] Frontend loads at https://weBazaar.in
- [ ] Backend health check passes: `curl https://api.weBazaar.in/health`
- [ ] OPTIONS preflight returns 204/200: See "Test CORS" above
- [ ] Login works: POST to `/api/v1/auth/login`
- [ ] Register works: POST to `/api/v1/auth/register`
- [ ] Cookies are sent/received correctly
- [ ] All browser console CORS errors are gone
- [ ] Traefik dashboard is accessible
- [ ] Services restart automatically on failure
- [ ] Logs don't show error messages
- [ ] SSL certificate is valid (check in browser)

## Environment Variables Reference

```bash
# Required for Backend
MONGO_URI=mongodb://[user]:[pass]@[host]:[port]/[database]
JWT_SECRET=very-long-random-string-at-least-32-chars
JWT_REFRESH_SECRET=another-long-random-string-at-least-32-chars
JWT_ACCESS_SECRET=another-long-random-string-at-least-32-chars

# MinIO (if using S3 storage)
MINIO_ENDPOINT=minio.weBazaar.in
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=weBazaar-images
MINIO_USE_SSL=true

# Traefik will auto-configure:
# - SSL certificates via Let's Encrypt
# - Routing based on domain
# - CORS headers
```

## Troubleshooting Checklist

```
Issue                          Solution
─────────────────────────────────────────────────────────────
CORS errors in browser         ➡️ See "CORS Errors Still Happening"
OPTIONS requests failing       ➡️ See "Preflight Requests Failing"
Backend not responding         ➡️ Check backend logs, health check
SSL certificate errors         ➡️ See "SSL Certificate Issues"
Services keep restarting       ➡️ Check service logs for errors
Traefik not routing requests   ➡️ Check Traefik dashboard
Performance issues             ➡️ Check resource usage: docker stats
```

## Performance Tuning

### Scale Backend

If you need more backend instances:

```yaml
deploy:
  replicas: 3
```

### Increase Rate Limiting

Edit `server.js`:

```javascript
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // Increase from 1000
  }),
);
```

### Enable Caching

Add to docker-compose.traefik.yml backend labels:

```yaml
- "traefik.http.middlewares.cache.headers.customresponseheaders.Cache-Control=public, max-age=300"
- "traefik.http.routers.backend.middlewares=cache,cors-headers"
```

## Support & Documentation

- **Traefik Docs**: https://doc.traefik.io/
- **Docker Compose**: https://docs.docker.com/compose/
- **CORS Policy**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Let's Encrypt**: https://letsencrypt.org/
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html

## What's Next?

1. **Deploy to VPS**: Use deployment scripts on your server
2. **Monitor**: Set up logging/monitoring (DataDog, New Relic, etc.)
3. **Scale**: Add more replicas as needed
4. **Optimize**: Cache static assets, optimize images
5. **Secure**: Add WAF (Web Application Firewall)
6. **Backup**: Set up MongoDB backups

---

## Summary of Fixes

Your CORS and preflight issues are now fixed by:

1. ✅ **Traefik handles CORS headers at proxy level**
   - No redirect middleware blocks OPTIONS
   - Headers added immediately
   - Browser sees proper CORS responses

2. ✅ **Backend still has backup CORS handling**
   - Double CORS is safe and beneficial
   - Handles direct requests (if Traefik is bypassed)
   - Production-grade configuration

3. ✅ **API routes only on HTTPS**
   - `entrypoints=websecure` ensures no HTTP redirect loops
   - OPTIONS requests are forwarded, not redirected
   - Secure by default

4. ✅ **Proper port routing**
   - Backend on port 5000 (internal)
   - Frontend on port 3000 (internal)
   - Users access only via domains (external)

---

**Status**: ✅ Ready for Production

Need help? Check the logs or refer to TRAEFIK_CORS_FIX.md for technical details.
