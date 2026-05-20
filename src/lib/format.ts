const PESO_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const PESO_DETAILED = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("es-AR");

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const SHORT_DATE = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

export function formatPrice(value: number, opts?: { detailed?: boolean }) {
  if (!Number.isFinite(value)) return "—";
  return opts?.detailed
    ? PESO_DETAILED.format(value)
    : PESO_FORMATTER.format(Math.round(value));
}

export function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return DATE_FORMATTER.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return DATETIME_FORMATTER.format(new Date(value));
}

export function formatShortDate(value: string | Date) {
  return SHORT_DATE.format(new Date(value));
}

export function formatDiscount(price: number, salePrice: number) {
  if (!price || !salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

export function formatPhoneForWhatsapp(raw: string | null | undefined) {
  if (!raw) return null;
  return raw.replace(/\D/g, "");
}
