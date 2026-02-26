"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const DEFAULT_PRIVACY = `
<h2>Політика конфіденційності</h2>
<p>Цей документ описує, як ми збираємо, використовуємо та захищаємо вашу особисту інформацію.</p>
<h3>1. Збір інформації</h3>
<p>Ми збираємо інформацію, яку ви надаєте при реєстрації: email, ім'я, телефон. Також автоматично збираються технічні дані (IP, тип браузера) для покращення сервісу.</p>
<h3>2. Використання</h3>
<p>Дані використовуються для обробки замовлень, комунікації з вами та покращення якості обслуговування.</p>
<h3>3. Захист</h3>
<p>Ми застосовуємо шифрування та надійні методи зберігання даних.</p>
<h3>4. Контакти</h3>
<p>З питань конфіденційності звертайтесь через форму "Перезвоните мне" або месенджери.</p>
`;

export default function PrivacyPage() {
  const { t } = useI18n();
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    fetch("/api/public/site")
      .then((r) => r.json())
      .then((data) => setHtml(data.privacy_policy || DEFAULT_PRIVACY))
      .catch(() => setHtml(DEFAULT_PRIVACY));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
        ← {t("home")}
      </Link>
      <article
        className="prose prose-zinc mt-6 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
