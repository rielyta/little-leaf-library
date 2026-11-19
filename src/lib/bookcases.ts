export const WOOD_KEYS = ["honey", "cream", "mint"] as const;

export type WoodKey = (typeof WOOD_KEYS)[number];

export const WOODS: Record<WoodKey, { label: string; light: string; dark: string }> = {
  honey: { label: "Honey wood", light: "#D9B99B", dark: "#C49A76" },
  cream: { label: "Cream wood", light: "#E6D3B8", dark: "#D2B794" },
  mint: { label: "Mint wood", light: "#CFE3D1", dark: "#A9C9AE" },
};

export const POT_COLORS = ["#F2B8C6", "#A9CCD8", "#BFD8C2", "#F3E3C3"];

export const BOOKCASE_NAME_MAX_LENGTH = 30;

export const SHELVES_PER_BOOKCASE = 3;

export type BookcaseSummary = {
  id: string;
  name: string;
  wood: WoodKey;
  bookCount: number;
};