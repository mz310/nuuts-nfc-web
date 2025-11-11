// db.js — SQLite database initialization and helper functions

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { DB_PATH } = require("./config");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  nickname   TEXT,
  profession TEXT,
  uid        TEXT UNIQUE,
  phone      TEXT,
  bio        TEXT,
  gender     TEXT NOT NULL DEFAULT 'other',
  created_ts DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id  INTEGER NOT NULL,
  amount   REAL NOT NULL,
  ts       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scans (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  uid  TEXT NOT NULL,
  ts   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS totals (
  user_id INTEGER PRIMARY KEY,
  total   REAL NOT NULL DEFAULT 0
);
`);

// -- Safe migrations: if existing DB lacks new columns, add them
const cols = db
  .prepare("PRAGMA table_info('users')")
  .all()
  .map((r) => r.name);
if (!cols.includes("phone")) {
  try {
    db.prepare("ALTER TABLE users ADD COLUMN phone TEXT").run();
  } catch (e) {
    console.warn("Could not add column phone:", e.message);
  }
}
if (!cols.includes("bio")) {
  try {
    db.prepare("ALTER TABLE users ADD COLUMN bio TEXT").run();
  } catch (e) {
    console.warn("Could not add column bio:", e.message);
  }
}
if (!cols.includes("gender")) {
  try {
    // Add gender column with default 'other' for existing rows
    db.prepare(
      "ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'other'"
    ).run();
    // Ensure any NULLs are set to 'other'
    db.prepare("UPDATE users SET gender = 'other' WHERE gender IS NULL").run();
  } catch (e) {
    console.warn("Could not add column gender:", e.message);
  }
}

// ---- Select helpers ----
function getUserByUID(uid) {
  return db
    .prepare(
      "SELECT id, name, nickname, profession, phone, bio, gender, uid FROM users WHERE uid = ?"
    )
    .get(uid);
}

function getUserFullById(id) {
  return db
    .prepare(
      "SELECT id, name, nickname, profession, uid, phone, bio, gender FROM users WHERE id = ?"
    )
    .get(id);
}

function getTotalByUserId(id) {
  return db.prepare("SELECT total FROM totals WHERE user_id = ?").get(id);
}

function getLeaderboardRows() {
  return db
    .prepare(
      `SELECT u.id,
              COALESCE(NULLIF(u.nickname,''), u.name, 'Player ' || u.id) AS label,
              COALESCE(t.total,0) AS total
       FROM users u
       LEFT JOIN totals t ON t.user_id = u.id
       ORDER BY total DESC, u.id ASC`
    )
    .all();
}

function searchUsers(q, limit = 100) {
  const like = `%${q}%`;
  return db
    .prepare(
      `SELECT * FROM users
       WHERE name LIKE ? OR IFNULL(nickname,'') LIKE ?
             OR IFNULL(profession,'') LIKE ? OR IFNULL(uid,'') LIKE ?
       ORDER BY id DESC LIMIT ?`
    )
    .all(like, like, like, like, limit);
}

function listUsers(limit = 50) {
  return db.prepare("SELECT * FROM users ORDER BY id DESC LIMIT ?").all(limit);
}

function getLastScan() {
  return db.prepare("SELECT uid, ts FROM scans ORDER BY id DESC LIMIT 1").get();
}

// ---- Mutations ----
function insertScan(uid) {
  db.prepare("INSERT INTO scans(uid) VALUES (?)").run(uid);
}

function insertTransactionAndUpdateTotal(userId, amount) {
  const tx = db.transaction((uid, amt) => {
    db.prepare("INSERT INTO transactions(user_id, amount) VALUES (?, ?)").run(
      uid,
      amt
    );
    db.prepare(
      `INSERT INTO totals(user_id, total) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET total = total + excluded.total`
    ).run(uid, amt);
  });
  tx(userId, amount);
}

// Generate random UID (simulating NFC tag ID)
function generateRandomUID() {
  // Generate 8-character hex UID (typical NFC tag format)
  const chars = "0123456789ABCDEF";
  let uid = "";
  for (let i = 0; i < 8; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

function createUserWithUid({
  name,
  nickname,
  profession,
  uid,
  phone,
  bio,
  gender,
}) {
  const tx = db.transaction(() => {
    // If no UID provided, generate a random one (simulating NFC tag ID)
    let finalUID = uid;
    if (!finalUID || finalUID.trim() === "") {
      // Generate unique random UID
      let attempts = 0;
      do {
        finalUID = generateRandomUID();
        attempts++;
        if (attempts > 100) {
          throw new Error("UID үүсгэхэд алдаа гарлаа");
        }
      } while (getUserByUID(finalUID)); // Ensure uniqueness
    } else {
      finalUID = finalUID.trim().toUpperCase();
      // If UID provided, clear it from any other user first
      db.prepare("UPDATE users SET uid=NULL WHERE uid=?").run(finalUID);
    }

    const info = db
      .prepare(
        "INSERT INTO users(name, nickname, profession, uid, phone, bio, gender) VALUES (?,?,?,?,?,?,?)"
      )
      .run(
        name,
        nickname || null,
        profession || null,
        finalUID,
        phone || null,
        bio || null,
        gender || "other"
      );
    return { id: info.lastInsertRowid, uid: finalUID };
  });
  return tx();
}

function quickRegisterLink({
  name,
  nickname,
  profession,
  uid,
  phone,
  bio,
  gender,
}) {
  let finalUID;
  const tx = db.transaction(() => {
    // If no UID provided (null, undefined, or empty string), generate a random one (simulating NFC tag ID)
    if (!uid || (typeof uid === "string" && uid.trim() === "")) {
      // Generate unique random UID
      let attempts = 0;
      do {
        finalUID = generateRandomUID();
        attempts++;
        if (attempts > 100) {
          throw new Error("UID үүсгэхэд алдаа гарлаа");
        }
      } while (getUserByUID(finalUID)); // Ensure uniqueness
    } else {
      finalUID = uid.trim().toUpperCase();
      // If UID provided, clear it from any other user first
      db.prepare("UPDATE users SET uid=NULL WHERE uid=?").run(finalUID);
    }

    db.prepare(
      "INSERT INTO users(name, nickname, profession, uid, phone, bio, gender) VALUES (?,?,?,?,?,?,?)"
    ).run(
      name,
      nickname || null,
      profession || null,
      finalUID,
      phone || null,
      bio || null,
      gender || "other"
    );
  });
  tx();
  return finalUID; // Return the UID (generated or provided)
}

function deleteUserCascade(userId) {
  const tx = db.transaction((id) => {
    db.prepare("DELETE FROM transactions WHERE user_id=?").run(id);
    db.prepare("DELETE FROM totals WHERE user_id=?").run(id);
    db.prepare("DELETE FROM users WHERE id=?").run(id);
  });
  tx(userId);
}

module.exports = {
  db,
  getUserByUID,
  getUserFullById,
  getTotalByUserId,
  getLeaderboardRows,
  searchUsers,
  listUsers,
  getLastScan,
  insertScan,
  insertTransactionAndUpdateTotal,
  createUserWithUid,
  quickRegisterLink,
  deleteUserCascade,
};
