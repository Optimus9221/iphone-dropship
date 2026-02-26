"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

const DEFAULT_TERMS = `
<h2>Оферта та умови</h2>
<p>Ця оферта регулює умови покупки товарів у нашому магазині.</p>
<h3>1. Загальні положення</h3>
<p>Оформляючи замовлення, ви погоджуєтесь з умовами цієї оферти.</p>
<h3>2. Товари та ціни</h3>
<p>Ціни вказані у доларах США. Наявність та остаточну вартість підтверджуємо при обробці замовлення.</p>
<h3>3. Оплата та доставка</h3>
<p>Доставка здійснюється через Нову Пошту. Терміни — 7–14 днів з моменту відправлення.</p>
<h3>4. Гарантія</h3>
<p>Усі пристрої мають офіційну гарантію Apple 1 рік.</p>
<h3>5. Повернення</h3>
<p>Повернення здійснюється відповідно до законодавства України та політики Apple.</p>
<h3>6. Контакти</h3>
<p>Питання можна задати через форму "Перезвоните мне" або месенджери (WhatsApp, Telegram).</p>
`;

export default function TermsPage() {
  const { t } = useI18n();
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    fetch("/api/public/site")
      .then((r) => r.json())
      .then((data) => setHtml(data.terms_of_service || DEFAULT_TERMS))
      .catch(() => setHtml(DEFAULT_TERMS));
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
