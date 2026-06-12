import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const decodeEntities = (value) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const escapeAttribute = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const getAttribute = (attributes, name) => {
  const match = attributes.match(new RegExp(`\\s${name}=(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? decodeEntities(match[2]) : "";
};

const getAnchorText = (attributes, content) => {
  const text = decodeEntities(
    content
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

  return (
    text ||
    getAttribute(attributes, "aria-label") ||
    getAttribute(content, "alt") ||
    getAttribute(attributes, "href")
  );
};

const addTitles = (html) =>
  html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attributes, content) => {
    const title = getAnchorText(attributes, content);
    if (!title) return anchor;

    const attributesWithoutTitle = attributes.replace(
      /\s+title\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ""
    );

    return `<a${attributesWithoutTitle} title="${escapeAttribute(title)}">${content}</a>`;
  });

const getHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? getHtmlFiles(entryPath) : entryPath;
    })
  );

  return files.flat().filter((file) => file.endsWith(".html"));
};

export default function addLinkTitles() {
  return {
    name: "add-link-titles",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const outputDirectory = path.normalize(fileURLToPath(dir));
        const htmlFiles = await getHtmlFiles(outputDirectory);

        await Promise.all(
          htmlFiles.map(async (file) => {
            const html = await readFile(file, "utf8");
            const updatedHtml = addTitles(html);
            if (updatedHtml !== html) await writeFile(file, updatedHtml);
          })
        );
      },
    },
  };
}
