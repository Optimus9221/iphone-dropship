const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

type NpResponse<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

async function npRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, string>
): Promise<{ success: boolean; data: T[]; errors: string[] }> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY ?? "";
  const res = await fetch(NP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Nova Poshta HTTP ${res.status}`);
  }

  const json = (await res.json()) as NpResponse<T | T[] | { Addresses?: T[] }>;
  const raw = json.data;
  let data: T[] = [];
  if (Array.isArray(raw)) {
    const first = raw[0] as { Addresses?: T[] } | undefined;
    if (first && Array.isArray(first.Addresses)) data = first.Addresses;
    else data = raw as T[];
  }

  return {
    success: Boolean(json.success),
    data,
    errors: json.errors ?? [],
  };
}

export type NpCity = {
  ref: string;
  label: string;
  name: string;
  area: string;
};

export type NpWarehouse = {
  ref: string;
  label: string;
  number: string | null;
};

export async function searchNpCities(query: string, limit = 15): Promise<NpCity[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const settlements = await npRequest<{
    Ref: string;
    DeliveryCity: string;
    MainDescription: string;
    Area: string;
    Present?: string;
  }>("Address", "searchSettlements", {
    CityName: q,
    Limit: String(limit),
    Page: "1",
  });

  if (settlements.success && settlements.data.length > 0) {
    return settlements.data.map((c) => ({
      ref: c.DeliveryCity || c.Ref,
      label: c.Present || [c.MainDescription, c.Area].filter(Boolean).join(", "),
      name: c.MainDescription,
      area: c.Area,
    }));
  }

  const cities = await npRequest<{
    Ref: string;
    Description: string;
    Area?: string;
    AreaDescription?: string;
  }>("Address", "getCities", {
    FindByString: q,
    Limit: String(limit),
  });

  if (!cities.success) {
    throw new Error(cities.errors.join("; ") || "Nova Poshta cities unavailable");
  }

  return cities.data.map((c) => ({
    ref: c.Ref,
    label: [c.Description, c.AreaDescription || c.Area].filter(Boolean).join(", "),
    name: c.Description,
    area: c.AreaDescription || c.Area || "",
  }));
}

export async function searchNpWarehouses(
  cityRef: string,
  query = "",
  limit = 40
): Promise<NpWarehouse[]> {
  if (!cityRef) return [];
  const props: Record<string, string> = {
    CityRef: cityRef,
    Limit: String(limit),
    Page: "1",
  };
  const q = query.trim();
  if (q) props.FindByString = q;

  const result = await npRequest<{
    Ref: string;
    Description: string;
    Number?: string;
  }>("Address", "getWarehouses", props);

  if (!result.success) {
    throw new Error(result.errors.join("; ") || "Nova Poshta warehouses unavailable");
  }

  return result.data.map((w) => ({
    ref: w.Ref,
    label: w.Description,
    number: w.Number ?? null,
  }));
}
