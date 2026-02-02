#!/bin/bash

# ============================================
# CORS & Preflight Fixes Verification Script
# ============================================
# Verifies that all required CORS and preflight fixes are in place

echo "🔍 Verifying CORS & Preflight Fixes..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checks_passed=0
checks_failed=0

# Check 1: Auth middleware has OPTIONS bypass
echo "Check 1: Auth middleware OPTIONS bypass..."
if grep -q 'if (req.method === "OPTIONS")' backend/middleware/auth.js; then
    echo -e "${GREEN}✅ PASS${NC}: OPTIONS bypass found in auth.js"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: OPTIONS bypass NOT found in auth.js"
    ((checks_failed++))
fi

# Check 2: Admin middleware has OPTIONS bypass
echo "Check 2: Admin middleware OPTIONS bypass..."
if grep -q 'if (req.method === "OPTIONS")' backend/middleware/admin.js; then
    echo -e "${GREEN}✅ PASS${NC}: OPTIONS bypass found in admin.js"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: OPTIONS bypass NOT found in admin.js"
    ((checks_failed++))
fi

# Check 3: Traefik backend uses port 5000
echo "Check 3: Traefik backend port configuration..."
if grep -q 'traefik.http.services.backend.loadbalancer.server.port=5000' docker-compose.traefik.yml; then
    echo -e "${GREEN}✅ PASS${NC}: Backend port 5000 configured in Traefik"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Backend port NOT configured as 5000"
    ((checks_failed++))
fi

# Check 4: Traefik backend uses websecure only
echo "Check 4: Traefik backend entrypoint (HTTPS only)..."
if grep -q 'traefik.http.routers.backend.entrypoints=websecure' docker-compose.traefik.yml; then
    echo -e "${GREEN}✅ PASS${NC}: Backend uses websecure (HTTPS) only"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Backend NOT using websecure entrypoint"
    ((checks_failed++))
fi

# Check 5: CORS middleware attached to backend
echo "Check 5: Traefik CORS middleware attachment..."
if grep -q 'traefik.http.routers.backend.middlewares=cors-headers' docker-compose.traefik.yml; then
    echo -e "${GREEN}✅ PASS${NC}: CORS middleware attached to backend router"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: CORS middleware NOT attached"
    ((checks_failed++))
fi

# Check 6: CORS headers middleware defined
echo "Check 6: Traefik CORS headers middleware definition..."
if grep -q 'traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist' docker-compose.traefik.yml; then
    echo -e "${GREEN}✅ PASS${NC}: CORS headers middleware is defined"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: CORS headers middleware NOT defined"
    ((checks_failed++))
fi

# Check 7: Express CORS middleware exists
echo "Check 7: Express CORS middleware..."
if grep -q 'cors(' backend/server.js; then
    echo -e "${GREEN}✅ PASS${NC}: CORS middleware configured in server.js"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: CORS middleware NOT found in server.js"
    ((checks_failed++))
fi

# Check 8: Backend not using app.options (avoid modern Express issues)
echo "Check 8: No conflicting app.options call..."
if ! grep -q 'app.options' backend/server.js; then
    echo -e "${GREEN}✅ PASS${NC}: No problematic app.options found"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: app.options found (might not be needed)"
    ((checks_failed++))
fi

# Check 9: Backend listening on port 5000
echo "Check 9: Backend port 5000..."
if grep -q 'PORT.*5000' backend/server.js; then
    echo -e "${GREEN}✅ PASS${NC}: Backend defaults to port 5000"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: Backend port configuration unclear"
    ((checks_failed++))
fi

# Check 10: Traefik config exists
echo "Check 10: Traefik configuration file..."
if [ -f "docker-compose.traefik.yml" ]; then
    echo -e "${GREEN}✅ PASS${NC}: docker-compose.traefik.yml exists"
    ((checks_passed++))
else
    echo -e "${RED}❌ FAIL${NC}: docker-compose.traefik.yml NOT found"
    ((checks_failed++))
fi

echo ""
echo "=============================================="
echo "Summary:"
echo "  Checks Passed: ${GREEN}$checks_passed${NC}"
echo "  Checks Failed: ${RED}$checks_failed${NC}"
echo "=============================================="

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! CORS fixes are in place.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the fixes.${NC}"
    exit 1
fi
