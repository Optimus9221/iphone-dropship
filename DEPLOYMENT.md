# Production Deployment

Общая архитектура (Vercel, Neon, Resend, админка): **[docs/PROJECT-OVERVIEW.md](docs/PROJECT-OVERVIEW.md)**.

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
| **NEXT_PUBLIC_SITE_URL** | Тот же канонический URL сайта для **ссылок в письмах** (оплата, заказы и т.д.). Если не задать, на Vercel подставится `https://….vercel.app`. | `https://phonefree.uk` |
| **NEXT_PUBLIC_SITE_URL** | Публичный URL сайта в **ссылках в письмах** (оплата, заказы, сброс пароля). Если не задать, на Vercel в письма попадёт `https://xxx.vercel.app`. Должен совпадать с основным доменом (например `https://phonefree.uk`). | `https://phonefree.uk` |
| **ADMIN_PASSWORD** | Пароль админа при `npm run db:seed`. Мин. 12 символов. | `YourStr0ng!Pass123` |

### Почта (для продакшена фактически обязательны)

| Переменная | Для чего |
|------------|----------|
| **RESEND_API_KEY** | Регистрация с подтверждением email (код), сброс пароля, письма по заказам. Без ключа регистрация на проде не завершится отправкой кода. |
| **EMAIL_FROM** | Адрес отправителя; на проде лучше свой домен, верифицированный в Resend. Локально по умолчанию может использоваться `onboarding@resend.dev`. |
| **NEXT_PUBLIC_SITE_NAME** | Название сайта в письмах. По умолчанию "PhoneFree". |
| **NEXT_PUBLIC_SITE_URL** | URL в ссылках писем. По умолчанию localhost. |
| **NOVA_POSHTA_API_KEY** | Ключ API Новой Почты для автокомплита города/отделения в чекауте ([my.novaposhta.ua](https://my.novaposhta.ua)). Без ключа подсказки могут быть недоступны. |

---

## Checklist перед продом

1. [ ] Создать PostgreSQL (Neon, Supabase, Railway и т.п.)
2. [ ] Добавить `DATABASE_URL` в переменные хостинга
3. [ ] Сгенерировать и добавить `NEXTAUTH_SECRET`
4. [ ] Установить `NEXTAUTH_URL` = `https://твой-домен.com`
5. [ ] Установить `NEXT_PUBLIC_SITE_URL` = тот же публичный URL (чтобы в письмах не был `*.vercel.app`)
6. [ ] Добавить `ADMIN_PASSWORD` (надёжный пароль)
7. [ ] (Опционально) Добавить `RESEND_API_KEY` для email
8. [ ] После деплоя: выполнить миграции и seed (см. ниже)

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

---

## Копия продовой БД на ПК для разработки

Пошагово: **[docs/LOCAL-PROD-DB-DUMP.md](docs/LOCAL-PROD-DB-DUMP.md)** — дамп через `pg_dump`, восстановление в локальный PostgreSQL, скрипты `scripts/pg-dump-prod.ps1` и `scripts/pg-restore-local.ps1`.
