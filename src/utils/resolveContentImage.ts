const imageEntries = import.meta.glob('/src/content/realizacje/img/**/*', { eager: true });

export const resolveContentImage = (path?: string | null) => {
  if (!path) return null;

  let normalized = path.trim();
  if (!normalized.startsWith('/src/')) {
    if (normalized.startsWith('/')) {
      normalized = `/src${normalized}`;
    } else {
      normalized = `/src/content/realizacje/img/${normalized}`;
    }
  }

  return imageEntries[normalized]?.default ?? null;
};
