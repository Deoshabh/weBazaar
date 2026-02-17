# Traefik Configuration - Complete Details

This document provides the exact Traefik configuration for fixing CORS and preflight issues.

## Option 1: Using docker-compose.traefik.yml (RECOMMENDED)

Use the `docker-compose.traefik.yml` file directly:

```bash
docker-compose -f docker-compose.traefik.yml up -d
```

This automatically configures:

- ✅ Traefik with CORS middleware
- ✅ Backend routing to port 5000
- ✅ Frontend routing to port 3000
- ✅ HTTPS with Let's Encrypt
- ✅ Health checks
- ✅ All middleware

---

## Option 2: Manual Traefik Configuration (if not using docker-compose)

### For Dokploy or Other Orchestration

**Backend Service Labels:**

```yaml
# Route configuration
traefik.enable=true
traefik.http.routers.backend.rule=Host(`api.weBazaar.in`)
traefik.http.routers.backend.entrypoints=websecure
traefik.http.routers.backend.tls=true
traefik.http.routers.backend.tls.certresolver=letsencrypt
traefik.http.routers.backend.middlewares=cors-headers
traefik.http.services.backend.loadbalancer.server.port=5000

# CORS Middleware
traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist=https://weBazaar.in,https://www.weBazaar.in
traefik.http.middlewares.cors-headers.headers.accesscontrolallowmethods=GET, POST, PUT, PATCH, DELETE, OPTIONS
traefik.http.middlewares.cors-headers.headers.accesscontrolallowheaders=Authorization, Content-Type, X-Requested-With
traefik.http.middlewares.cors-headers.headers.accesscontrolallowcredentials=true
traefik.http.middlewares.cors-headers.headers.accesscontrolmaxage=3600
```

### For Nginx (Alternative)

Use the `nginx.conf` file provided in the project root.

Key sections:

```nginx
# OPTIONS preflight handling
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'https://weBazaar.in' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    return 204;
}

# Regular request handling
add_header 'Access-Control-Allow-Origin' 'https://weBazaar.in' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# Proxy to backend
location / {
    proxy_pass http://localhost:5000;
    # ... proxy settings
}
```

---

## Key Configuration Points

### 1. Entrypoint Configuration

```yaml
# ✅ CORRECT - Only websecure (HTTPS)
traefik.http.routers.backend.entrypoints=websecure

# ❌ WRONG - HTTP would redirect, breaking preflight
traefik.http.routers.backend.entrypoints=web,websecure
```

### 2. CORS Headers Middleware

```yaml
# Allow specific origins (not *)
accesscontrolalloworiginlist=https://weBazaar.in,https://www.weBazaar.in

# Include OPTIONS in allowed methods
accesscontrolallowmethods=GET, POST, PUT, PATCH, DELETE, OPTIONS

# Allow credentials (cookies, auth headers)
accesscontrolallowcredentials=true

# Cache preflight for performance
accesscontrolmaxage=3600
```

### 3. Backend Service Port

```yaml
# ✅ CORRECT - Port 5000 (your Node.js port)
traefik.http.services.backend.loadbalancer.server.port=5000

# ❌ WRONG - Port 3000 (that's frontend)
traefik.http.services.backend.loadbalancer.server.port=3000
```

### 4. Middleware Attachment

```yaml
# ✅ CORRECT - Attach CORS middleware to backend route
traefik.http.routers.backend.middlewares=cors-headers

# ❌ WRONG - No middleware attached, CORS doesn't work
traefik.http.routers.backend.middlewares=
```

---

## Verification Steps

### 1. Traefik Recognizes Configuration

```bash
# Check Traefik dashboard
http://localhost:8080

# Should show:
# - Route: backend (api.weBazaar.in)
# - Middleware: cors-headers
# - Status: green (working)
```

### 2. CORS Headers Present in Response

```bash
curl -X OPTIONS https://api.weBazaar.in/api/v1/auth/login \
  -H 'Origin: https://weBazaar.in' \
  -H 'Access-Control-Request-Method: POST' \
  -v

# Response headers should include:
# access-control-allow-origin: https://weBazaar.in
# access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
# access-control-allow-credentials: true
# HTTP/2 204 (or 200)
```

### 3. Backend Service is Healthy

```bash
docker-compose -f docker-compose.traefik.yml ps

# Should show:
# weBazaar-backend  | healthy
# weBazaar-frontend | healthy
# traefik        | healthy
```

### 4. No Redirects on OPTIONS

```bash
curl -X OPTIONS https://api.weBazaar.in/api/v1/auth/login \
  -H 'Origin: https://weBazaar.in' \
  -L -v 2>&1 | grep "< HTTP"

# Should show:
# < HTTP/2 204
# NOT:
# < HTTP/2 301
# < HTTP/2 302
```

---

## Common Issues & Fixes

### Issue: CORS headers not appearing

**Check:**

1. Is middleware defined? `traefik.http.middlewares.cors-headers.*`
2. Is middleware attached? `traefik.http.routers.backend.middlewares=cors-headers`
3. Is Traefik restarted? `docker restart traefik`

### Issue: OPTIONS returns 301/302 redirect

**Check:**

1. Are you using `entrypoints=web,websecure`? (WRONG - should be `websecure` only)
2. Is there global HTTP-to-HTTPS redirect? (Should be separate from backend router)
3. Is redirect middleware interfering? (Remove from backend router)

### Issue: Backend service not responding

**Check:**

1. Is port 5000 correct? (Check your Node.js app)
2. Is backend service running? `docker ps`
3. Can you reach it directly? `curl http://localhost:5000/health`
4. Are environment variables set? (DB connection, etc.)

### Issue: SSL certificate errors

**Check:**

1. Is Let's Encrypt resolver configured in Traefik?
2. Do DNS records point to your server?
3. Is port 80 open for ACME challenge?
4. Wait a few minutes for certificate generation

---

## Docker-Compose Labels Reference

Complete reference of all labels used:

```yaml
labels:
  # Enable Traefik for this container
  - "traefik.enable=true"

  # Router configuration
  - "traefik.http.routers.backend.rule=Host(`api.weBazaar.in`)"
  - "traefik.http.routers.backend.entrypoints=websecure"
  - "traefik.http.routers.backend.middlewares=cors-headers"
  - "traefik.http.routers.backend.tls=true"
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  # Service configuration
  - "traefik.http.services.backend.loadbalancer.server.port=5000"

  # Middleware: CORS Headers
  - "traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist=https://weBazaar.in,https://www.weBazaar.in"
  - "traefik.http.middlewares.cors-headers.headers.accesscontrolallowmethods=GET, POST, PUT, PATCH, DELETE, OPTIONS"
  - "traefik.http.middlewares.cors-headers.headers.accesscontrolallowheaders=Authorization, Content-Type, X-Requested-With"
  - "traefik.http.middlewares.cors-headers.headers.accesscontrolallowcredentials=true"
  - "traefik.http.middlewares.cors-headers.headers.accesscontrolmaxage=3600"
```

---

## Environment Variables

The `docker-compose.traefik.yml` uses these environment variables:

```bash
# MongoDB
MONGO_URI=mongodb://user:pass@host:27017/database

# JWT Secrets (use strong random strings)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_SECRET=your-access-secret-here

# MinIO (if using S3 storage)
MINIO_ENDPOINT=minio.weBazaar.in
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=weBazaar-images
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Copy `.env.traefik.example` to `.env`
- [ ] Fill in all environment variables
- [ ] Ensure DNS records point to your server
- [ ] Open ports 80 and 443 in firewall
- [ ] Create `letsencrypt` directory: `mkdir letsencrypt && chmod 600 letsencrypt`
- [ ] Test locally first (if possible)
- [ ] Verify Traefik labels on all services
- [ ] Check backend service uses port 5000
- [ ] Verify CORS middleware is attached
- [ ] Test CORS with curl commands
- [ ] Monitor logs for errors
- [ ] Test login/register from frontend
- [ ] Verify no console errors in browser
- [ ] Check SSL certificate validity
- [ ] Monitor services for 24 hours post-deployment

---

## References

- [Traefik Documentation](https://doc.traefik.io/)
- [Traefik Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Traefik Middleware Overview](https://doc.traefik.io/traefik/middlewares/overview/)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Docker Labels](https://docs.docker.com/engine/reference/labels-resource-limits/)

---

**This is the complete technical reference for Traefik CORS configuration.**

For quick start, see: TRAEFIK_QUICK_REFERENCE.md
For full guide, see: TRAEFIK_SETUP.md
