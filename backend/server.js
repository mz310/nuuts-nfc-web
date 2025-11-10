// server.js — Express server entry point

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { PORT, SESSION_SECRET, FRONTEND_URL } = require("./config");
const { postScan, getLastScanApi, getNdefUrl } = require("./routes/api");
const {
  getLeaderboard,
  getUserProfile,
  checkRegister,
  postRegister,
  getResolveUID
} = require("./routes/public");
const {
  requireAdmin,
  postLogin,
  postLogout,
  getAdmin,
  postQuickAddTx,
  postQuickRegisterLink,
  postDeleteUser
} = require("./routes/admin");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Public API routes
app.get("/api/leaderboard", getLeaderboard);
app.get("/api/user/:id", getUserProfile);
app.get("/api/register/check", checkRegister);
app.post("/api/register", postRegister);
app.get("/api/resolve/:uid", getResolveUID);

// ESP32 / Gateway API routes
app.post("/api/scan", postScan);
app.get("/api/last-scan", getLastScanApi);
app.get("/api/ndef-url", getNdefUrl);

// Admin API routes
app.post("/api/admin/login", postLogin);
app.post("/api/admin/logout", postLogout);
app.get("/api/admin/dashboard", requireAdmin, getAdmin);
app.post("/api/admin/quick-add-tx", requireAdmin, postQuickAddTx);
app.post("/api/admin/quick-register-link", requireAdmin, postQuickRegisterLink);
app.post("/api/admin/delete-user", requireAdmin, postDeleteUser);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start
app.listen(PORT, () => {
  console.log(`NFC Leaderboard API listening on http://127.0.0.1:${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

