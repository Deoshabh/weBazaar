# ===============================
# Test Shiprocket Webhook Endpoint
# ===============================

Write-Host "🧪 Testing Shiprocket Webhook Implementation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "https://api.weBazaar.in"
$webhookToken = "48f6cc854c7a94beb4ea1144ca8242ba7e78a0f5a07127364250cade5083f7a2"

# Test 1: AWB Generated
Write-Host "Test 1: AWB Generated Event" -ForegroundColor Yellow
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key"    = $webhookToken
}
$body = @{
    awb             = "SHIP123456789"
    awb_code        = "SHIP123456789"
    sr_order_id     = 12345
    order_id        = 12345
    current_status  = "AWB GENERATED"
    shipment_status = "AWB GENERATED"
    timestamp       = (Get-Date).ToString("o")
    location        = "Mumbai Sorting Center"
    activities      = "AWB assigned to shipment"
    scan_type       = "AWB_ASSIGNED"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/webhooks/shiprocket" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Error Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: In Transit
Write-Host "Test 2: In Transit Event" -ForegroundColor Yellow
$body = @{
    awb            = "SHIP123456789"
    current_status = "IN TRANSIT"
    timestamp      = (Get-Date).AddHours(2).ToString("o")
    location       = "Delhi Hub"
    activities     = "Package arrived at Delhi sorting facility"
    scan_type      = "IN_TRANSIT"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/webhooks/shiprocket" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Out for Delivery
Write-Host "Test 3: Out for Delivery Event" -ForegroundColor Yellow
$body = @{
    awb            = "SHIP123456789"
    current_status = "OUT FOR DELIVERY"
    timestamp      = (Get-Date).AddHours(24).ToString("o")
    location       = "New Delhi - Local Facility"
    activities     = "Package out for delivery"
    scan_type      = "OUT_FOR_DELIVERY"
    edd            = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/webhooks/shiprocket" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Delivered
Write-Host "Test 4: Delivered Event" -ForegroundColor Yellow
$body = @{
    awb            = "SHIP123456789"
    current_status = "DELIVERED"
    timestamp      = (Get-Date).AddHours(26).ToString("o")
    location       = "Customer Address"
    activities     = "Package delivered successfully"
    scan_type      = "DELIVERED"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/webhooks/shiprocket" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Duplicate Event (should return already processed)
Write-Host "Test 5: Duplicate Event (Idempotency Test)" -ForegroundColor Yellow
$body = @{
    awb            = "SHIP123456789"
    current_status = "DELIVERED"
    timestamp      = (Get-Date).AddHours(26).ToString("o")
    location       = "Customer Address"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/webhooks/shiprocket" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.Content -like "*already processed*") {
        Write-Host "✅ Idempotency working correctly!" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🏁 Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check backend logs for webhook processing" -ForegroundColor White
Write-Host "2. Check MongoDB WebhookLog collection" -ForegroundColor White
Write-Host "3. Verify orders updated with tracking data" -ForegroundColor White
Write-Host "4. Test real-time updates in frontend" -ForegroundColor White
