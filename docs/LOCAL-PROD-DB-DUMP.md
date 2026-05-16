# Локальная копия продовой БД (дамп → ПК → Postgres)

Смысл: снять **снимок** PostgreSQL с прода (Neon и т.п.), сохранить файл на диск и **восстановить** в локальный Postgres — дальше в `.env` указываешь локальный `DATABASE_URL` и работаешь через Prisma без риска для прода.

**Важно**

- В дампе будут **реальные email, телефоны, скрины оплат (data URL)** — храни файл только у себя, не коммить (папка `dumps/` уже в `.gitignore`).
- Лучше брать URL с **read-only** ролью в Neon, если создашь — только `SELECT` + `pg_dump` не пишет данные на прод, но с полным URL осторожнее с утечками.
- На время дампа прод **остаётся доступным**; это чтение через `pg_dump`, не «выключение» БД.

---

## Что нужно на ПК

1. **Клиент PostgreSQL** (`pg_dump`, `psql`) в `PATH`, **или** Docker (см. ниже).
2. Локальный Postgres — например Docker из README:
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=iphone_dropship postgres
   ```
3. Строка подключения к **проду**: скопируй из Vercel → Environment Variables → `DATABASE_URL` или из Neon (обычно с `?sslmode=require`).

Рекомендуется держать продовый URL **только в переменной окружения** на сеанс PowerShell, не класть в `.env`, который можно случайно закоммитить:

```powershell
$env:DATABASE_URL_PROD = "postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

---

## Вариант A: скрипты в репозитории (PowerShell)

Из корня `iphone-dropship`:

**1. Снять дамп** (файл попадёт в `dumps/…sql`):

```powershell
.\scripts\pg-dump-prod.ps1
# или явно:
.\scripts\pg-dump-prod.ps1 -ProdUrl $env:DATABASE_URL_PROD
```

**2. Восстановить в локальную БД** (по умолчанию `iphone_dropship`, пароль `postgres`):

```powershell
.\scripts\pg-restore-local.ps1 -DumpFile ".\dumps\iphone_dropship_prod_YYYYMMDD_HHMMSS.sql"
```

Опционально, если админ-URL к Postgres другой:

```powershell
.\scripts\pg-restore-local.ps1 -DumpFile ".\dumps\…sql" -LocalAdminUrl "postgresql://postgres:postgres@localhost:5432/postgres" -TargetDb "iphone_dropship"
```

**3. Локальный `.env`**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iphone_dropship"
```

**4. Prisma** (схема уже в дампе; при необходимости только клиент):

```bash
npx prisma generate
npm run dev
```

Если после восстановления Prisma ругается на рассинхрон — редко, но можно один раз `npx prisma db pull` только **против локальной** БД.

---

## Вариант B: только Docker (без установки pg_dump на Windows)

Дамп (подставь свой URL; каталог `dumps` создастся):

```powershell
New-Item -ItemType Directory -Force -Path .\dumps | Out-Null
docker run --rm -e PGDUMP_URL="$env:DATABASE_URL_PROD" -v "${PWD}/dumps:/out" postgres:16-alpine `
  sh -c 'pg_dump "$PGDUMP_URL" --no-owner --no-acl -f /out/prod.sql'
```

Восстановление — удобнее уже с установленным `psql` или вторым контейнером `postgres`, куда прогнать `psql -f`. Минимально: поставить [PostgreSQL CLI](https://www.postgresql.org/download/windows/) или использовать WSL.

---

## Обновить копию «как на проде сейчас»

Повтори шаг дампа (новый файл с меткой времени) и снова `pg-restore-local.ps1` — скрипт пересоздаёт базу `iphone_dropship` заново.

---

## Альтернатива: Neon «branch»

В Neon можно создать **ветку** БД — мгновенная копия для разработки, без файла на диске. Это не «ПК локально», но часто удобнее для экспериментов; для полностью офлайн-работы нужен именно дамп.
