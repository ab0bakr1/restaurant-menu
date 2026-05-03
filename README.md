# 🍽 Restaurant Digital Menu System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green?style=flat-square)
![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react)
![SQLite](https://img.shields.io/badge/sqlite-3-blue?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)

A complete, offline-first restaurant management system with QR ordering, real-time kitchen display, cashier invoicing, and admin dashboard — built with Node.js + React.

**Works on local WiFi (LAN) with no internet required.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Order Flow](#-order-flow) • [API Reference](#-api-reference)

</div>

---

## 📸 Screenshots

| Customer Menu (QR) | Waiter Dashboard | Kitchen Display |
|---|---|---|
| Customer scans QR → browses menu → places order | Waiter confirms & tracks orders | Kitchen sees orders in real-time |

| Admin Panel | Cashier & Invoice | Sales Reports |
|---|---|---|
| Manage menu, staff & QR codes | Print invoices & record payments | Daily/weekly/monthly sales |

---

## ✨ Features

### Backend
- ✅ **Offline-first** — runs entirely on local LAN, no internet needed
- ✅ **Real-time updates** via Socket.IO across all devices
- ✅ **JWT authentication** with role-based access control
- ✅ **WiFi kitchen printer** support (ESC/POS protocol)
- ✅ **Automatic daily backups** via PM2 cron
- ✅ **Cloudflare Tunnel** support for internet access

### Frontend
- ✅ **QR Code per table** — customers scan to order
- ✅ **Full order lifecycle**: Customer → Waiter → Kitchen → Cashier
- ✅ **Arabic & English** with automatic RTL support
- ✅ **Geofence check** — prevents orders from outside the restaurant
- ✅ **Kitchen display** with live timer and urgency alerts
- ✅ **Error boundaries** — graceful error handling on all pages
- ✅ **Connection status** indicator for server disconnects

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Real-time | Socket.IO |
| Authentication | JWT + bcryptjs |
| Frontend | React 19, Vite |
| Styling | CSS Modules |
| Internationalization | i18next |
| Printer | @node-escpos |
| Tunnel | Cloudflare Tunnel |
| Process Manager | PM2 |

---

## 📋 Requirements

| Requirement | Version |
|------------|---------|
| Node.js | v20.0.0 or higher |
| npm | v9.0.0 or higher |
| OS | Windows 10/11, macOS, or Linux |
| RAM | 2GB minimum |
| Storage | 500MB |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/restaurant-menu.git
cd restaurant-menu
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Configure server environment

```bash
# Copy the example file
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows
```

Edit `server/.env`:

```env
PORT=5001
JWT_SECRET=your-random-secret-here
CLIENT_URL=http://localhost:5173
PRINTER_ENABLED=false
PRINTER_IP=192.168.1.50
PRINTER_PORT=9100
```

> Generate a secure JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Configure frontend environment

```bash
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_SERVER_URL=http://localhost:5001
<<<<<<< HEAD
VITE_RESTAURANT_LAT=0
VITE_RESTAURANT_LNG=0
VITE_MAX_DISTANCE=50
=======

# في وضع الإنتاج على شبكة المطعم
# VITE_SERVER_URL=http://192.168.1.100:5001

# مع Cloudflare Tunnel
# VITE_SERVER_URL=https://your-tunnel.trycloudflare.com

# موقع المطعم — لتحديد ما إذا كان العميل داخل نطاق التوصيل
VITE_RESTAURANT_LAT=موقع المطعم من قوقل ماب مثل 34.5445
VITE_RESTAURANT_LNG=46.6753 موقع المطعم من قوقل ماب مثل
VITE_MAX_DISTANCE=50 اقصى مدى بعد عن المطعم بالمتر
>>>>>>> 2bf224534c43f7fdae51b008679399bd1eecc2df
```

> Set your restaurant's real GPS coordinates from Google Maps.

### 6. Seed the database

```bash
cd ../server
node db/seed.js
```

### 7. Run in development mode

Open **two terminals**:

**Terminal 1 — Server:**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏭 Production Deployment

### LAN-only (no internet access needed)

**Step 1** — Set server IP in `client/.env`:
```env
VITE_SERVER_URL=http://192.168.1.100:5001
```

**Step 2** — Build the frontend:
```bash
cd client
npm run build
```

**Step 3** — Run with PM2:
```bash
npm install -g pm2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Internet access via Cloudflare Tunnel (free)

**Temporary tunnel** (URL changes on restart):
```bash
cloudflared tunnel --url http://localhost:5001
# Copy the URL shown, e.g.: https://abc-xyz.trycloudflare.com
```

**Permanent tunnel** (requires free Cloudflare account + domain):
```bash
cloudflared login
cloudflared tunnel create restaurant-menu
cloudflared tunnel run restaurant-menu
```

After getting your tunnel URL, update `client/.env` and rebuild:
```bash
# client/.env
VITE_SERVER_URL=https://your-tunnel-url.trycloudflare.com

cd client && npm run build
```

---

## 🔄 Order Flow

```
Customer scans QR on table
        ↓
Browses menu → adds items → submits order
(geofence check: must be inside restaurant)
        ↓
[WAITER] sees new order → clicks "Confirm"
        ↓
[KITCHEN] receives order → prepares it → clicks "Ready"
Kitchen printer prints ticket automatically
        ↓
[WAITER] sees "Ready" → collects from kitchen → clicks "Deliver"
        ↓
[CASHIER] sees order → prints invoice → records payment
        ↓
Order complete ✅
```

### Order Statuses

| Status | Description |
|--------|-------------|
| `pending` | Customer submitted, waiter not confirmed |
| `confirmed` | Waiter confirmed, kitchen preparing |
| `ready` | Kitchen done, waiter collecting |
| `delivered` | Waiter delivered, cashier processing payment |
| `paid` | Payment completed ✅ |
| `rejected` | Waiter rejected the order ❌ |

---

## 🖥 Pages & Routes

| Page | Route | Who Uses It | Auth Required |
|------|-------|-------------|---------------|
| Login | `/login` | Everyone | ❌ |
| Customer Menu | `/table/:number` | Customers | ❌ |
| Kitchen Display | `/kitchen` | Kitchen staff | ❌ |
| Waiter Dashboard | `/waiter` | Waiters | ✅ waiter |
| Cashier | `/cashier` | Cashiers | ✅ cashier |
| Admin Panel | `/admin` | Manager | ✅ admin |
| Sales Reports | `/reports` | Manager | ✅ admin |

---

## 👤 Default Accounts

> ⚠️ **Change all passwords immediately after first login**

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Waiter | `waiter1` | `waiter123` |
| Cashier | `cashier` | `cashier123` |

Change passwords from: `/admin` → Staff tab → delete & recreate account.

---

## 📱 QR Code Generation

Generate and print QR codes for all tables from the browser:

```
http://localhost:5001/api/qr/print/all?tables=10
```

Or single table:
```
http://localhost:5001/api/qr/5
```

---

## 🖨 Kitchen Printer Setup

Set in `server/.env`:

```env
PRINTER_ENABLED=true
PRINTER_IP=192.168.1.50      # Your printer's static IP
PRINTER_PORT=9100             # Default ESC/POS port
```

Supported: Any thermal printer with ESC/POS over WiFi (Epson TM-T82, XPRINTER, RONGTA, etc.)

> Assign a **static IP** to your printer in router settings so it never changes.

---

## 💾 Backup & Restore

```bash
# Manual backup now
npm run backup

# List available backups
npm run restore

# Restore latest backup
npm run restore:latest

# Restore specific backup
node server/restore.js restaurant_2024-01-15_03-00.db
```

Automatic backups run daily at **3:00 AM** via PM2.
Stored in: `server/backups/` — keeps last 30 backups.

---

## 📁 Project Structure

```
restaurant-menu/
├── server/                     # Backend
│   ├── index.js                # Entry point
│   ├── .env                    # Environment config (not in Git)
│   ├── .env.example            # Config template
│   ├── backup.js               # Backup script
│   ├── restore.js              # Restore script
│   ├── db/
│   │   ├── schema.sql          # Database schema
│   │   ├── db.js               # Database connection
│   │   └── seed.js             # Default data seeder
│   ├── routes/
│   │   ├── menu.js             # Menu CRUD API
│   │   ├── orders.js           # Orders API
│   │   ├── auth.js             # Auth & user management
│   │   ├── print.js            # Printing & invoices
│   │   ├── reports.js          # Sales reports
│   │   ├── payments.js         # Payment history
│   │   └── qr.js               # QR code generation
│   ├── services/
│   │   └── printer.js          # Kitchen printer service
│   └── middleware/
│       └── authMiddleware.js   # JWT protection middleware
│
├── client/                     # Frontend
│   ├── .env                    # Environment config (not in Git)
│   ├── .env.example            # Config template
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── App.jsx             # Routes
│       ├── main.jsx            # Entry point
│       ├── index.css           # Global styles (Cairo font)
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── CustomerMenu.jsx
│       │   ├── WaiterApp.jsx
│       │   ├── AdminPanel.jsx
│       │   ├── Cashier.jsx
│       │   ├── KitchenDisplay.jsx
│       │   └── SalesReports.jsx
│       ├── components/
│       │   ├── customer/       # QR menu components
│       │   ├── waiter/         # Waiter components
│       │   ├── kitchen/        # Kitchen display components
│       │   ├── cashier/        # Cashier components
│       │   ├── admin/          # Admin panel components
│       │   ├── ErrorBoundary.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ConnectionStatus.jsx
│       ├── services/
│       │   ├── api.js          # Axios with auto token
│       │   ├── socket.js       # Shared Socket.IO instance
│       │   └── authService.js  # Session management
│       ├── hooks/
│       │   ├── useSound.js     # Notification sound
│       │   └── useGeofence.js  # Geofence validation
│       └── i18n/
│           ├── i18n.js         # i18n setup
│           ├── ar.json         # Arabic translations
│           └── en.json         # English translations
│
├── ecosystem.config.js         # PM2 configuration
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

### Menu

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/menu` | Get all active items | Public |
| POST | `/api/menu` | Add menu item | Admin |
| PATCH | `/api/menu/:id` | Update item / toggle active | Admin |
| DELETE | `/api/menu/:id` | Delete item | Admin |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create new order | Public |
| GET | `/api/orders?view=waiter` | Get waiter orders | Staff |
| GET | `/api/orders?view=kitchen` | Get kitchen orders | Staff |
| GET | `/api/orders?view=cashier` | Get cashier orders | Staff |
| PATCH | `/api/orders/:id/status` | Update order status | Staff |

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/register` | Create account | Admin |
| GET | `/api/auth/users` | List staff | Admin |
| DELETE | `/api/auth/users/:id` | Delete account | Admin |

### Reports & Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports?from=&to=` | Sales report | Admin |
| GET | `/api/payments?from=&to=` | Payment history | Admin |
| POST | `/api/print/invoice` | Record payment | Staff |

### QR Codes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/qr/:table` | Get table QR as PNG | Public |
| GET | `/api/qr/print/all?tables=10` | Print all QR codes | Public |

---

## 🔒 Security

- JWT tokens expire after **24 hours**
- Passwords hashed with **bcrypt** (salt rounds: 10)
- Sensitive routes protected by **role-based middleware**
- Geofence check prevents orders from outside the restaurant
- All secrets stored in `.env` files (excluded from Git)

**Before going to production:**
- [ ] Change `JWT_SECRET` to a random 32-byte hex string
- [ ] Change all default passwords
- [ ] Set `PRINTER_ENABLED=true` if using a printer
- [ ] Set correct restaurant GPS coordinates

---

## 🛠 Useful Commands

```bash
# Development
node server/index.js          # Start server
cd client && npm run dev      # Start frontend

# Production
cd client && npm run build    # Build frontend
pm2 start ecosystem.config.js # Start with PM2
pm2 status                    # Check status
pm2 logs                      # View logs
pm2 restart restaurant        # Restart server

# Database
node server/db/seed.js        # Seed default data
npm run backup                # Manual backup
npm run restore               # Restore from backup

# Cloudflare
cloudflared tunnel --url http://localhost:5001  # Quick tunnel
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use and modify.

---

<div align="center">
<<<<<<< HEAD

Built with ❤️ for Arabic restaurants

**Node.js** • **React** • **Socket.IO** • **SQLite** • **Cloudflare**

</div>
=======
بُني بـ ❤️ لخدمة المطاعم العربية
</div>
>>>>>>> 2bf224534c43f7fdae51b008679399bd1eecc2df
