# Production Deployment

## Где добавлять переменные окружения

Зависит от хостинга. Для Next.js чаще всего используется **Vercel**:

### Vercel

1. Открой [vercel.com](https://vercel.com) → свой проект
2. **Settings** → **Environment Variables**
3. Добавь каждую переменную: Name, Value, выбери Environment (Production, Preview, Development)

### Другие платформы

| Платформа | Где настройки |
|-----------|---------------|
| **Vercel** | Settings → Environment Variables |
| **Railway** | Project → Variables |
| **Render** | Dashboard → Environment |
| **Netlify** | Site settings → Environment variables |
| **Fly.io** | `fly secrets set KEY=value` |

---

## Переменные и для чего они нужны

### Обязательные

| Переменная | Для чего | Пример |
|------------|----------|--------|
| **DATABASE_URL** | Подключение к PostgreSQL. Без неё сайт не работает — нет БД. | `postgresql://user:pass@host:5432/db?sslmode=require` |
| **NEXTAUTH_SECRET** | Секрет для подписи JWT-сессий. Без него авторизация ненадёжна. | Сгенерировать: `openssl rand -base64 32` |
| **NEXTAUTH_URL** | URL продакшн-сайта. NextAuth использует его для callbacks. | `https://yourdomain.com` |
| **ADMIN_PASSWORD** | Пароль админа при `npm run db:seed`. Мин. 12 символов. | `YourStr0ng!Pass123` |

### Опциональные (email)

| Переменная | Для чего |
|------------|----------|
| **RESEND_API_KEY** | API-ключ Resend. Без него письма (подтверждение заказа, смена статуса) не отправляются. |
| **EMAIL_FROM** | Адрес отправителя. По умолчанию `onboarding@resend.dev` (бесплатный лимит). |
| **NEXT_PUBLIC_SITE_NAME** | Название сайта в письмах. По умолчанию "iPhone Store". |
| **NEXT_PUBLIC_SITE_URL** | URL в ссылках писем. По умолчанию localhost. |

---

## Checklist перед продом

1. [ ] Создать PostgreSQL (Neon, Supabase, Railway и т.п.)
2. [ ] Добавить `DATABASE_URL` в переменные хостинга
3. [ ] Сгенерировать и добавить `NEXTAUTH_SECRET`
4. [ ] Установить `NEXTAUTH_URL` = `https://твой-домен.com`
5. [ ] Добавить `ADMIN_PASSWORD` (надёжный пароль)
6. [ ] (Опционально) Добавить `RESEND_API_KEY` для email
7. [ ] После деплоя: выполнить миграции и seed (см. ниже)

---

## База данных после деплоя

На Vercel и похожих платформах БД не создаётся автоматически. Нужно один раз (и после каждого изменения schema.prisma):

1. **Синхронизация схемы:**
   ```bash
   npx prisma db push
   ```
   Локально с `DATABASE_URL` продакшн-БД. Добавляет новые таблицы (например `callback_requests`).

2. **Начальные данные (admin, товары):**
   ```bash
   npm run db:seed
   ```
   Убедись, что `ADMIN_PASSWORD` и `DATABASE_URL` заданы в окружении.

Можно вызывать seed из Vercel → Deployments → ... → Redeploy с нужным Build Command, либо локально с `DATABASE_URL` продакшн-БД.
