# Test de l'endpoint login avec PowerShell
$body = @{
    email = "admin@auditiq.fr"
    password = "Admin123!"
} | ConvertTo-Json

Write-Host "Sending POST request to http://localhost:8000/api/auth/login"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "✅ Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host " Error! Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody"
}
