export const AVATAR_ANIMALS = ["cat", "dog", "rabbit"] as const;

export type AvatarAnimal = (typeof AVATAR_ANIMALS)[number];

export type AvatarPalette = {
  name: string;
  fur: string;
  inner: string;
  patch: string;
  background: string;
};

export const AVATAR_PALETTES: Record<AvatarAnimal, AvatarPalette[]> = {
  cat: [
    { name: "Ginger cat", fur: "#F3C79B", inner: "#F6C9D3", patch: "#E0A672", background: "#FDF1F3" },
    { name: "Gray cat", fur: "#C9CDD3", inner: "#F6C9D3", patch: "#9EA5AF", background: "#EEF5F8" },
    { name: "Cream cat", fur: "#FFF3DF", inner: "#F6C9D3", patch: "#E9CDA8", background: "#EFF6EF" },
    { name: "Black cat", fur: "#6B6260", inner: "#E9B1BE", patch: "#4E4644", background: "#F3EADF" },
  ],
  dog: [
    { name: "Golden puppy", fur: "#E8C08A", inner: "#FFF3DF", patch: "#C99A62", background: "#EEF5F8" },
    { name: "Chocolate puppy", fur: "#B98E6B", inner: "#EAD7C3", patch: "#8C6648", background: "#FDF1F3" },
    { name: "Spotty puppy", fur: "#FFFDF8", inner: "#F3E3C3", patch: "#A89488", background: "#EFF6EF" },
    { name: "Gray puppy", fur: "#B8BEC6", inner: "#EEF0F2", patch: "#8E959E", background: "#F3EADF" },
  ],
  rabbit: [
    { name: "Snow bunny", fur: "#FFFDF8", inner: "#F6C9D3", patch: "#FFFDF8", background: "#EEF5F8" },
    { name: "Gray bunny", fur: "#C9CDD3", inner: "#F6C9D3", patch: "#C9CDD3", background: "#FDF1F3" },
    { name: "Caramel bunny", fur: "#D9B99B", inner: "#F6C9D3", patch: "#D9B99B", background: "#EFF6EF" },
    { name: "Peach bunny", fur: "#F8DDE3", inner: "#F2B8C6", patch: "#F8DDE3", background: "#F3EADF" },
  ],
};

export const DEFAULT_AVATAR = "cat-0";

export const AVATAR_OPTIONS = AVATAR_ANIMALS.flatMap((animal) =>
  AVATAR_PALETTES[animal].map((_, variant) => `${animal}-${variant}`),
);

export function parseAvatar(value: string | null | undefined) {
  const [animal, rawVariant] = (value ?? DEFAULT_AVATAR).split("-");
  const variant = Number(rawVariant);
  const isKnownAnimal = (AVATAR_ANIMALS as readonly string[]).includes(animal);

  if (!isKnownAnimal || !Number.isInteger(variant) || !AVATAR_PALETTES[animal as AvatarAnimal][variant]) {
    return { animal: "cat" as AvatarAnimal, variant: 0, palette: AVATAR_PALETTES.cat[0] };
  }

  return {
    animal: animal as AvatarAnimal,
    variant,
    palette: AVATAR_PALETTES[animal as AvatarAnimal][variant],
  };
}