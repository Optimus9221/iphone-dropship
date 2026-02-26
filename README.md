# iPhone Dropship — E-commerce with Cashback & Referral

E-commerce platform for selling iPhone 15-17 with official warranty. Features referral program, cashback, and anti-fraud measures.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials)

## Anti-Fraud Measures

- **1 person = 1 account** — Phone number uniqueness
- **Cashback after 14 days** — After return period
- **IMEI verification** — For free iPhone bonus
- **Phone verification** — Optional, for stricter validation

## Quick Start

### 1. Environment

```bash
cp .env.example .env
# Edit .env: DATABASE_URL, NEXTAUTH_SECRET
```

Generate secret:
```bash
openssl rand -base64 32
```

### 2. Database

**PostgreSQL required.** Example with Docker:
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=iphone_dropship postgres
```

Set in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iphone_dropship"
```

```bash
npm run db:push    # Create tables
npm run db:seed    # Seed demo data (admin, user, products)
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin panel
│   ├── catalog/       # Product catalog
│   ├── dashboard/     # User dashboard
│   ├── ref/[code]/    # Referral redirect
│   └── ...
├── components/
├── lib/               # DB, auth, cashback, referral logic
└── types/
```

## Key Features

### MVP (Current)
- [x] Auth (register, login)
- [x] Product catalog
- [x] Referral links (`/ref/{code}`)
- [x] Dashboard (stats, referral URL)
- [x] Cashback logic (14-day hold)
- [x] Admin layout & dashboard
- [x] i18n (EN / RU / UK)
- [x] Checkout & order creation
- [x] Admin products CRUD (images add/delete, description)
- [x] Checkout: Nova Poshta / Courier delivery (city, department or full address)
- [x] Language switcher only in header
- [x] Homepage: hide "Join" when logged in, prominent catalog button
- [x] Login redirect to home page
- [x] Free iPhone for 20 referrals: admin manual verify & grant (refs must have purchased in last year)

### Phase 2
- [ ] Checkout & payments (Stripe)
- [ ] Order management (status, tracking, IMEI)
- [ ] Full admin CRUD
- [ ] Email notifications

*Cashback accumulates toward free iPhone — no payout/withdrawal.*

### Phase 3
- [ ] 2FA, OAuth
- [ ] Advanced analytics
- [ ] PWA

## Referral Program

| Active Referrals | Bonus      |
|------------------|------------|
| 10               | $50        |
| 15               | $100       |
| 20               | Free iPhone|

**Free iPhone (20 refs):** Manual verification in admin. User must have 20 referrals who purchased (DELIVERED order) within the last 12 months. Admin reviews list and grants free iPhone (creates $0 order).

Cashback: 3-5% own purchase, 2-5% referral purchase (configurable in admin).

## License

Private
