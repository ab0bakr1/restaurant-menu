-- server/db/schema.sql
-- الحالات: pending → confirmed → ready → delivered → paid

CREATE TABLE IF NOT EXISTS menu_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en     TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  desc_en     TEXT DEFAULT '',
  desc_ar     TEXT DEFAULT '',
  price       REAL NOT NULL,
  category    TEXT DEFAULT 'mains',
  image_url   TEXT DEFAULT '',
  is_active   INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number  TEXT NOT NULL,
  waiter_id     INTEGER,
  status        TEXT DEFAULT 'pending',
  -- pending   = العميل أرسل، النادل لم يؤكد بعد
  -- confirmed = النادل أكّد، المطبخ يحضّر
  -- ready     = المطبخ جهّز، النادل يستلم
  -- delivered = النادل سلّم للعميل، الكاشير ينتظر
  -- paid      = الكاشير أتمّ الدفع
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL,
  menu_item_id  INTEGER NOT NULL,
  quantity      INTEGER DEFAULT 1,
  notes         TEXT,
  FOREIGN KEY(order_id)      REFERENCES orders(id),
  FOREIGN KEY(menu_item_id)  REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'waiter'
  -- admin | waiter | cashier
);

CREATE TABLE IF NOT EXISTS payments (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  INTEGER NOT NULL,
  method    TEXT NOT NULL,  -- cash | pos | online
  amount    REAL NOT NULL,
  paid_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);