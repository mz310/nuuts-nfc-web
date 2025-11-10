// routes/api.js — ESP32 / Gateway API endpoints

const {
  getUserByUID,
  getLastScan,
  insertScan,
  insertTransactionAndUpdateTotal
} = require("../db");

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

// POST /api/scan
function postScan(req, res) {
  const raw = (req.body && req.body.uid) || "";
  const uid = String(raw).trim().toUpperCase();
  if (!uid) {
    return res.status(400).json({ status: "bad", message: "no uid" });
  }

  insertScan(uid);

  const user = getUserByUID(uid);
  const resp = { status: "ok", uid, linked: !!user };

  if (Object.prototype.hasOwnProperty.call(req.body, "amount")) {
    const amount = parseFloat(String(req.body.amount));
    if (user && amount > 0) {
      insertTransactionAndUpdateTotal(user.id, amount);
      resp.amount = amount;
    } else {
      resp.note = "amount ignored (no user linked or amt<=0)";
    }
  }

  return res.json(resp);
}

// GET /api/last-scan
function getLastScanApi(req, res) {
  const row = getLastScan();
  if (!row) return res.json({ uid: null });
  const uid = row.uid;
  const user = getUserByUID(uid);
  const obj = { uid };
  if (user) {
    obj.user = {
      id: user.id,
      name: user.name,
      nickname: user.nickname
    };
  }
  res.json(obj);
}

// GET /api/ndef-url?uid=...
// Returns profile URL if user exists, otherwise returns registration URL
function getNdefUrl(req, res) {
  const raw = (req.query.uid || "").toString().trim().toUpperCase();
  if (!raw) {
    return res.status(400).json({ status: "bad", message: "no uid" });
  }
  const user = getUserByUID(raw);
  const b = baseUrl(req);

  if (user) {
    return res.json({
      status: "ok",
      exists: true,
      uid: raw,
      url: `${b}/u/${user.id}`
    });
  }
  return res.json({
    status: "ok",
    exists: false,
    uid: raw,
    registerUrl: `${b}/register?uid=${encodeURIComponent(raw)}`
  });
}

module.exports = {
  postScan,
  getLastScanApi,
  getNdefUrl
};

