import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://kalendarz4x4.pl/zawody";
const SOURCE_ORIGIN = "https://kalendarz4x4.pl";
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eventsDir = path.join(projectRoot, "src", "content", "imprezy");
const imagesDir = path.join(eventsDir, "img");

const decodeHtml = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-f]+);/gi, (_, num) => String.fromCharCode(parseInt(num, 16)));

const stripTags = (value = "") => decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const esc = (value = "") => String(value).replace(/"/g, '\\"');

const extractDivBlock = (html, className) => {
  const marker = `<div class="${className}">`;
  const start = html.indexOf(marker);
  if (start < 0) return "";

  let i = start;
  let depth = 0;
  while (i < html.length) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose < 0) break;

    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
      continue;
    }

    depth -= 1;
    i = nextClose + 6;
    if (depth === 0) {
      return html.slice(start + marker.length, nextClose);
    }
  }
  return "";
};

const detailHtmlToMarkdown = (html = "") => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>\s*<div>/gi, "\n\n")
    .replace(/<div>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<ul[^>]*>/gi, "")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<ol[^>]*>/gi, "")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "");

  return decodeHtml(normalized)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const toIso = (ddmmyyyy) => {
  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

const parseDates = (rawText = "") => {
  const clean = stripTags(rawText).replace(/\s+/g, " ");
  const matches = [...clean.matchAll(/(\d{2}-\d{2}-\d{4})/g)].map((m) => m[1]);
  if (!matches.length) return { start: null, end: null };
  const start = toIso(matches[0]);
  const end = toIso(matches[1] ?? matches[0]);
  return { start, end };
};

const toAbsoluteUrl = (value = "") => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SOURCE_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
};

const parseCards = (html) => {
  const cardRegex = /<div class="card mb-3 border-0">[\s\S]*?<\/div>\s*<\/a>\s*<\/div>/g;
  const cards = html.match(cardRegex) ?? [];

  return cards
    .map((cardHtml) => {
      const href = cardHtml.match(/<a[^>]+href="([^"]+)"/i)?.[1] ?? "";
      const slug = href.split("/").filter(Boolean).pop() ?? "";
      const titleRaw = cardHtml.match(/<h5 class="card-title fw-bolder">([\s\S]*?)<\/h5>/i)?.[1] ?? "";
      const title = stripTags(titleRaw);
      const imgSrc = cardHtml.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? "";
      const locationRaw = cardHtml.match(/<small class="fw-semibold">([\s\S]*?)<\/small>/i)?.[1] ?? "";
      const location = stripTags(locationRaw);
      const dateRaw = cardHtml.match(/<small class="text-muted">([\s\S]*?)<\/small>/i)?.[1] ?? "";
      const descriptionRaw = cardHtml.match(/<p class="pt-2">([\s\S]*?)<\/p>/i)?.[1] ?? "";
      const description = stripTags(descriptionRaw).replace(/\s+\.\.\.$/, "").trim();
      const { start, end } = parseDates(dateRaw);

      if (!slug || !title || !start) return null;
      return {
        slug,
        sourceUrl: toAbsoluteUrl(href),
        imageUrl: toAbsoluteUrl(imgSrc),
        title,
        description,
        fullDescription: "",
        location: location || "Do uzupelnienia",
        dateStart: start,
        dateEnd: end ?? start,
      };
    })
    .filter(Boolean);
};

const ensureDirs = async () => {
  await fs.mkdir(eventsDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
};

const guessOriginalImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const match = imageUrl.match(/\/media\/_c\/images\/([a-f0-9]{32})\//i);
  if (!match) return null;
  return `${SOURCE_ORIGIN}/media/images/${match[1]}.jpg`;
};

const downloadImageFromUrl = async (slug, imageUrl) => {
  const response = await fetch(imageUrl, { redirect: "follow" });
  if (!response.ok) return null;
  const contentType = response.headers.get("content-type") ?? "";
  let ext = path.extname(new URL(imageUrl).pathname).toLowerCase();
  if (!ext) {
    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("webp")) ext = ".webp";
    else ext = ".jpg";
  }
  const filename = `${slug}${ext}`;
  const outputPath = path.join(imagesDir, filename);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  return `/content/imprezy/img/${filename}`;
};

const maybeDownloadImage = async (slug, imageUrl) => {
  if (!imageUrl) return null;
  const candidates = [guessOriginalImageUrl(imageUrl), imageUrl].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const saved = await downloadImageFromUrl(slug, candidate);
      if (saved) return saved;
    } catch {
      // try next candidate
    }
  }
  return null;
};

const fetchEventDetails = async (sourceUrl) => {
  if (!sourceUrl) return "";
  try {
    const response = await fetch(sourceUrl, { redirect: "follow" });
    if (!response.ok) return { fullDescription: "", detailImageUrl: null };
    const html = await response.text();
    const detailBlock = extractDivBlock(html, "card-text text-break");
    const fullDescription = detailHtmlToMarkdown(detailBlock);
    const detailImageRaw =
      html.match(/<img[^>]+class="[^"]*event-main-image[^"]*"[^>]+src="([^"]+)"/i)?.[1] ??
      html.match(/<img[^>]+src="([^"]+)"[^>]+class="[^"]*event-main-image[^"]*"/i)?.[1] ??
      null;
    return {
      fullDescription,
      detailImageUrl: toAbsoluteUrl(detailImageRaw),
    };
  } catch {
    return { fullDescription: "", detailImageUrl: null };
  }
};

const writeEventFile = async (event, localImagePath) => {
  const filePath = path.join(eventsDir, `${event.slug}.md`);
  const bodyDescription = event.fullDescription || event.description || "Szczegoly wydarzenia dostepne na stronie organizatora.";
  const body = `## Opis\n\n${bodyDescription}\n\n## Zrodlo\n\n[Zobacz ogloszenie](${event.sourceUrl})`;

  const fm = [
    "---",
    `title: "${esc(event.title)}"`,
    `description: "${esc(event.description || "Wydarzenie offroadowe z kalendarz4x4.pl.")}"`,
    `dateStart: ${event.dateStart}`,
    `dateEnd: ${event.dateEnd}`,
    `location: "${esc(event.location)}"`,
    `region: "Polska"`,
    `organizer: "kalendarz4x4.pl"`,
    `type: "zawody"`,
    `status: "zewnetrzne"`,
    localImagePath ? `tileImage: "${localImagePath}"` : null,
    "---",
    "",
    body,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  await fs.writeFile(filePath, fm, "utf-8");
};

const run = async () => {
  await ensureDirs();
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Nie udalo sie pobrac zrodla: HTTP ${response.status}`);
  }

  const html = await response.text();
  const events = parseCards(html);
  if (!events.length) {
    throw new Error("Nie znaleziono wydarzen na stronie zrodlowej.");
  }

  let created = 0;
  for (const event of events) {
    const details = await fetchEventDetails(event.sourceUrl);
    event.fullDescription = details.fullDescription;
    const imagePath = await maybeDownloadImage(event.slug, details.detailImageUrl ?? event.imageUrl);
    await writeEventFile(event, imagePath);
    created += 1;
  }

  console.log(`Zaimportowano/odswiezono ${created} wydarzen do src/content/imprezy.`);
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
