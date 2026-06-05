export type Iphone17Model = "17" | "Air" | "17 Pro" | "17 Pro Max";

export type Iphone17ProductDef = {
  model: Iphone17Model;
  storage: string;
  color: string;
  price: number;
};

const IPHONE17_COLORS = ["Black", "White", "Mist Blue", "Sage", "Lavender"] as const;
const IPHONE_AIR_COLORS = ["Space Black", "Cloud White", "Light Gold", "Sky Blue"] as const;
const IPHONE_PRO_COLORS = ["Silver", "Deep Blue", "Cosmic Orange"] as const;

const PRICES: Record<Iphone17Model, Record<string, number>> = {
  "17": { "256GB": 799, "512GB": 1029 },
  Air: { "256GB": 999, "512GB": 1199, "1TB": 1399 },
  "17 Pro": { "256GB": 1099, "512GB": 1299, "1TB": 1499 },
  "17 Pro Max": { "256GB": 1199, "512GB": 1399, "1TB": 1599, "2TB": 1999 },
};

const STORAGE_BY_MODEL: Record<Iphone17Model, readonly string[]> = {
  "17": ["256GB", "512GB"],
  Air: ["256GB", "512GB", "1TB"],
  "17 Pro": ["256GB", "512GB", "1TB"],
  "17 Pro Max": ["256GB", "512GB", "1TB", "2TB"],
};

const COLORS_BY_MODEL: Record<Iphone17Model, readonly string[]> = {
  "17": IPHONE17_COLORS,
  Air: IPHONE_AIR_COLORS,
  "17 Pro": IPHONE_PRO_COLORS,
  "17 Pro Max": IPHONE_PRO_COLORS,
};

export type Iphone17ImageAsset = {
  model: Iphone17Model;
  color: string;
  folder: string;
  file: string;
  appleAsset: string;
};

function colorSlug(color: string): string {
  return color.toLowerCase().replace(/\s/g, "-");
}

function modelFolder(model: Iphone17Model): string {
  if (model === "17") return "base";
  if (model === "Air") return "air";
  if (model === "17 Pro") return "pro";
  return "pro-max";
}

/** Official Apple store finish-select assets (one per model + color). */
export const IPHONE17_IMAGE_ASSETS: Iphone17ImageAsset[] = [
  // iPhone 17
  { model: "17", color: "Black", folder: "base", file: "black", appleAsset: "iphone-17-finish-select-black-202509_AV2" },
  { model: "17", color: "White", folder: "base", file: "white", appleAsset: "iphone-17-finish-select-white-202509_AV2" },
  { model: "17", color: "Mist Blue", folder: "base", file: "mist-blue", appleAsset: "iphone-17-finish-select-mistblue-202509_AV2" },
  { model: "17", color: "Sage", folder: "base", file: "sage", appleAsset: "iphone-17-finish-select-sage-202509_AV2" },
  { model: "17", color: "Lavender", folder: "base", file: "lavender", appleAsset: "iphone-17-finish-select-lavender-202509_AV2" },
  // iPhone Air
  { model: "Air", color: "Space Black", folder: "air", file: "space-black", appleAsset: "iphone-air-finish-select-spaceblack-202509_AV2" },
  { model: "Air", color: "Cloud White", folder: "air", file: "cloud-white", appleAsset: "iphone-air-finish-select-cloudwhite-202509_AV2" },
  { model: "Air", color: "Light Gold", folder: "air", file: "light-gold", appleAsset: "iphone-air-finish-select-lightgold-202509_AV2" },
  { model: "Air", color: "Sky Blue", folder: "air", file: "sky-blue", appleAsset: "iphone-air-finish-select-skyblue-202509_AV2" },
  // iPhone 17 Pro
  { model: "17 Pro", color: "Silver", folder: "pro", file: "silver", appleAsset: "iphone-17-pro-finish-select-silver-202509_AV2" },
  { model: "17 Pro", color: "Deep Blue", folder: "pro", file: "deep-blue", appleAsset: "iphone-17-pro-finish-select-deepblue-202509_AV2" },
  { model: "17 Pro", color: "Cosmic Orange", folder: "pro", file: "cosmic-orange", appleAsset: "iphone-17-pro-finish-select-cosmicorange-202509_AV2" },
  // iPhone 17 Pro Max
  { model: "17 Pro Max", color: "Silver", folder: "pro-max", file: "silver", appleAsset: "iphone-17-pro-max-finish-select-silver-202509_AV2" },
  { model: "17 Pro Max", color: "Deep Blue", folder: "pro-max", file: "deep-blue", appleAsset: "iphone-17-pro-max-finish-select-deepblue-202509_AV2" },
  { model: "17 Pro Max", color: "Cosmic Orange", folder: "pro-max", file: "cosmic-orange", appleAsset: "iphone-17-pro-max-finish-select-cosmicorange-202509_AV2" },
];

const imageByModelColor = new Map(
  IPHONE17_IMAGE_ASSETS.map((a) => [`${a.model}::${a.color}`, `/images/iphone-17/${a.folder}/${a.file}.png`])
);

export function getIphone17Images(model: Iphone17Model, color: string): string[] {
  const image = imageByModelColor.get(`${model}::${color}`);
  if (image) return [image];
  return [`/images/iphone-17/${modelFolder(model)}/${colorSlug(color)}.png`];
}

export function buildIphone17Slug(model: Iphone17Model, storage: string, color: string): string {
  const modelSlug = model.toLowerCase().replace(/\s/g, "-");
  return `iphone-${modelSlug}-${storage.toLowerCase()}-${color.toLowerCase().replace(/\s/g, "-")}`;
}

export function buildIphone17Name(model: Iphone17Model, storage: string, color: string): string {
  const label = model === "Air" ? "iPhone Air" : `iPhone ${model}`;
  return `${label} ${storage} ${color}`;
}

export function getIphone17Specs(model: Iphone17Model, storage: string): Record<string, string> {
  const byModel: Record<Iphone17Model, Record<string, string>> = {
    "17": {
      display: '6.3" Super Retina XDR',
      processor: "A19",
      camera: "48MP Dual Fusion",
      battery: "Up to 30h video",
    },
    Air: {
      display: '6.5" Super Retina XDR',
      processor: "A19 Pro",
      camera: "48MP Fusion",
      battery: "Up to 27h video",
    },
    "17 Pro": {
      display: '6.3" Super Retina XDR',
      processor: "A19 Pro",
      camera: "48MP Pro Fusion (3 lenses)",
      battery: "Best Pro battery life",
    },
    "17 Pro Max": {
      display: '6.9" Super Retina XDR',
      processor: "A19 Pro",
      camera: "48MP Pro Fusion (3 lenses, 8× zoom)",
      battery: "Up to 39h video",
    },
  };

  return { ...byModel[model], storage };
}

function buildVariants(model: Iphone17Model): Iphone17ProductDef[] {
  const variants: Iphone17ProductDef[] = [];
  for (const storage of STORAGE_BY_MODEL[model]) {
    for (const color of COLORS_BY_MODEL[model]) {
      variants.push({
        model,
        storage,
        color,
        price: PRICES[model][storage],
      });
    }
  }
  return variants;
}

/** All iPhone 17 lineup SKUs: 43 products (10 + 12 + 9 + 12). */
export const IPHONE17_CATALOG: Iphone17ProductDef[] = [
  ...buildVariants("17"),
  ...buildVariants("Air"),
  ...buildVariants("17 Pro"),
  ...buildVariants("17 Pro Max"),
];
