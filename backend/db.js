const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { DB_PATH } = require("./config");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  nickname    TEXT,
  profession  TEXT,
  industry    TEXT,
  uid         TEXT UNIQUE,
  phone       TEXT,
  bio         TEXT,
  gender      TEXT NOT NULL DEFAULT 'other',
  created_ts  DATETIME DEFAULT CURRENT_TIMESTAMP
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
    db.prepare(
      "ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'other'"
    ).run();
    db.prepare("UPDATE users SET gender = 'other' WHERE gender IS NULL").run();
  } catch (e) {
    console.warn("Could not add column gender:", e.message);
  }
}
if (!cols.includes("industry")) {
  try {
    db.prepare("ALTER TABLE users ADD COLUMN industry TEXT").run();
  } catch (e) {
    console.warn("Could not add column industry:", e.message);
  }
}

function getUserByUID(uid) {
  return db
    .prepare(
      "SELECT id, name, nickname, profession, industry, phone, bio, gender, uid FROM users WHERE uid = ?"
    )
    .get(uid);
}

function getUserFullById(id) {
  return db
    .prepare(
      "SELECT id, name, nickname, profession, industry, uid, phone, bio, gender, created_ts FROM users WHERE id = ?"
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
              u.name,
              u.nickname,
              COALESCE(NULLIF(u.nickname,''), u.name, 'Player ' || u.id) AS label,
              u.profession,
              u.industry,
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

function createUserWithUid({
  name,
  nickname,
  profession,
  industry,
  uid,
  phone,
  bio,
  gender,
}) {
  if (!uid || typeof uid !== "string" || uid.trim() === "") {
    throw new Error("UID шаардлагатай. NFC reader-ээс UID авах шаардлагатай.");
  }

  const tx = db.transaction(() => {
    const finalUID = uid.trim().toUpperCase();
    
    const existing = getUserByUID(finalUID);
    if (existing) {
      throw new Error("Энэ UID аль хэдийн хэрэглэгчтэй холбогдсон байна.");
    }

    const info = db
      .prepare(
        "INSERT INTO users(name, nickname, profession, industry, uid, phone, bio, gender) VALUES (?,?,?,?,?,?,?,?)"
      )
      .run(
        name,
        nickname || null,
        profession || null,
        industry || null,
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
  industry,
  uid,
  phone,
  bio,
  gender,
}) {
  if (!uid || typeof uid !== "string" || uid.trim() === "") {
    throw new Error("UID шаардлагатай. NFC reader-ээс UID авах шаардлагатай.");
  }

  const tx = db.transaction(() => {
    const finalUID = uid.trim().toUpperCase();
    
    const existing = getUserByUID(finalUID);
    if (existing) {
      throw new Error("Энэ UID аль хэдийн хэрэглэгчтэй холбогдсон байна.");
    }

    db.prepare(
      "INSERT INTO users(name, nickname, profession, industry, uid, phone, bio, gender) VALUES (?,?,?,?,?,?,?,?)"
    ).run(
      name,
      nickname || null,
      profession || null,
      industry || null,
      finalUID,
      phone || null,
      bio || null,
      gender || "other"
    );
    return finalUID;
  });
  return tx();
}

function deleteUserCascade(userId) {
  const tx = db.transaction((id) => {
    db.prepare("DELETE FROM transactions WHERE user_id=?").run(id);
    db.prepare("DELETE FROM totals WHERE user_id=?").run(id);
    db.prepare("DELETE FROM users WHERE id=?").run(id);
  });
  tx(userId);
}

function updateUser(
  id,
  { name, nickname, profession, industry, phone, bio, gender }
) {
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("Name is required");
  }

  const existing = getUserFullById(id);
  if (!existing) {
    return null;
  }

  const allowedGenders = ["male", "female", "other"];
  const finalGender = gender && allowedGenders.includes(gender.toLowerCase())
    ? gender.toLowerCase()
    : existing.gender || "other";
  const finalIndustry = industry !== undefined 
    ? (industry && typeof industry === "string" && industry.trim() !== "" ? industry.trim() : null)
    : existing.industry || null;

  db.prepare(
    `UPDATE users 
     SET name = ?, nickname = ?, profession = ?, industry = ?, phone = ?, bio = ?, gender = ?
     WHERE id = ?`
  ).run(
    name.trim(),
    nickname ? nickname.trim() : null,
    profession ? profession.trim() : null,
    finalIndustry,
    phone ? phone.trim() : null,
    bio ? bio.trim() : null,
    finalGender,
    id
  );

  return getUserFullById(id);
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
  updateUser,
};
