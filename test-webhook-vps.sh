#!/bin/bash
# ===============================
# Test Shiprocket Webhook from VPS
# ===============================

echo "🧪 Testing Shiprocket Webhook Endpoint"
echo "======================================="
echo ""

# Configuration
BASE_URL="https://api.weBazaar.in"
WEBHOOK_TOKEN="48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2"

# Test 1: Without token (should fail with 403)
echo "Test 1: Without x-api-key header (should fail)"
curl -X POST $BASE_URL/api/webhooks/shiprocket \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# Test 2: With valid token (should succeed)
echo "Test 2: With valid x-api-key header (should succeed)"
curl -X POST $BASE_URL/api/webhooks/shiprocket \
  -H "Content-Type: application/json" \
  -H "x-api-key: $WEBHOOK_TOKEN" \
  -d '{
    "awb": "TEST123",
    "current_status": "IN TRANSIT",
    "sr_order_id": 12345,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# Test 3: Full shipment tracking event
echo "Test 3: Full tracking event"
curl -X POST $BASE_URL/api/webhooks/shiprocket \
  -H "Content-Type: application/json" \
  -H "x-api-key: $WEBHOOK_TOKEN" \
  -d '{
    "awb": "SHIP123456789",
    "awb_code": "SHIP123456789",
    "sr_order_id": 12345,
    "current_status": "PICKED UP",
    "shipment_status": "PICKED UP",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "location": "Mumbai Hub",
    "activities": "Package picked up from origin",
    "scan_type": "PICKED_UP"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

echo "======================================="
echo "✅ Test Complete!"
echo ""
echo "Expected Results:"
echo "- Test 1: HTTP 403 (IP check blocks it)"
echo "- Test 2: HTTP 200 (token bypasses IP check)"
echo "- Test 3: HTTP 200 (full event processed)"
