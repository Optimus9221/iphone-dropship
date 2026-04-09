/**
 * Smoke test: verify-email → login → forgot-password flow (uses local API + Prisma).
 * Run: npx tsx scripts/smoke-auth-flow.ts
 * Requires: NEXT dev on http://localhost:3000 and DATABASE_URL in .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();

const CODE = "111111";
const PASSWORD = "SmokeTest1";
const NEW_PASSWORD = "SmokeTest2";

async function main() {
  const stamp = Date.now();
  const email = `smoke-${stamp}@example.com`;

  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Smoke",
      emailVerified: false,
      phone: null,
    },
  });

  const codeHash = await bcrypt.hash(CODE, 10);
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const v = await fetch(`${BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code: CODE }),
  });
  const vj = (await v.json().catch(() => ({}))) as { ok?: boolean };
  if (!v.ok || vj.ok !== true) {
    console.error("verify-email failed", v.status, vj);
    process.exit(1);
  }
  console.log("OK verify-email");

  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie?.() ?? [];
  const csrfJson = (await csrfRes.json()) as { csrfToken: string };
  const cookieHeader = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  const loginBody = new URLSearchParams({
    csrfToken: csrfJson.csrfToken,
    email,
    password: PASSWORD,
    callbackUrl: `${BASE}/`,
    json: "true",
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader,
    },
    body: loginBody.toString(),
    redirect: "manual",
  });

  if (loginRes.status !== 200 && loginRes.status !== 302) {
    const t = await loginRes.text();
    console.error("login failed", loginRes.status, t.slice(0, 500));
    process.exit(1);
  }
  console.log("OK login (credentials callback)");

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const resetToken = "smoke-reset-" + stamp;
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetRes = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: resetToken, newPassword: NEW_PASSWORD }),
  });
  if (!resetRes.ok) {
    const j = await resetRes.json().catch(() => ({}));
    console.error("reset-password failed", resetRes.status, j);
    process.exit(1);
  }
  console.log("OK reset-password");

  const csrf2 = await fetch(`${BASE}/api/auth/csrf`);
  const csrfCookies2 = csrf2.headers.getSetCookie?.() ?? [];
  const csrfJson2 = (await csrf2.json()) as { csrfToken: string };
  const cookieHeader2 = csrfCookies2.map((c) => c.split(";")[0]).join("; ");

  const login2Body = new URLSearchParams({
    csrfToken: csrfJson2.csrfToken,
    email,
    password: NEW_PASSWORD,
    callbackUrl: `${BASE}/`,
    json: "true",
  });

  const login2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader2,
    },
    body: login2Body.toString(),
    redirect: "manual",
  });

  if (login2.status !== 200 && login2.status !== 302) {
    console.error("login after reset failed", login2.status);
    process.exit(1);
  }
  console.log("OK login after password reset");

  await prisma.user.deleteMany({ where: { email } });
  console.log("Cleanup done. All smoke checks passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
