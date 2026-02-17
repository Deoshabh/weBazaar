#!/bin/bash

# ============================================
# Traefik CORS Fix - Deployment Script
# ============================================
# This script sets up your entire stack with Traefik

set -e

echo "🚀 Starting weBazaar Stack with Traefik..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.traefik.example to .env and fill in the values:"
    echo "  cp .env.traefik.example .env"
    exit 1
fi

echo "✅ .env file found"

# Create letsencrypt directory if it doesn't exist
mkdir -p letsencrypt
chmod 600 letsencrypt

echo "✅ Directories ready"

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.traefik.yml pull

# Build custom images (backend and frontend)
echo "🔨 Building custom images..."
docker-compose -f docker-compose.traefik.yml build

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.traefik.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
echo "=================="
docker-compose -f docker-compose.traefik.yml ps

echo ""
echo "✅ Stack is running!"
echo ""
echo "📍 Access Points:"
echo "================="
echo "🌐 Frontend:        https://weBazaar.in"
echo "🌐 Frontend (www):  https://www.weBazaar.in"
echo "🔌 Backend API:     https://api.weBazaar.in"
echo "📊 Traefik:         http://localhost:8080 (Dashboard)"
echo ""
echo "🔗 Test CORS:"
echo "============"
echo "curl -X OPTIONS https://api.weBazaar.in/api/v1/auth/login \\"
echo "  -H 'Origin: https://weBazaar.in' \\"
echo "  -H 'Access-Control-Request-Method: POST' \\"
echo "  -v"
echo ""
echo "📝 Logs:"
echo "======="
echo "docker-compose -f docker-compose.traefik.yml logs -f [service]"
echo ""
echo "⛔ Stop:"
echo "======="
echo "docker-compose -f docker-compose.traefik.yml down"
echo ""
