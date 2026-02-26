# Security Checklist

## ✅ Implemented

| Item | Status |
|------|--------|
| **Passwords** | bcrypt cost 12, min 8 chars, letters+numbers |
| **Admin password** | From `ADMIN_PASSWORD` env, min 12 chars |
| **NEXTAUTH_SECRET** | Random 32-byte, used for JWT signing |
| **Blocked users** | Cannot login |
| **Admin routes** | Protected, role check |
| **SQL injection** | Prisma ORM parameterized queries |
| **XSS** | React escaping, no `dangerouslySetInnerHTML` |
| **.env in .gitignore** | ✓ Not committed |
| **Credentials auth** | Generic "Invalid email or password" (no user enumeration) |

## ⚠️ Recommendations for Production

1. **Rate limiting** — Add on `/api/auth/*` and `/api/orders` (e.g. `@upstash/ratelimit`)
2. **HTTPS only** — Set `NEXTAUTH_URL` to `https://...`
3. **CSP headers** — Add Content-Security-Policy in `next.config`
4. **Image domains** — If using Next/Image for product URLs, restrict `images.domains`
5. **2FA** — Phase 3: TOTP for admin accounts
6. **Audit log** — Log admin actions (user edit, order status change)

## Credentials

- **Admin:** `admin@example.com` / password from `ADMIN_PASSWORD` in .env
- **Demo user:** `user@example.com` / `user123` (change in production)

**Never commit `.env` or share API keys.**
