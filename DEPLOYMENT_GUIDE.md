# Dokploy Deployment Guide for radeo.in

# Complete setup instructions for your VPS

## 1. SUBDOMAIN SETUP (Recommended Architecture)

### DNS Configuration:

Add these records in your domain registrar (radeo.in):

```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         300
A       www     YOUR_VPS_IP         300
A       api     YOUR_VPS_IP         300
CNAME   minio   api.radeo.in        300
```

## 2. DOKPLOY PROJECT STRUCTURE

### Create 3 Services in Dokploy:

#### Service 1: Backend API

- **Name**: radeo-backend
- **Type**: Docker
- **Domain**: api.radeo.in
- **Port**: 5000
- **Environment Variables**: Copy from backend/.env.production

#### Service 2: Frontend

- **Name**: radeo-frontend
- **Type**: Docker/Next.js
- **Domain**: radeo.in (and www.radeo.in)
- **Port**: 3000
- **Environment Variables**: Copy from frontend/.env.production
- **Build Command**: npm run build
- **Start Command**: npm start

#### Service 3: MinIO (Optional - if not using shared MinIO)

- **Name**: radeo-minio
- **Type**: Docker Compose
- **File**: docker-compose.minio.yml
- **Access**: Internal only (localhost) or minio.radeo.in for admin

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
use radeo_production
db.createUser({
  user: "radeo_admin",
  pwd: "SECURE_PASSWORD",
  roles: ["readWrite"]
})
```

Update backend .env:

```
MONGO_URI=mongodb://radeo_admin:SECURE_PASSWORD@localhost:27017/radeo_production
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
# /etc/nginx/sites-available/radeo.in

# Frontend
server {
    listen 80;
    server_name radeo.in www.radeo.in;

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
    server_name api.radeo.in;

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
sudo certbot --nginx -d radeo.in -d www.radeo.in
sudo certbot --nginx -d api.radeo.in

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
   - Select Deoshabh/Radeo-2026 repository
   - Set branch to `main`

2. **Create Backend Service**
   - Click "New Service" → "Docker"
   - Name: radeo-backend
   - Root Directory: /backend
   - Dockerfile: (auto-detect or specify)
   - Domain: api.radeo.in
   - Port: 5000
   - Add all environment variables from .env.production
   - Enable "Auto Deploy" on git push

3. **Create Frontend Service**
   - Click "New Service" → "Next.js" or "Docker"
   - Name: radeo-frontend
   - Root Directory: /frontend
   - Domain: radeo.in
   - Add www.radeo.in as alias
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
curl https://api.radeo.in/health
curl https://radeo.in

# Test backend API
curl https://api.radeo.in/api/v1/products

# Monitor logs
dokploy logs radeo-backend
dokploy logs radeo-frontend
```

### Create admin user:

```bash
# SSH into your VPS
ssh user@YOUR_VPS_IP

# Access backend container
docker exec -it radeo-backend sh

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
dokploy update radeo-backend
dokploy update radeo-frontend

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/radeo_production" --out=/backups/$(date +%Y%m%d)

# Clean Docker
docker system prune -a
```

## QUICK REFERENCE

**Frontend**: https://radeo.in
**Backend API**: https://api.radeo.in
**Admin Panel**: https://radeo.in/admin
**MinIO Console**: http://YOUR_VPS_IP:9001 (internal only)

**Support**:

- Dokploy Docs: https://docs.dokploy.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Next.js Deploy: https://nextjs.org/docs/deployment
