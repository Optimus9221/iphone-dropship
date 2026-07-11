"use client";

import { useI18n } from "@/lib/i18n/context";
import { usdToUah } from "@/lib/currency";

type ProductPriceProps = {
  price: number;
  className?: string;
  uahClassName?: string;
};

export function ProductPrice({ price, className, uahClassName }: ProductPriceProps) {
  const { locale, t } = useI18n();
  const showUah = locale === "uk" || locale === "ru";

  return (
    <p className={className}>
      ${price}
      {showUah && (
        <span className={uahClassName}>
          {" "}
          {t("priceApproxUah", { uah: usdToUah(price) })}
        </span>
      )}
    </p>
  );
}
