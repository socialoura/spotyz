supprime completement le dashboard admin et recree le selon ce prompt : 1) Vue d'ensemble
Frontend: Next.js (App Router) + React Client Components

UI Admin: src/app/admin/dashboard/page.tsx

Analytics: src/components/admin/AnalyticsDashboard.tsx (charts Recharts)

Backend: Next.js API Routes sous src/app/api/admin/*

DB: Vercel Postgres via @vercel/postgres + helpers src/lib/db.ts

Auth: token admin stocké en localStorage et envoyé via header Authorization: Bearer <token>

2) Authentification admin
2.1 Login
Route: POST /api/admin/login

Fichier: src/app/api/admin/login/route.ts

Entrée: { username, password }

Source des identifiants: variables d'env

ADMIN_USERNAME

ADMIN_PASSWORD

Token émis: base64 de JSON

{ username, role: 'admin', exp: Date.now() + 24h }

Sortie: { token, success: true } ou { error }

2.2 Vérification du token
Les endpoints admin lisent Authorization.

Ils décodent le token (base64 → JSON) et vérifient:

decoded.exp > Date.now()

decoded.role === 'admin'

2.3 Côté UI (dashboard)
Le token est lu via localStorage.getItem('adminToken').

Si absent: redirection vers /admin.

Bouton Logout: supprime adminToken et redirige /admin.

3) Structure du dashboard admin (UI)
3.1 Page principale
Fichier: src/app/admin/dashboard/page.tsx

Onglets (activeTab):

pricing (Prix & Packages)

orders (Commandes)

analytics (Analytics & Revenus)

settings (Paramètres Admin)

promo (Codes Promo)

3.2 Chargements et fetch
La page déclenche des fetchs selon l'onglet:

pricing → fetchPricing()

orders → fetchOrders()

analytics → fetchOrders() + fetchGoogleAdsExpenses()

settings → fetchAdminSettings() + fetchStripeSettings()

promo → fetchPromoCodes() + fetchPromoFieldEnabled()

4) Fonctionnalités par onglet
4.A Onglet "Pricing & Packages" (pricing)
Objectif
Gérer les packages de vues YouTube avec leurs prix.

Structure des Packages
Chaque package contient:

Impressions (nombre de vues: 250, 500, 1k, 2.5k, 10k, 25k, 50k, 100k, 250k)

Prix actuel (price: 0.99€ à 299.99€)

Prix barré (original_price: 1.99€ à 1999.99€)

Réduction calculée (discount_percentage: -50% à -85%)

Statut (active/inactive)

Stock (illimité ou limité)

UI
Tableau des packages:

Impressions

Prix actuel (EUR)

Prix original (EUR)

Réduction % (calculée auto)

Statut (Active/Inactive toggle)

Actions (Edit / Delete / Duplicate)

Bouton "+ New Package"

Modal Create/Edit avec champs:

Impressions (number)

Prix actuel (decimal)

Prix original (decimal)

Active (toggle)

Description (optional text)

Packages par défaut (pré-remplis)
javascript
[
  { impressions: 250, price: 0.99, originalPrice: 1.99, discount: 50 },
  { impressions: 500, price: 1.49, originalPrice: 3.99, discount: 63 },
  { impressions: 1000, price: 2.49, originalPrice: 7.99, discount: 69 },
  { impressions: 2500, price: 5.99, originalPrice: 19.99, discount: 70 },
  { impressions: 10000, price: 18.99, originalPrice: 79.99, discount: 76 },
  { impressions: 25000, price: 39.99, originalPrice: 199.99, discount: 80 },
  { impressions: 50000, price: 69.99, originalPrice: 399.99, discount: 83 },
  { impressions: 100000, price: 129.99, originalPrice: 799.99, discount: 84 },
  { impressions: 250000, price: 299.99, originalPrice: 1999.99, discount: 85 }
]
API
GET GET /api/admin/pricing

retourne liste des packages

POST POST /api/admin/pricing

nécessite token admin

body: { impressions, price, originalPrice, isActive }

calcul auto du discount: Math.round((1 - price/originalPrice) * 100)

PUT PUT /api/admin/pricing/:packageId

nécessite token admin

body: { price?, originalPrice?, isActive? }

DELETE DELETE /api/admin/pricing/:packageId

nécessite token admin

Stockage
Table packages:

id, impressions, price, original_price, discount_percentage, is_active, created_at

Fonctions DB:

getAllPackages()

getPackage(id)

createPackage(data)

updatePackage(id, data)

deletePackage(id)

4.B Onglet "Orders" (orders)
Objectif
Lister, filtrer et administrer les commandes de vues YouTube.

UI
Tableau des commandes avec colonnes:

Order ID

Client (email)

YouTube URL (video link)

Package (ex: "1k impressions")

Price (prix de vente EUR)

Cost (coût réel - editable)

Order Status (select dropdown)

Progress (impressions livrées / total)

Created Date

Notes (editable text)

Actions (Edit / Delete / View)

Filtres
Recherche email / youtube_url

Filtre package (All / 250 / 500 / 1k / 2.5k / 10k / 25k / 50k / 100k / 250k)

Filtre status (All / Pending / Processing / In Progress / Completed / Cancelled / Refunded)

Filtre date (All / Today / This Week / This Month)

Order Status Flow
text
Pending → Processing → In Progress → Completed
                    ↓
                 Cancelled / Refunded
Actions
Update order status

Select "Pending/Processing/In Progress/Completed/Cancelled/Refunded"

Appelle PUT /api/admin/orders/:orderId avec { status }

Update progress (impressions delivered)

Number input (0 to package impressions)

Appelle PUT /api/admin/orders/:orderId avec { impressionsDelivered }

Edit cost (coût réel)

Inline number input + Save

Appelle PUT /api/admin/orders/:orderId avec { cost }

Edit notes

Inline textarea + Save

Appelle PUT /api/admin/orders/:orderId avec { notes }

Delete order

Confirmation + DELETE

Appelle DELETE /api/admin/orders/:orderId

View YouTube video (link external)

Si youtube_url existe, lien ouvre dans nouvel onglet

API
GET GET /api/admin/orders

query params: ?status=pending&package=1000&dateRange=week

retourne liste paginée avec détails package

PUT PUT /api/admin/orders/:orderId

nécessite token admin

body: { status?, cost?, notes?, impressionsDelivered? }

validations:

status enum

cost >= 0

impressionsDelivered <= package impressions

DELETE DELETE /api/admin/orders/:orderId

soft delete recommandé (ajouter deleted_at)

Stockage
Table orders:

order_id, email, youtube_url, package_id, impressions, price, cost, status, impressions_delivered, notes, created_at, stripe_transaction_id, promo_code, discount_amount

Fonctions DB:

getAllOrders(filters)

getOrder(orderId)

updateOrder(orderId, data)

deleteOrder(orderId)

4.C Onglet "Analytics" (analytics)
Objectif
Afficher des métriques:

Revenue total + par période

Profit (revenue - cost)

Net Profit mensuel (incluant Google Ads)

Distribution par package

Dépenses Google Ads

4.C.1 Dépenses Google Ads par mois
UI:

Input type="month" (format YYYY-MM)

Input montant (EUR)

Bouton "Save"

Tableau: Month | Amount | ROI | Edit | Delete

API
GET GET /api/admin/google-ads-expenses

POST POST /api/admin/google-ads-expenses

body: { month: 'YYYY-MM', amount: number }

PUT PUT /api/admin/google-ads-expenses/:month

body: { amount }

DELETE DELETE /api/admin/google-ads-expenses/:month

Stockage
Table google_ads_expenses:

month (PK, YYYY-MM)

amount (decimal)

4.C.2 Composant AnalyticsDashboard
Fichier: src/components/admin/AnalyticsDashboard.tsx

Lib: Recharts

Props:

typescript
{
  orders: Order[]
  packages: Package[]
  googleAdsExpenses?: { month: string, amount: number }[]
}
Calculs principaux
Revenue (revenu): somme de order.price

Cost (coût): somme de order.cost

Profit: revenue - cost

Net Profit mensuel: monthly_profit - googleAdsSpend(month)

Average Order Value: revenue / orders.count

Conversion Rate: orders.count / visitors * 100 (visitors source TBD)

ROI Google Ads: revenue(month) / googleAdsCost(month) * 100

Blocs / Graphiques
Stat Cards (5 colonnes):

Total Revenue (all time)

Total Orders (count)

Average Order Value

Total Profit (revenue - costs)

Total Impressions Sold

Charts:

Revenue Last 7 Days (Line Chart)

Revenue Last 30 Days (Bar Chart)

Profit Last 30 Days (Line Chart)

Net Profit by Month (12 mois) (Bar Chart, incl. Google Ads)

Orders by Package (Pie Chart: distribution des packages vendus)

Top Selling Packages (Bar Chart: top 5 packages par revenue)

Order Status Distribution (Pie Chart: pending/processing/completed/etc)

Dépenses Google Ads:

Tableau: Month | Amount | Revenue | ROI % | Edit | Delete

ROI calculation: (Revenue(month) - AdsCost(month)) / AdsCost(month) * 100

Performance Metrics:

Average delivery time (completed orders)

Success rate (completed / total orders * 100)

Refund rate (refunded / total orders * 100)

4.D Onglet "Settings" (settings)
4.D.1 Admin Password Change
UI: formulaire (Current Password / New Password / Repeat Password)

Validation UI:

Tous les champs requis

New == Repeat

Longueur >= 8 caractères

API
POST POST /api/admin/change-password

nécessite token admin

body: { currentPassword, newPassword }

vérifie current password avant mise à jour

Stockage
Table admin_users:

username, password_hash

Fonction DB: updateAdminPassword(username, newPassword)

4.D.2 Stripe API Keys
UI:

Input secret key (masked)

Input publishable key

Bouton "Test Connection"

Bouton "Save"

Status indicator (✅ Connected / ❌ Invalid)

API
GET GET /api/admin/stripe-settings

retourne keys (secret masquée)

PUT PUT /api/admin/stripe-settings

nécessite token admin

body: { secretKey, publishableKey }

validations:

secret commence par sk_

publishable commence par pk_

POST POST /api/admin/stripe-settings/test

teste connexion Stripe API

Stockage
Table settings:

key: stripe_secret_key / value: encrypted

key: stripe_publishable_key / value: plaintext

4.D.3 Service Settings (Nouveau!)
UI:

Default Delivery Speed (Slow/Normal/Fast)

Slow: 7-14 days

Normal: 3-7 days

Fast: 24-72h

Auto-Complete Orders (toggle)

Auto-complete when impressions_delivered == impressions

Email Notifications (toggle)

New order notifications

Order completion notifications

Low balance alerts

Admin Email (input)

API
GET GET /api/admin/service-settings

PUT PUT /api/admin/service-settings

body: { deliverySpeed?, autoComplete?, emailNotifications?, adminEmail? }

4.E Onglet "Promo Codes" (promo)
Objectif
Créer et gérer des codes promo, contrôler affichage du champ promo au checkout.

4.E.1 Toggle champ promo
UI: Switch "Enable Promo Field"

API:

GET /api/admin/promo-settings

PUT /api/admin/promo-settings

body: { enabled: boolean }

Stockage:

table settings, key promo_field_enabled

4.E.2 CRUD Promo Codes
UI:

Tableau: Code | Type | Value | Min Purchase | Max Uses | Used | Expires | Active | Actions

Bouton "+ New Promo Code"

Actions: Edit / Delete / Duplicate

Modal pour créer/edit

Form Fields:
text
- Code (string, uppercase auto)
- Discount Type (enum: percentage / fixed_amount)
- Discount Value (number)
- Min Purchase Amount (optional, EUR)
- Max Uses (number, -1 = unlimited)
- Current Uses (read-only)
- Expires At (date input)
- Is Active (toggle)
API
GET /api/admin/promo-codes

POST /api/admin/promo-codes

body: { code, discountType, discountValue, minPurchase, maxUses, expiresAt, isActive }

PUT /api/admin/promo-codes/:code

body: { discountValue?, minPurchase?, maxUses?, expiresAt?, isActive? }

DELETE /api/admin/promo-codes/:code

Stockage
Table promo_codes:

code (PK), discount_type, discount_value, min_purchase, max_uses, current_uses, expires_at, is_active, created_at

5) Base de données (init & migrations)
Tables principales
sql
-- Admin users
CREATE TABLE admin_users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packages (YouTube views packages)
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  impressions INT NOT NULL,
  price DECIMAL NOT NULL,
  original_price DECIMAL NOT NULL,
  discount_percentage INT,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  package_id TEXT REFERENCES packages(id),
  impressions INT NOT NULL,
  impressions_delivered INT DEFAULT 0,
  price DECIMAL NOT NULL,
  cost DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  stripe_transaction_id TEXT,
  promo_code TEXT,
  discount_amount DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY,
  discount_type TEXT,
  discount_value DECIMAL NOT NULL,
  min_purchase DECIMAL,
  max_uses INT DEFAULT -1,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Google Ads Expenses
CREATE TABLE google_ads_expenses (
  month TEXT PRIMARY KEY,
  amount DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
6) Conventions & Points importants
Status Enum
typescript
type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded'
Package IDs (examples)
text
'pkg_250'    // 250 impressions
'pkg_500'    // 500 impressions
'pkg_1k'     // 1,000 impressions
'pkg_2.5k'   // 2,500 impressions
'pkg_10k'    // 10,000 impressions
'pkg_25k'    // 25,000 impressions
'pkg_50k'    // 50,000 impressions
'pkg_100k'   // 100,000 impressions
'pkg_250k'   // 250,000 impressions
Price Format
Toujours en EUR

2 décimales max (0.99, 1.49, 299.99)

YouTube URL Validation
Regex: ^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+$

7) Fichiers clés
text
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx (login)
│   │   └── dashboard/
│   │       └── page.tsx (main dashboard)
│   └── api/
│       └── admin/
│           ├── login/route.ts
│           ├── pricing/route.ts
│           ├── orders/route.ts
│           ├── stripe-settings/route.ts
│           ├── service-settings/route.ts
│           ├── promo-settings/route.ts
│           ├── promo-codes/route.ts
│           └── google-ads-expenses/route.ts
├── components/
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AnalyticsDashboard.tsx
│       ├── PricingTab.tsx
│       ├── OrdersTab.tsx
│       └── SettingsTab.tsx
└── lib/
    └── db.ts