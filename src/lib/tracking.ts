/** Infer carrier tracking URL from shippingAddress prefix encoded at checkout. */
export function getTrackingUrl(
  shippingAddress: string | null | undefined,
  trackingNumber: string | null | undefined
): string | null {
  const num = trackingNumber?.trim();
  if (!num) return null;
  const addr = (shippingAddress ?? "").trim();
  const encoded = encodeURIComponent(num);

  if (addr.startsWith("Укрпошта:")) {
    return `https://track.ukrposhta.ua/tracking_ua#${encoded}`;
  }
  if (addr.startsWith("Meest:")) {
    return `https://t.meest-group.com/?track_number=${encoded}`;
  }
  if (addr.startsWith("Нова Пошта:") || !addr) {
    // Empty address: historical default was Nova Poshta
    return `https://novaposhta.ua/tracking/?cargo_number=${encoded}`;
  }
  return null;
}

export type TrackingLocale = "en" | "ru" | "uk";

export function getTrackingLinkLabel(
  shippingAddress: string | null | undefined,
  locale: TrackingLocale = "en"
): string {
  const addr = (shippingAddress ?? "").trim();
  if (addr.startsWith("Укрпошта:")) {
    return locale === "ru" ? "Отследить на Укрпочте" : locale === "uk" ? "Відстежити на Укрпошті" : "Track on Ukrposhta";
  }
  if (addr.startsWith("Meest:")) {
    return locale === "ru" ? "Отследить на Meest" : locale === "uk" ? "Відстежити на Meest" : "Track on Meest";
  }
  if (addr.startsWith("Нова Пошта:") || !addr) {
    return locale === "ru" ? "Отследить на Новой Почте" : locale === "uk" ? "Відстежити на Новій Пошті" : "Track on Nova Poshta";
  }
  return locale === "ru" ? "Отследить" : locale === "uk" ? "Відстежити" : "Track";
}
