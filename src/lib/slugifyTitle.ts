const polishMap: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ż: "z",
  ź: "z",
  Ą: "a",
  Ć: "c",
  Ę: "e",
  Ł: "l",
  Ń: "n",
  Ó: "o",
  Ś: "s",
  Ż: "z",
  Ź: "z",
};

type SlugSource =
  | string
  | {
      slug?: string;
      label?: string;
      name?: string;
      title?: string;
    };

const coerceSlugSource = (value: SlugSource) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if (typeof value.slug === "string") return value.slug;
    if (typeof value.label === "string") return value.label;
    if (typeof value.name === "string") return value.name;
    if (typeof value.title === "string") return value.title;
  }
  return String(value ?? "");
};

export function slugifyTitle(value: SlugSource) {
  const normalized = coerceSlugSource(value)
    .split("")
    .map((char) => polishMap[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}
