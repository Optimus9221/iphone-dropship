"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { ProductPrice } from "@/components/product-price";
import { PhoneBackground } from "@/components/phone-background";
import { AutocompleteField } from "@/components/autocomplete-field";
import { displayCashbackAmount, DEFAULT_OWN_CASHBACK_PERCENT } from "@/lib/cashback-display";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  cashbackPercent?: number;
};

function CheckoutContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const productId = searchParams.get("product");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "cashback">("crypto");
  const [cashbackPreview, setCashbackPreview] = useState<{
    orderTotal: number;
    availableCashback: number;
    canPayWithCashback: boolean;
    hasActivePayout: boolean;
  } | null>(null);
  const [npCityRef, setNpCityRef] = useState("");
  const [npCityLabel, setNpCityLabel] = useState("");
  const [npWarehouseLabel, setNpWarehouseLabel] = useState("");
  const [form, setForm] = useState({
    deliveryMethod: "nova_poshta" as "nova_poshta" | "courier",
    shippingName: "",
    shippingAddress: "",
    novaPoshtaCity: "",
    novaPoshtaDepartment: "",
    shippingPhone: "",
    shippingEmail: session?.user?.email ?? "",
    comment: "",
  });

  useEffect(() => {
    if (productId) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((list: Product[]) => list.find((p) => p.id === productId) ?? null)
        .then(setProduct)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (session?.user?.email) {
      setForm((f) => ({ ...f, shippingEmail: session.user?.email ?? f.shippingEmail }));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === "authenticated" && productId) {
      fetch(`/api/checkout/cashback-preview?productId=${productId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.orderTotal != null) setCashbackPreview(data);
        })
        .catch(() => setCashbackPreview(null));
    }
  }, [status, productId]);

  const fetchCities = useCallback(async (query: string) => {
    const res = await fetch(`/api/nova-poshta/cities?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ ref: string; label: string }>;
    if (!Array.isArray(data)) return [];
    return data.map((c) => ({ value: c.ref, label: c.label }));
  }, []);

  const fetchWarehouses = useCallback(
    async (query: string) => {
      if (!npCityRef) return [];
      const params = new URLSearchParams({ cityRef: npCityRef });
      if (query) params.set("q", query);
      const res = await fetch(`/api/nova-poshta/warehouses?${params}`);
      if (!res.ok) return [];
      const data = (await res.json()) as Array<{ ref: string; label: string }>;
      if (!Array.isArray(data)) return [];
      return data.map((w) => ({ value: w.ref, label: w.label }));
    },
    [npCityRef]
  );

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)]">
        <PhoneBackground patternId="phones-checkout" />
        <div className="relative mx-auto max-w-xl px-4 py-12">
          <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="relative min-h-[calc(100vh-4rem)]">
        <PhoneBackground patternId="phones-checkout" />
        <div className="relative mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white">{t("checkoutTitle")}</h1>
          <p className="mt-4 text-slate-400">{t("checkoutSignIn")}</p>
          <Link
            href={`/login?callbackUrl=/checkout?product=${productId ?? ""}`}
            data-testid="pf-checkout-login-link"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            {t("signIn")}
          </Link>
          <Link href="/catalog" data-testid="pf-checkout-catalog-link" className="mt-4 block text-slate-400 hover:text-white hover:underline">
            {t("backToCatalog")}
          </Link>
        </div>
      </div>
    );
  }

  if (!productId || !product) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)]">
        <PhoneBackground patternId="phones-checkout" />
        <div className="relative mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white">{t("checkoutTitle")}</h1>
          <p className="mt-4 text-slate-400">{t("checkoutSelectProductFirst")}</p>
          <Link href="/catalog" data-testid="pf-checkout-catalog-link" className="mt-6 inline-block text-emerald-400 hover:underline">
            {t("backToCatalog")}
          </Link>
        </div>
      </div>
    );
  }

  const cashback = displayCashbackAmount(
    product.price,
    product.cashbackPercent ?? DEFAULT_OWN_CASHBACK_PERCENT
  );

  const getOrderErrorMessage = (errorCode: string) => {
    const keys: Record<
      string,
      | "orderError_product_not_found"
      | "orderError_product_not_available"
      | "orderError_failed"
      | "checkoutInsufficientCashback"
      | "cashbackWithdrawActive"
    > = {
      product_not_found: "orderError_product_not_found",
      product_not_available: "orderError_product_not_available",
      insufficient_cashback: "checkoutInsufficientCashback",
      active_payout_exists: "cashbackWithdrawActive",
      failed: "orderError_failed",
    };
    return t(keys[errorCode] ?? "orderError_failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (form.deliveryMethod === "nova_poshta") {
      if (!form.novaPoshtaCity.trim() || !form.novaPoshtaDepartment.trim()) {
        setFieldErrors({ shippingAddress: t("orderError_validation_address") });
        setError(t("orderError_validation"));
        return;
      }
    }

    setSubmitting(true);
    const shippingAddress =
      form.deliveryMethod === "nova_poshta"
        ? `Нова Пошта: ${form.novaPoshtaCity}, ${form.novaPoshtaDepartment}`
        : form.shippingAddress;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          shippingName: form.shippingName,
          shippingAddress,
          shippingPhone: form.shippingPhone,
          shippingEmail: form.shippingEmail,
          comment: form.comment || undefined,
          payWithCashback: paymentMethod === "cashback",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const code = data.errorCode ?? "failed";
        if (code === "validation" && data.details?.fieldErrors) {
          const next: Record<string, string> = {};
          const map: Record<string, "orderError_validation_name" | "orderError_validation_address" | "orderError_validation_phone" | "orderError_validation_email"> = {
            shippingName: "orderError_validation_name",
            shippingAddress: "orderError_validation_address",
            shippingPhone: "orderError_validation_phone",
            shippingEmail: "orderError_validation_email",
          };
          for (const [field, msgs] of Object.entries(data.details.fieldErrors) as [string, string[]][]) {
            const key = map[field];
            if (key && msgs?.length) next[field] = t(key);
          }
          setFieldErrors(next);
          setError(t("orderError_validation"));
        } else {
          setError(getOrderErrorMessage(code));
        }
        return;
      }
      router.push("/dashboard/orders");
    } catch {
      setError(t("orderError_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputErrorClass = (field: string) =>
    fieldErrors[field] ? "border-red-500 focus:border-red-500" : "border-white/20 focus:border-emerald-500";

  const steps = [
    { label: t("checkoutStep1"), done: true },
    { label: t("checkoutStep2"), done: false, active: true },
    { label: t("checkoutStep3"), done: false },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <PhoneBackground patternId="phones-checkout" />
      <div className="relative mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/product/${product.slug}`} data-testid="pf-checkout-back-to-product" className="text-sm text-slate-400 hover:text-white hover:underline">
          {t("backToCatalog")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{t("checkoutTitle")}</h1>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  step.done ? "bg-emerald-500 text-white" : step.active ? "border-2 border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border border-white/20 bg-white/5 text-slate-500"
                }`}
              >
                {step.done ? "✓" : i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${step.active ? "font-medium text-white" : "text-slate-500"}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className="hidden h-px flex-1 bg-white/20 sm:block" />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
        >
          <div className="flex gap-4">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-20 w-20 rounded-lg bg-white/5 object-contain p-1"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-white/10" />
            )}
            <div>
              <p className="font-medium text-white">{product.name}</p>
              <ProductPrice
                price={product.price}
                className="text-lg font-bold text-white"
                uahClassName="text-sm font-normal text-slate-400"
              />
              <p className="text-sm text-emerald-400">+${cashback} {t("cashbackOnPurchase")}</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h2 className="font-semibold text-white">{t("shippingDetails")}</h2>
          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <label className="block text-sm text-slate-400">{t("shippingName")}</label>
            <input
              type="text"
              data-testid="pf-checkout-shipping-name"
              required
              value={form.shippingName}
              onChange={(e) => { setForm((f) => ({ ...f, shippingName: e.target.value })); setFieldErrors((e2) => ({ ...e2, shippingName: "" })); }}
              className={`mt-1 w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${inputErrorClass("shippingName")}`}
              placeholder={t("placeholderName")}
            />
            {fieldErrors.shippingName && <p className="mt-1 text-sm text-red-400">{fieldErrors.shippingName}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400">{t("checkoutDeliveryMethod")}</label>
            <div className="mt-2 flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  data-testid="pf-checkout-delivery-nova-poshta"
                  checked={form.deliveryMethod === "nova_poshta"}
                  onChange={() => setForm((f) => ({ ...f, deliveryMethod: "nova_poshta" }))}
                />
                <span>{t("adminDeliveryNovaPoshta")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  data-testid="pf-checkout-delivery-courier"
                  checked={form.deliveryMethod === "courier"}
                  onChange={() => setForm((f) => ({ ...f, deliveryMethod: "courier" }))}
                />
                <span>{t("adminDeliveryCourier")}</span>
              </label>
            </div>
          </div>

          {form.deliveryMethod === "nova_poshta" ? (
            <>
              <AutocompleteField
                label={t("checkoutNovaPoshtaCity")}
                placeholder={t("checkoutPlaceholderCity")}
                valueLabel={npCityLabel}
                required
                testId="pf-checkout-nova-poshta-city"
                error={fieldErrors.shippingAddress && !form.novaPoshtaCity ? fieldErrors.shippingAddress : undefined}
                fetchOptions={fetchCities}
                onSelect={(opt) => {
                  setNpCityRef(opt?.value ?? "");
                  setNpCityLabel(opt?.label ?? "");
                  setNpWarehouseLabel("");
                  setForm((f) => ({
                    ...f,
                    novaPoshtaCity: opt?.label ?? "",
                    novaPoshtaDepartment: "",
                  }));
                  setFieldErrors((e2) => ({ ...e2, shippingAddress: "" }));
                }}
                onQueryChange={(query) => {
                  setNpCityRef("");
                  setNpCityLabel(query);
                  setForm((f) => ({ ...f, novaPoshtaCity: query, novaPoshtaDepartment: "" }));
                  setNpWarehouseLabel("");
                }}
              />
              <AutocompleteField
                label={t("checkoutNovaPoshtaDepartment")}
                placeholder={t("checkoutPlaceholderDepartment")}
                valueLabel={npWarehouseLabel}
                required
                disabled={!npCityRef}
                testId="pf-checkout-nova-poshta-department"
                error={fieldErrors.shippingAddress && !form.novaPoshtaDepartment ? fieldErrors.shippingAddress : undefined}
                minChars={0}
                fetchOptions={fetchWarehouses}
                onSelect={(opt) => {
                  setNpWarehouseLabel(opt?.label ?? "");
                  setForm((f) => ({ ...f, novaPoshtaDepartment: opt?.label ?? "" }));
                  setFieldErrors((e2) => ({ ...e2, shippingAddress: "" }));
                }}
                onQueryChange={(query) => {
                  setNpWarehouseLabel(query);
                  setForm((f) => ({ ...f, novaPoshtaDepartment: query }));
                }}
              />
              {!npCityRef && form.novaPoshtaCity.length >= 2 && (
                <p className="text-xs text-amber-300/90">{t("checkoutNovaPoshtaPickCity")}</p>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm text-slate-400">{t("checkoutCourierAddress")}</label>
              <input
                type="text"
                data-testid="pf-checkout-courier-address"
                required
                value={form.shippingAddress}
                onChange={(e) => { setForm((f) => ({ ...f, shippingAddress: e.target.value })); setFieldErrors((e2) => ({ ...e2, shippingAddress: "" })); }}
                className={`mt-1 w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${inputErrorClass("shippingAddress")}`}
                placeholder={t("checkoutPlaceholderAddress")}
              />
              {fieldErrors.shippingAddress && <p className="mt-1 text-sm text-red-400">{fieldErrors.shippingAddress}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400">{t("shippingPhone")}</label>
            <input
              type="tel"
              data-testid="pf-checkout-shipping-phone"
              required
              value={form.shippingPhone}
              onChange={(e) => { setForm((f) => ({ ...f, shippingPhone: e.target.value })); setFieldErrors((e2) => ({ ...e2, shippingPhone: "" })); }}
              className={`mt-1 w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${inputErrorClass("shippingPhone")}`}
              placeholder={t("phonePlaceholder")}
            />
            {fieldErrors.shippingPhone && <p className="mt-1 text-sm text-red-400">{fieldErrors.shippingPhone}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-400">{t("shippingEmail")}</label>
            <input
              type="email"
              data-testid="pf-checkout-shipping-email"
              required
              value={form.shippingEmail}
              onChange={(e) => { setForm((f) => ({ ...f, shippingEmail: e.target.value })); setFieldErrors((e2) => ({ ...e2, shippingEmail: "" })); }}
              className={`mt-1 w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${inputErrorClass("shippingEmail")}`}
              placeholder={t("placeholderEmail")}
            />
            {fieldErrors.shippingEmail && <p className="mt-1 text-sm text-red-400">{fieldErrors.shippingEmail}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-400">{t("comment")}</label>
            <textarea
              data-testid="pf-checkout-comment"
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-white">{t("checkoutPaymentMethod")}</h3>
            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  data-testid="pf-checkout-payment-crypto"
                  checked={paymentMethod === "crypto"}
                  onChange={() => setPaymentMethod("crypto")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-white">{t("checkoutPayCrypto")}</span>
                  <span className="text-sm text-slate-400">{t("checkoutPayCryptoHint")}</span>
                </span>
              </label>
              <label
                className={`flex items-start gap-3 ${
                  cashbackPreview?.canPayWithCashback ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  data-testid="pf-checkout-payment-cashback"
                  checked={paymentMethod === "cashback"}
                  disabled={!cashbackPreview?.canPayWithCashback}
                  onChange={() => setPaymentMethod("cashback")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-white">{t("checkoutPayCashback")}</span>
                  <span className="text-sm text-slate-400">
                    {cashbackPreview
                      ? t("checkoutPayCashbackBalance", {
                          available: cashbackPreview.availableCashback.toFixed(2),
                          total: cashbackPreview.orderTotal.toFixed(2),
                        })
                      : "…"}
                  </span>
                  {cashbackPreview && !cashbackPreview.canPayWithCashback && (
                    <span className="mt-1 block text-sm text-amber-300/90">
                      {cashbackPreview.hasActivePayout
                        ? t("cashbackWithdrawActive")
                        : t("checkoutInsufficientCashback")}
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            data-testid="pf-checkout-submit-button"
            disabled={submitting || (paymentMethod === "cashback" && !cashbackPreview?.canPayWithCashback)}
            className="w-full rounded-full bg-white py-4 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {submitting ? "..." : paymentMethod === "cashback" ? t("checkoutPlaceOrderCashback") : t("placeOrder")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
