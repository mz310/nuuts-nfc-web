# Example Workflow — Complete Real-World Test Run

This document shows a complete, real example of testing an NFC tag from start to finish, including actual command outputs and expected results.

---

## Scenario

We have an NFC tag with UID: **1D:A7:86:2A:0D:10:80**

We want to:

1. Register a new user for this tag.
2. Credit 50 points from a scan.
3. Verify the leaderboard updates.

**Estimated time:** 5 minutes.

---

## Prerequisites

Backend running on `http://localhost:8000`
Frontend running on `http://localhost:5173`
Node.js installed
or cmd available

---

## Step-by-Step Example

### Step 1: Open three PowerShell windows

**Window 1 (Backend):**

```powershell
cd C:\Users\ajili\Desktop\AnkhaaDev\work\nuuts\nuuts-nfc-web\backend
npm run dev
```

Expected output:

```
> nfc-leaderboard-backend@1.0.0 dev
> node server.js

NFC Leaderboard API listening on http://127.0.0.1:8000
Frontend URL: http://localhost:5173
```

**Window 2 (Frontend):**

```powershell
cd C:\Users\ajili\Desktop\AnkhaaDev\work\nuuts\nuuts-nfc-web\frontend
npm run dev
```

Expected output:

```
  VITE v5.2.2  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Window 3 (Testing):**
Open a fresh PowerShell window for the test commands.

---

### Step 2: Normalize the UID

In **Window 3**, run:

```powershell
$raw = '1D:A7:86:2A:0D:10:80'
$uid = ($raw -replace '[:\s\-]','').ToUpper()
Write-Host "Raw UID: $raw"
Write-Host "Normalized UID: $uid"
```

Output:

```
Raw UID: 1D:A7:86:2A:0D:10:80
Normalized UID: 1DA7862A0D1080
```
 **Note:** From now on, use `1DA7862A0D1080` (the normalized version) for all API calls.

---

### Step 3: Check if UID is Already Registered

Run:

```powershell
$uid = '1DA7862A0D1080'
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/ndef-url?uid=$uid" -Method GET
$response | ConvertTo-Json
```

Output:

```json
{
  "status": "ok",
  "exists": false,
  "uid": "1DA7862A0D1080",
  "registerUrl": "http://localhost:8000/register?uid=1DA7862A0D1080"
}
```

**Analysis:** `"exists": false` means this UID is not yet registered. We need to register it in the next step.

---

### Step 4: Register the UID with a User

Run:

```powershell
$uid = '1DA7862A0D1080'
$body = @{
  uid = $uid
  name = 'Баасан'
  nickname = 'Baasan'
  profession = 'Naturalist'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/register' `
  -Method POST `
  -Body $body `
  -ContentType 'application/json'

$response | ConvertTo-Json
```

Output:

```json
{
  "success": true,
  "userId": 1,
  "uid": "1DA7862A0D1080",
  "message": "Бүртгэл амжилттай"
}
```
**Analysis:**

- `"success": true` → registration succeeded.
- `"userId": 1` → the user was assigned ID 1.
- This ID will be used in subsequent API calls.

---

### Step 5: Verify Registration (Re-check)

Run the ndef-url query again:

```powershell
$uid = '1DA7862A0D1080'
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/ndef-url?uid=$uid" -Method GET
$response | ConvertTo-Json
```

Output:

```json
{
  "status": "ok",
  "exists": true,
  "uid": "1DA7862A0D1080",
  "url": "http://localhost:8000/u/1"
}
```
 **Analysis:** Now `"exists": true` and we have a profile URL pointing to user ID 1.

---

### Step 6: Simulate a Scan (Credit Points)

Run:

```powershell
$uid = '1DA7862A0D1080'
$amount = 50

$body = @{
  uid = $uid
  amount = $amount
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/scan' `
  -Method POST `
  -Body $body `
  -ContentType 'application/json'

$response | ConvertTo-Json
```

Output:

```json
{
  "status": "ok",
  "uid": "1DA7862A0D1080",
  "linked": true,
  "amount": 50
}
```
**Analysis:**

- `"linked": true` → the UID is registered (so points can be credited).
- `"amount": 50` → 50 points were successfully added.

---

### Step 7: Simulate Another Scan (Accumulate Points)

Let's scan again with 25 more points:

```powershell
$uid = '1DA7862A0D1080'
$amount = 25

$body = @{
  uid = $uid
  amount = $amount
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/scan' `
  -Method POST `
  -Body $body `
  -ContentType 'application/json'

$response | ConvertTo-Json
```

Output:

```json
{
  "status": "ok",
  "uid": "1DA7862A0D1080",
  "linked": true,
  "amount": 25
}
```
**Analysis:** Another 25 points credited. User should now have 50 + 25 = 75 total.

---

### Step 8: Get User Profile (Verify Points)

Query the user profile directly:

```powershell
$userId = 1
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/user/$userId" -Method GET
$response | ConvertTo-Json
```

Output:

```json
{
  "id": 1,
  "name": "Баасан",
  "nickname": "Baasan",
  "profession": "Naturalist",
  "uid": "1DA7862A0D1080",
  "label": "Baasan",
  "total": 75
}
```

**Analysis:**

- `"total": 75` → correct! (50 + 25 = 75 points)
- Profile shows all registered details.

---

### Step 9: Get Full Leaderboard

Run:

```powershell
$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/leaderboard' -Method GET
$response.rows | ConvertTo-Json
```

Output (example with 2 users):

```json
[
  {
    "id": 1,
    "label": "Baasan",
    "total": 75
  },
  {
    "id": 2,
    "label": "Player 2",
    "total": 100
  }
]
```
**Analysis:** Baasan is ranked #2 on the leaderboard with 75 points.

---

### Step 10: View in Browser

Open the frontend leaderboard:

```powershell
Start-Process 'http://localhost:5173/'
```

Or manually open in your browser:

```
http://localhost:5173/
```

**Expected visual result:**

- Leaderboard table showing all users ranked by total points.
- "Baasan" (or your nickname) appears with 75 points.
- Click on the user to view the profile page.

---

### Step 11: View User Profile in Browser

Navigate to:

```
http://localhost:5173/u/1
```

**Expected visual result:**

- Name: "Баасан"
- Nickname: "Baasan"
- Profession: "Naturalist"
- UID: "1DA7862A0D1080"
- Total points: 75

---

## Complete PowerShell Script (Copy-Paste All At Once)

If you want to run the entire workflow in one go, use this script:

**Save as `test-workflow.ps1`:**

```powershell
# ===== NFC Testing Workflow =====
# This script performs a complete test from registration to leaderboard verification.

# Configuration
$backendUrl = 'http://localhost:8000'
$frontendUrl = 'http://localhost:5173'
$rawUid = '1D:A7:86:2A:0D:10:80'  # Change this to your actual UID

# Step 1: Normalize UID
Write-Host "=== Step 1: Normalize UID ===" -ForegroundColor Green
$uid = ($rawUid -replace '[:\s\-]','').ToUpper()
Write-Host "Raw UID: $rawUid"
Write-Host "Normalized UID: $uid`n"

# Step 2: Check if registered
Write-Host "=== Step 2: Check if UID is registered ===" -ForegroundColor Green
$checkResp = Invoke-RestMethod -Uri "$backendUrl/api/ndef-url?uid=$uid" -Method GET
Write-Host "Response:" ($checkResp | ConvertTo-Json)
$isRegistered = $checkResp.exists
Write-Host "Registered: $isRegistered`n"

# Step 3: Register if needed
if (-not $isRegistered) {
  Write-Host "=== Step 3: Register new user ===" -ForegroundColor Green
  $body = @{
    uid = $uid
    name = 'Баасан'
    nickname = 'Baasan'
    profession = 'Naturalist'
  } | ConvertTo-Json

  $regResp = Invoke-RestMethod -Uri "$backendUrl/api/register" `
    -Method POST `
    -Body $body `
    -ContentType 'application/json'

  Write-Host "Response:" ($regResp | ConvertTo-Json)
  $userId = $regResp.userId
  Write-Host "Registered with User ID: $userId`n"
} else {
  Write-Host "=== Step 3: User already registered, skipping ===" -ForegroundColor Yellow
  $userId = $checkResp.url -split '/' | Select-Object -Last 1
  Write-Host "User ID: $userId`n"
}

# Step 4: Simulate first scan
Write-Host "=== Step 4: Simulate first scan (50 points) ===" -ForegroundColor Green
$scan1 = @{ uid = $uid; amount = 50 } | ConvertTo-Json
$scanResp1 = Invoke-RestMethod -Uri "$backendUrl/api/scan" `
  -Method POST `
  -Body $scan1 `
  -ContentType 'application/json'

Write-Host "Response:" ($scanResp1 | ConvertTo-Json)
Write-Host ""

# Step 5: Simulate second scan
Write-Host "=== Step 5: Simulate second scan (25 points) ===" -ForegroundColor Green
$scan2 = @{ uid = $uid; amount = 25 } | ConvertTo-Json
$scanResp2 = Invoke-RestMethod -Uri "$backendUrl/api/scan" `
  -Method POST `
  -Body $scan2 `
  -ContentType 'application/json'

Write-Host "Response:" ($scanResp2 | ConvertTo-Json)
Write-Host ""

# Step 6: Get user profile
Write-Host "=== Step 6: Get user profile ===" -ForegroundColor Green
$userResp = Invoke-RestMethod -Uri "$backendUrl/api/user/$userId" -Method GET
Write-Host "Response:" ($userResp | ConvertTo-Json)
Write-Host ""

# Step 7: Get leaderboard
Write-Host "=== Step 7: Get full leaderboard ===" -ForegroundColor Green
$leaderResp = Invoke-RestMethod -Uri "$backendUrl/api/leaderboard" -Method GET
Write-Host "Top 5 users:"
$leaderResp.rows | Select-Object -First 5 | ConvertTo-Json | Write-Host
Write-Host ""

# Step 8: Open frontend in browser
Write-Host "=== Step 8: Opening frontend leaderboard ===" -ForegroundColor Green
Write-Host "Opening: $frontendUrl"
Start-Process $frontendUrl

Write-Host "`n=== Workflow Complete! ===" -ForegroundColor Cyan
Write-Host "Expected results:"
Write-Host "  - User 'Baasan' registered with UID $uid"
Write-Host "  - Total points: 75 (50 + 25)"
Write-Host "  - Visible on leaderboard at $frontendUrl"
```

**Run it:**

```powershell
cd C:\Users\ajili\Desktop\AnkhaaDev\work\nuuts\nuuts-nfc-web
.\test-workflow.ps1
```

---

## Expected Output Summary

| Action             | Status            | Details                               |
| ------------------ | ----------------- | ------------------------------------- |
| Normalize UID      | ✅ Success        | 1D:A7:86:2A:0D:10:80 → 1DA7862A0D1080 |
| Check registration | ✅ Not registered | `exists: false`                       |
| Register user      | ✅ Success        | User ID 1, name "Баасан"              |
| Scan 1 (50 pts)    | ✅ Success        | `linked: true, amount: 50`            |
| Scan 2 (25 pts)    | ✅ Success        | `linked: true, amount: 25`            |
| Get profile        | ✅ Success        | Total: 75 points                      |
| Leaderboard        | ✅ Success        | User visible, ranked by points        |
| Frontend           | ✅ Success        | Browser opens, shows leaderboard      |

---

## Common Variations

### Variant A: Different User Details

Change the registration step:

```powershell
$body = @{
  uid = $uid
  name = 'Наранзул'
  nickname = 'Naranzul'
  profession = 'Conservationist'
} | ConvertTo-Json
```

### Variant B: Different Point Amounts

Change scan amounts:

```powershell
# Large scan
$scan = @{ uid = $uid; amount = 200 } | ConvertTo-Json

# Small scan
$scan = @{ uid = $uid; amount = 10 } | ConvertTo-Json
```

### Variant C: Multiple Different UIDs

Register multiple tags:

```powershell
$tags = @(
  @{ uid = '1DA7862A0D1080'; name = 'Баасан'; points = 50 },
  @{ uid = '2EB8973B1E2191'; name = 'Наранзул'; points = 75 },
  @{ uid = '3FC9A84C2F32A2'; name = 'Сүхбаатар'; points = 100 }
)

foreach ($tag in $tags) {
  # Register
  # Scan with points
  # Verify
}
```

---

## Troubleshooting This Example

**Problem:** Backend returns error on register step.

```
Invoke-RestMethod : {"error":"..."}
```

**Solution:**

- Verify backend is running: check **Window 1** for "listening on http://127.0.0.1:8000"
- Check UID format: ensure it's all uppercase hex, no separators.

---

**Problem:** Frontend doesn't open or shows blank page.

```
Cannot GET /
```

**Solution:**

- Verify frontend is running: check **Window 2** for "Local: http://localhost:5173/"
- Wait 10 seconds after `npm run dev` before opening the URL.

---

**Problem:** Leaderboard shows 0 users or wrong total.

**Solution:**

- Verify each step's response shows `"success": true` or `"linked": true`.
- Check user ID is correct in the profile request.
- Clear browser cache: Ctrl+Shift+Delete → Clear all.

---

## Next Steps

Once you've completed this example:

1. **Test with your actual NFC tag:** Replace `$rawUid` with the real UID from your phone scan.
2. **Test with multiple tags:** Register and scan different UIDs.
3. **Test the web UI:** Use the registration form at `/register?uid=...` instead of the API.
4. **Write to tag:** Use NFC Tools to write the profile URL to the physical tag.

---

**Questions?** Refer back to the main `NFC_TESTING_TUTORIAL.md` or check the Troubleshooting section there.
