@echo off
REM ============================================
REM CORS & Preflight Fixes Verification Script (Windows)
REM ============================================
REM Verifies that all required CORS and preflight fixes are in place

setlocal enabledelayedexpansion

echo 🔍 Verifying CORS and Preflight Fixes...
echo.

set /a checks_passed=0
set /a checks_failed=0

REM Check 1: Auth middleware has OPTIONS bypass
echo Check 1: Auth middleware OPTIONS bypass...
findstr /M "if (req.method === \"OPTIONS\")" backend\middleware\auth.js >nul
if errorlevel 1 (
    echo ❌ FAIL: OPTIONS bypass NOT found in auth.js
    set /a checks_failed+=1
) else (
    echo ✅ PASS: OPTIONS bypass found in auth.js
    set /a checks_passed+=1
)

REM Check 2: Admin middleware has OPTIONS bypass
echo Check 2: Admin middleware OPTIONS bypass...
findstr /M "if (req.method === \"OPTIONS\")" backend\middleware\admin.js >nul
if errorlevel 1 (
    echo ❌ FAIL: OPTIONS bypass NOT found in admin.js
    set /a checks_failed+=1
) else (
    echo ✅ PASS: OPTIONS bypass found in admin.js
    set /a checks_passed+=1
)

REM Check 3: Traefik backend uses port 5000
echo Check 3: Traefik backend port configuration...
findstr /M "traefik.http.services.backend.loadbalancer.server.port=5000" docker-compose.traefik.yml >nul
if errorlevel 1 (
    echo ❌ FAIL: Backend port NOT configured as 5000
    set /a checks_failed+=1
) else (
    echo ✅ PASS: Backend port 5000 configured in Traefik
    set /a checks_passed+=1
)

REM Check 4: Traefik backend uses websecure only
echo Check 4: Traefik backend entrypoint ^(HTTPS only^)...
findstr /M "traefik.http.routers.backend.entrypoints=websecure" docker-compose.traefik.yml >nul
if errorlevel 1 (
    echo ❌ FAIL: Backend NOT using websecure entrypoint
    set /a checks_failed+=1
) else (
    echo ✅ PASS: Backend uses websecure ^(HTTPS^) only
    set /a checks_passed+=1
)

REM Check 5: CORS middleware attached to backend
echo Check 5: Traefik CORS middleware attachment...
findstr /M "traefik.http.routers.backend.middlewares=cors-headers" docker-compose.traefik.yml >nul
if errorlevel 1 (
    echo ❌ FAIL: CORS middleware NOT attached
    set /a checks_failed+=1
) else (
    echo ✅ PASS: CORS middleware attached to backend router
    set /a checks_passed+=1
)

REM Check 6: CORS headers middleware defined
echo Check 6: Traefik CORS headers middleware definition...
findstr /M "traefik.http.middlewares.cors-headers.headers.accesscontrolalloworiginlist" docker-compose.traefik.yml >nul
if errorlevel 1 (
    echo ❌ FAIL: CORS headers middleware NOT defined
    set /a checks_failed+=1
) else (
    echo ✅ PASS: CORS headers middleware is defined
    set /a checks_passed+=1
)

REM Check 7: Express CORS middleware exists
echo Check 7: Express CORS middleware...
findstr /M "cors(" backend\server.js >nul
if errorlevel 1 (
    echo ❌ FAIL: CORS middleware NOT found in server.js
    set /a checks_failed+=1
) else (
    echo ✅ PASS: CORS middleware configured in server.js
    set /a checks_passed+=1
)

REM Check 8: Backend not using app.options
echo Check 8: No conflicting app.options call...
findstr /M "app.options" backend\server.js >nul
if errorlevel 1 (
    echo ✅ PASS: No problematic app.options found
    set /a checks_passed+=1
) else (
    echo ⚠️  WARNING: app.options found ^(might not be needed^)
    set /a checks_failed+=1
)

REM Check 9: Backend listening on port 5000
echo Check 9: Backend port 5000...
findstr /M "5000" backend\server.js >nul
if errorlevel 1 (
    echo ❌ FAIL: Backend port configuration unclear
    set /a checks_failed+=1
) else (
    echo ✅ PASS: Backend port configuration includes 5000
    set /a checks_passed+=1
)

REM Check 10: Traefik config exists
echo Check 10: Traefik configuration file...
if exist docker-compose.traefik.yml (
    echo ✅ PASS: docker-compose.traefik.yml exists
    set /a checks_passed+=1
) else (
    echo ❌ FAIL: docker-compose.traefik.yml NOT found
    set /a checks_failed+=1
)

echo.
echo ==============================================
echo Summary:
echo   Checks Passed: %checks_passed%
echo   Checks Failed: %checks_failed%
echo ==============================================

if %checks_failed% equ 0 (
    echo.
    echo ✅ All checks passed! CORS fixes are in place.
    pause
    exit /b 0
) else (
    echo.
    echo ❌ Some checks failed. Please review the fixes.
    pause
    exit /b 1
)
