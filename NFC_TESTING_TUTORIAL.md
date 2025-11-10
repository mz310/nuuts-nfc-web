
## Full Workflow Example (Copy-Paste)

Here's a complete example you can follow line-by-line:

```powershell
# 1. Start backend (run in a new PowerShell window)
cd C:\Users\ajili\Desktop\AnkhaaDev\work\nuuts\nuuts-nfc-web\backend
npm run dev

# 2. Start frontend (run in another new PowerShell window)
cd C:\Users\ajili\Desktop\AnkhaaDev\work\nuuts\nuuts-nfc-web\frontend
npm run dev

# 3. In a third PowerShell window, read tag and normalize
$raw = '1D:A7:86:2A:0D:10:80'  # Replace with your actual UID
$uid = ($raw -replace '[:\s\-]','').ToUpper()
Write-Host "Normalized UID: $uid"

# 4. Check if registered
Invoke-RestMethod -Uri "http://localhost:8000/api/ndef-url?uid=$uid" -Method GET

# 5. If not registered, register via API
$body = @{
  uid = $uid
  name = 'Test User'
  nickname = 'TestUser'
  profession = 'Volunteer'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:8000/api/register' `
  -Method POST `
  -Body $body `
  -ContentType 'application/json'

# 6. Simulate a scan
$scan = @{ uid = $uid; amount = 50 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/scan' `
  -Method POST `
  -Body $scan `
  -ContentType 'application/json'

# 7. Verify leaderboard
Invoke-RestMethod -Uri 'http://localhost:8000/api/leaderboard' -Method GET

# 8. Open leaderboard in browser
Start-Process 'http://localhost:5173/'
```

---

## Summary

| Step                    | Tool                  | Command                                    | Checks                     |
| ----------------------- | --------------------- | ------------------------------------------ | -------------------------- |
| 1. Read UID             | Phone app (NFC Tools) | Tap tag                                    | UID displayed              |
| 2. Normalize            | PowerShell            | `($raw -replace '[:\s\-]','').ToUpper()`   | Canonical format           |
| 3. Check registration   | CLI or curl           | `node test-nfc.js --uid "..."`             | `exists: true/false`       |
| 4. Register (if needed) | Web UI or API         | `Invoke-RestMethod POST /api/register`     | `success: true`            |
| 5. Simulate scan        | CLI or curl           | `node test-nfc.js --uid "..." --amount 50` | `linked: true, amount: 50` |
| 6. Verify               | Browser or API        | http://localhost:5173/                     | User on leaderboard        |

---

## Quick Reference

**Test CLI usage:**

```bash
node tools/test-nfc.js --help
node tools/test-nfc.js --uid "1D:A7:86:2A:0D:10:80"
node tools/test-nfc.js --uid "1D:A7:86:2A:0D:10:80" --amount 50
node tools/test-nfc.js --uid "1D:A7:86:2A:0D:10:80" --amount 25 --host http://localhost:8000
```

**Common endpoints:**

- GET /api/ndef-url?uid=... → Check if UID is registered
- POST /api/register → Register new user with UID
- POST /api/scan → Simulate scan (credit points)
- GET /api/leaderboard → View all users and totals
- GET /api/user/:id → View user profile

---

**Done!** You now have a complete NFC testing workflow. If you hit issues, refer to the Troubleshooting section or paste the error output and I can help debug.
