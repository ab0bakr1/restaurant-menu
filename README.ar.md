# 🍽 نظام القائمة الرقمية للمطعم
# Restaurant Digital Menu System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

**نظام إدارة مطعم متكامل | Full Restaurant Management System**

يعمل بدون إنترنت على الشبكة المحلية (LAN) | Works offline on Local Network

</div>

---

## 📋 جدول المحتويات | Table of Contents

- [المميزات](#-المميزات)
- [متطلبات التشغيل](#-متطلبات-التشغيل)
- [تثبيت المشروع](#-تثبيت-المشروع)
- [تشغيل المشروع](#-تشغيل-المشروع)
- [تدفق الطلب](#-تدفق-الطلب)
- [الصفحات والروابط](#-الصفحات-والروابط)
- [الحسابات الافتراضية](#-الحسابات-الافتراضية)
- [إعداد الوصول من الإنترنت](#-إعداد-الوصول-من-الإنترنت)
- [النسخ الاحتياطي](#-النسخ-الاحتياطي)
- [هيكل المشروع](#-هيكل-المشروع)

---

## ✨ المميزات

### الباك-اند
- ✅ يعمل بدون إنترنت على LAN المحلي
- ✅ قاعدة بيانات SQLite محلية
- ✅ تحديثات لحظية عبر Socket.IO
- ✅ JWT للمصادقة وحماية المسارات
- ✅ دعم طابعة المطبخ WiFi (ESC/POS)
- ✅ نسخ احتياطي تلقائي يومي

### الفرونت-اند
- ✅ QR Code لكل طاولة
- ✅ تدفق طلب كامل: عميل ← نادل ← مطبخ ← كاشير
- ✅ دعم العربية والإنجليزية مع RTL
- ✅ تحقق جغرافي (العميل داخل المطعم)
- ✅ شاشة مطبخ مع عداد وقت
- ✅ تقارير مبيعات للإدمن

---

## 💻 متطلبات التشغيل

| المتطلب | الإصدار |
|---------|---------|
| Node.js | v20.0.0 أو أحدث |
| npm | v9.0.0 أو أحدث |
| نظام التشغيل | Windows 10/11 أو macOS أو Linux |
| RAM | 2GB كحد أدنى |
| المساحة | 500MB |

---

## 📦 تثبيت المشروع

### الخطوة 1 — تحميل المشروع

```bash
git clone https://github.com/yourusername/restaurant-menu.git
cd restaurant-menu
```

### الخطوة 2 — تثبيت مكتبات السيرفر

```bash
cd server
npm install
```

### الخطوة 3 — إعداد ملف البيئة للسيرفر

```bash
# انسخ ملف المثال
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

عدّل `server/.env`:

```env
PORT=5001
JWT_SECRET=ضع-هنا-مفتاح-عشوائي-طويل
CLIENT_URL=http://localhost:5173
PRINTER_ENABLED=false
PRINTER_IP=192.168.1.50
PRINTER_PORT=9100
MAX_BACKUPS=30
```

> ⚠️ لتوليد JWT_SECRET آمن:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### الخطوة 4 — تثبيت مكتبات الفرونت

```bash
cd ../client
npm install
```

### الخطوة 5 — إعداد ملف البيئة للفرونت

```bash
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

عدّل `client/.env`:

```env
# في وضع التطوير
VITE_SERVER_URL=http://localhost:5001

# في وضع الإنتاج على شبكة المطعم
# VITE_SERVER_URL=http://192.168.1.100:5001

# مع Cloudflare Tunnel
# VITE_SERVER_URL=https://your-tunnel.trycloudflare.com

# موقع المطعم — لتحديد ما إذا كان العميل داخل نطاق التوصيل
VITE_RESTAURANT_LAT=موقع المطعم من قوقل ماب مثل 34.5445
VITE_RESTAURANT_LNG=46.6753 موقع المطعم من قوقل ماب مثل
VITE_MAX_DISTANCE=50 اقصى مدى بعد عن المطعم بالمتر
```

### الخطوة 6 — إنشاء قاعدة البيانات والحسابات الافتراضية

```bash
cd ../server
node db/seed.js
```

---

## 🚀 تشغيل المشروع

### وضع التطوير (Development)

افتح **طرفيتين منفصلتين**:

**الطرفية 1 — السيرفر:**
```bash
cd server
node index.js
```

**الطرفية 2 — الفرونت:**
```bash
cd client
npm run dev
```

### وضع الإنتاج (Production) — داخل المطعم

**الخطوة 1 — عدّل `client/.env` بـ IP السيرفر:**
```env
VITE_SERVER_URL=http://192.168.1.100:5001
```

**الخطوة 2 — ابنِ الفرونت:**
```bash
cd client
npm run build
```

**الخطوة 3 — شغّل بـ PM2:**
```bash
# تثبيت PM2 (مرة واحدة فقط)
npm install -g pm2

# تشغيل المشروع
cd ..
pm2 start ecosystem.config.js

# حفظ الإعدادات للتشغيل التلقائي
pm2 save
pm2 startup
```

**الخطوة 4 — تحقق من التشغيل:**
```bash
pm2 status
```

### وضع الإنتاج مع Cloudflare Tunnel (وصول من الإنترنت)

**الخطوة 1 — شغّل الـ Tunnel في طرفية منفصلة:**
```bash
cloudflared tunnel --url http://localhost:5001
```

**الخطوة 2 — انسخ الرابط الذي يظهر:**
```
https://something-random.trycloudflare.com
```

**الخطوة 3 — عدّل `client/.env`:**
```env
VITE_SERVER_URL=https://something-random.trycloudflare.com
```

**الخطوة 4 — أعِد البناء:**
```bash
cd client && npm run build
```

---

## 🔄 تدفق الطلب الكامل

```
1. العميل يمسح QR على الطاولة
         ↓
2. يفتح القائمة ويضيف أصنافاً للسلة
         ↓
3. يضغط "إرسال الطلب" ← تحقق جغرافي
         ↓
4. [النادل] يرى الطلب الجديد ← يضغط "تأكيد"
         ↓
5. [المطبخ] يرى الطلب ← يحضّره ← يضغط "جاهز"
         ↓
6. [النادل] يرى "جاهز" ← يستلم من المطبخ ← يضغط "تسليم"
         ↓
7. [الكاشير] يرى الطلب ← يطبع الفاتورة ← يسجّل الدفع
         ↓
8. الطلب مكتمل ✅
```

---

## 🖥 الصفحات والروابط

| الصفحة | الرابط | من يستخدمها | يحتاج دخول؟ |
|--------|--------|-------------|-------------|
| تسجيل الدخول | `/login` | الجميع | ❌ |
| قائمة العميل | `/table/1` | العميل | ❌ |
| شاشة المطبخ | `/kitchen` | الطباخون | ❌ |
| النادل | `/waiter` | النادل | ✅ |
| الكاشير | `/cashier` | الكاشير | ✅ |
| الإدارة | `/admin` | المدير | ✅ admin |
| التقارير | `/reports` | المدير | ✅ admin |

---

## 👤 الحسابات الافتراضية

> ⚠️ **مهم:** غيّر كلمات المرور فور أول تشغيل

| الدور | اسم المستخدم | كلمة المرور |
|-------|-------------|-------------|
| مدير | `admin` | `admin123` |
| نادل | `waiter1` | `waiter123` |
| كاشير | `cashier` | `cashier123` |

**لتغيير كلمة المرور:**
```
/admin → تبويب الموظفون → احذف الحساب وأنشئ واحداً جديداً
```

---

## 🌐 إعداد الوصول من الإنترنت

### الخيار 1 — Quick Tunnel (مجاني، مؤقت)

```bash
cloudflared tunnel --url http://localhost:5001
```

الرابط يتغير عند كل إعادة تشغيل.

### الخيار 2 — LAN فقط (بدون إنترنت)

```env
# client/.env
VITE_SERVER_URL=http://192.168.1.100:5001
```

العميل يجب أن يكون على WiFi المطعم.

### الخيار 3 — Named Tunnel مع دومين (دائم ✅)

```bash
# 1. سجّل دخول
cloudflared login

# 2. أنشئ tunnel
cloudflared tunnel create restaurant-menu

# 3. أنشئ config.yml في ~/.cloudflared/
# tunnel: restaurant-menu
# credentials-file: ~/.cloudflared/[UUID].json
# ingress:
#   - hostname: menu.yourdomain.com
#     service: http://localhost:5001
#   - service: http_status:404

# 4. شغّل
cloudflared tunnel run restaurant-menu

# 5. للتشغيل التلقائي مع Windows
cloudflared service install
```

---

## 💾 النسخ الاحتياطي

```bash
# نسخة يدوية الآن
npm run backup

# عرض النسخ المتاحة
npm run restore

# استعادة أحدث نسخة
npm run restore:latest
```

النسخ التلقائية تعمل كل يوم الساعة **3:00 صباحاً** عبر PM2.

تُحفظ في: `server/backups/`

---

## 🖨 إعداد طابعة المطبخ

```env
# server/.env
PRINTER_ENABLED=true        # فعّل الطابعة
PRINTER_IP=192.168.1.50     # IP الطابعة على الشبكة
PRINTER_PORT=9100           # المنفذ الافتراضي ESC/POS
```

> الطابعة يجب أن تكون على نفس الشبكة المحلية وتدعم ESC/POS عبر WiFi.

---

## 📱 توليد QR Code للطاولات

```bash
# افتح في المتصفح (السيرفر يجب أن يعمل)
http://localhost:5001/api/qr/print/all?tables=10
```

سيفتح صفحة بـ QR كل الطاولات جاهزة للطباعة.

---

## 📁 هيكل المشروع

```
restaurant-menu/
├── server/                     # الباك-اند
│   ├── index.js                # نقطة البداية
│   ├── .env                    # إعدادات السيرفر (لا ترفعه لـ Git)
│   ├── .env.example            # مثال الإعدادات
│   ├── backup.js               # سكريبت النسخ الاحتياطي
│   ├── restore.js              # سكريبت الاستعادة
│   ├── db/
│   │   ├── schema.sql          # تعريف جداول قاعدة البيانات
│   │   ├── db.js               # الاتصال بقاعدة البيانات
│   │   ├── seed.js             # إنشاء البيانات الافتراضية
│   │   └── restaurant.db       # قاعدة البيانات (لا ترفعها لـ Git)
│   ├── routes/
│   │   ├── menu.js             # API القائمة
│   │   ├── orders.js           # API الطلبات
│   │   ├── auth.js             # تسجيل الدخول والحسابات
│   │   ├── print.js            # الطباعة والفواتير
│   │   ├── reports.js          # تقارير المبيعات
│   │   ├── payments.js         # سجل المدفوعات
│   │   └── qr.js               # توليد QR Code
│   ├── services/
│   │   └── printer.js          # خدمة طابعة المطبخ
│   ├── middleware/
│   │   └── authMiddleware.js   # حماية المسارات بـ JWT
│   └── backups/                # النسخ الاحتياطية (لا ترفعها لـ Git)
│
├── client/                     # الفرونت-اند
│   ├── .env                    # إعدادات الفرونت (لا ترفعه لـ Git)
│   ├── .env.example            # مثال الإعدادات
│   ├── vite.config.js          # إعدادات Vite
│   └── src/
│       ├── App.jsx             # المسارات الرئيسية
│       ├── main.jsx            # نقطة البداية
│       ├── index.css           # الأنماط العامة
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── CustomerMenu.jsx
│       │   ├── WaiterApp.jsx
│       │   ├── AdminPanel.jsx
│       │   ├── Cashier.jsx
│       │   ├── KitchenDisplay.jsx
│       │   └── SalesReports.jsx
│       ├── components/
│       │   ├── customer/       # مكونات قائمة العميل
│       │   ├── waiter/         # مكونات النادل
│       │   ├── kitchen/        # مكونات المطبخ
│       │   ├── cashier/        # مكونات الكاشير
│       │   ├── admin/          # مكونات الإدارة
│       │   ├── ErrorBoundary.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ConnectionStatus.jsx
│       ├── services/
│       │   ├── api.js          # Axios مع token تلقائي
│       │   ├── socket.js       # Socket.IO مشترك
│       │   └── authService.js  # إدارة الجلسة
│       ├── hooks/
│       │   ├── useSound.js     # صوت التنبيه
│       │   └── useGeofence.js  # التحقق الجغرافي
│       └── i18n/
│           ├── i18n.js         # إعداد اللغات
│           ├── ar.json         # النصوص العربية
│           └── en.json         # النصوص الإنجليزية
│
├── ecosystem.config.js         # إعدادات PM2
├── .gitignore                  # ملفات مستثناة من Git
└── README.md                   # هذا الملف
```

---

## 🔧 أوامر مفيدة

```bash
# تشغيل السيرفر
cd server && node index.js

# تشغيل الفرونت للتطوير
cd client && npm run dev

# بناء الفرونت للإنتاج
cd client && npm run build

# نسخ احتياطي يدوي
npm run backup

# استعادة من نسخة
npm run restore

# PM2 — تشغيل كامل
pm2 start ecosystem.config.js

# PM2 — مراقبة
pm2 status
pm2 logs
pm2 restart restaurant

# Cloudflare Tunnel مؤقت
cloudflared tunnel --url http://localhost:5001
```

---

## 🛠 API Reference

| Method | Route | الوصف | الصلاحية |
|--------|-------|-------|----------|
| GET | `/api/menu` | جلب القائمة | عام |
| POST | `/api/menu` | إضافة صنف | admin |
| PATCH | `/api/menu/:id` | تعديل صنف | admin |
| DELETE | `/api/menu/:id` | حذف صنف | admin |
| POST | `/api/orders` | إنشاء طلب | عام |
| GET | `/api/orders?view=waiter` | طلبات النادل | staff |
| GET | `/api/orders?view=kitchen` | طلبات المطبخ | staff |
| GET | `/api/orders?view=cashier` | طلبات الكاشير | staff |
| PATCH | `/api/orders/:id/status` | تحديث الحالة | staff |
| POST | `/api/auth/login` | تسجيل الدخول | عام |
| POST | `/api/auth/register` | إنشاء حساب | admin |
| GET | `/api/auth/users` | قائمة الموظفين | admin |
| POST | `/api/print/invoice` | تسجيل الدفع | staff |
| GET | `/api/reports` | تقارير المبيعات | admin |
| GET | `/api/payments` | سجل الفواتير | admin |
| GET | `/api/qr/:table` | QR طاولة | عام |
| GET | `/api/qr/print/all` | طباعة كل QR | عام |

---

## 🔐 الأمان

- ✅ JWT للمصادقة مع انتهاء صلاحية 24 ساعة
- ✅ bcrypt لتشفير كلمات المرور
- ✅ حماية المسارات الحساسة بـ Middleware
- ✅ التحقق الجغرافي لمنع الطلبات من خارج المطعم
- ⚠️ غيّر `JWT_SECRET` في `.env` قبل النشر
- ⚠️ احذف بيانات الدخول من `Login.jsx` قبل النشر

---

## 📊 حالات الطلب

```
pending   → العميل أرسل، النادل لم يؤكد
confirmed → النادل أكّد، المطبخ يحضّر
ready     → المطبخ جهّز، النادل يستلم
delivered → النادل سلّم، الكاشير ينتظر
paid      → تم الدفع ✅
rejected  → النادل رفض الطلب ❌
```

---

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch جديد: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📄 الترخيص

MIT License — يمكن استخدامه وتعديله بحرية.

---

<div align="center">
بُني بـ ❤️ لخدمة المطاعم العربية
</div>