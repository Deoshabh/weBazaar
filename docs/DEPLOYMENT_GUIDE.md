# Dokploy Deployment Guide for weBazaar.in

# Complete setup instructions for your VPS

## 1. SUBDOMAIN SETUP (Recommended Architecture)

### DNS Configuration:

Add these records in your domain registrar (weBazaar.in):

```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         300
A       www     YOUR_VPS_IP         300
A       api     YOUR_VPS_IP         300
CNAME   minio   api.weBazaar.in        300
```

## 2. DOKPLOY PROJECT STRUCTURE

### Create 3 Services in Dokploy:

#### Service 1: Backend API

- **Name**: weBazaar-backend
- **Type**: Docker
- **Domain**: api.weBazaar.in
- **Port**: 5000
- **Environment Variables**: Copy from backend/.env.production

#### Service 2: Frontend

- **Name**: weBazaar-frontend
- **Type**: Docker/Next.js
- **Domain**: weBazaar.in (and www.weBazaar.in)
- **Port**: 3000
- **Environment Variables**: Copy from frontend/.env.production
- **Build Command**: npm run build
- **Start Command**: npm start

#### Service 3: MinIO (Optional - if not using shared MinIO)

- **Name**: weBazaar-minio
- **Type**: Docker Compose
- **File**: docker-compose.minio.yml
- **Access**: Internal only (localhost) or minio.weBazaar.in for admin

## 3. MONGODB SETUP

### Option A: MongoDB on VPS (Local)

```bash
# Install MongoDB
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database
mongosh
use weBazaar_production
db.createUser({
  user: "weBazaar_admin",
  pwd: "SECURE_PASSWORD",
  roles: ["readWrite"]
})
```

Update backend .env:

```
MONGO_URI=mongodb://weBazaar_admin:SECURE_PASSWORD@localhost:27017/weBazaar_production
```

### Option B: MongoDB Atlas (Recommended)

1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Update MONGO_URI in backend .env

## 4. MINIO SETUP

### If using Docker Compose:

```bash
# In Dokploy, add Docker Compose service
docker-compose -f docker-compose.minio.yml up -d

# Access MinIO Console
http://YOUR_VPS_IP:9001
Username: minioadmin
Password: minioadmin
```

## 5. NGINX REVERSE PROXY (If not using Dokploy's built-in proxy)

```nginx
# /etc/nginx/sites-available/weBazaar.in

# Frontend
server {
    listen 80;
    server_name weBazaar.in www.weBazaar.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.weBazaar.in;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. SSL CERTIFICATES (HTTPS)

### If Dokploy has built-in SSL:

Just enable it in the dashboard for each service.

### If manual setup needed:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates
sudo certbot --nginx -d weBazaar.in -d www.weBazaar.in
sudo certbot --nginx -d api.weBazaar.in

# Auto-renewal is configured automatically
```

## 7. SECURITY CHECKLIST

- [ ] Change all default passwords (MongoDB, MinIO)
- [ ] Generate secure JWT secrets (32+ chars)
- [ ] Use production Razorpay keys (not test keys)
- [ ] Enable firewall (ufw)
- [ ] Set up MongoDB authentication
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up backup strategy for MongoDB
- [ ] Monitor logs and errors
- [ ] Set up health checks

## 8. DEPLOYMENT STEPS IN DOKPLOY

1. **Connect GitHub Repository**
   - Link your GitHub account
   - Select Deoshabh/weBazaar-2026 repository
   - Set branch to `main`

2. **Create Backend Service**
   - Click "New Service" → "Docker"
   - Name: weBazaar-backend
   - Root Directory: /backend
   - Dockerfile: (auto-detect or specify)
   - Domain: api.weBazaar.in
   - Port: 5000
   - Add all environment variables from .env.production
   - Enable "Auto Deploy" on git push

3. **Create Frontend Service**
   - Click "New Service" → "Next.js" or "Docker"
   - Name: weBazaar-frontend
   - Root Directory: /frontend
   - Domain: weBazaar.in
   - Add www.weBazaar.in as alias
   - Port: 3000
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add environment variables from .env.production
   - Enable "Auto Deploy"

4. **Deploy**
   - Click "Deploy" on each service
   - Monitor build logs
   - Wait for services to be healthy

## 9. POST-DEPLOYMENT

### Test your deployment:

```bash
# Check if services are running
curl https://api.weBazaar.in/health
curl https://weBazaar.in

# Test backend API
curl https://api.weBazaar.in/api/v1/products

# Monitor logs
dokploy logs weBazaar-backend
dokploy logs weBazaar-frontend
```

### Create admin user:

```bash
# SSH into your VPS
ssh user@YOUR_VPS_IP

# Access backend container
docker exec -it weBazaar-backend sh

# Run admin creation script
node utils/makeAdmin.js your-email@example.com
```

## 10. MONITORING & MAINTENANCE

### Set up monitoring:

- Enable Dokploy health checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure log aggregation
- Set up backup automation for MongoDB

### Regular maintenance:

```bash
# Update containers
dokploy update weBazaar-backend
dokploy update weBazaar-frontend

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/weBazaar_production" --out=/backups/$(date +%Y%m%d)

# Clean Docker
docker system prune -a
```

## QUICK REFERENCE

**Frontend**: https://weBazaar.in
**Backend API**: https://api.weBazaar.in
**Admin Panel**: https://weBazaar.in/admin
**MinIO Console**: http://YOUR_VPS_IP:9001 (internal only)

**Support**:

- Dokploy Docs: https://docs.dokploy.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Next.js Deploy: https://nextjs.org/docs/deployment
