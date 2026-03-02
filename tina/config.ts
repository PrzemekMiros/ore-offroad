import { defineConfig } from "tinacms";

const branch =
  process.env.HEAD ||
  process.env.NETLIFY_BRANCH ||
  process.env.GITHUB_BRANCH ||
  "main";
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "content",
    },
  },
  schema: {
    collections: [
      {
        name: "artykuly",
        label: "Artykuły",
        path: "src/content/artykuly",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Tytuł", isTitle: true, required: true },
          { type: "string", name: "description", label: "Opis", ui: { component: "textarea" } },
          { type: "string", name: "author", label: "Autor" },
          { type: "datetime", name: "date", label: "Data" },
          { type: "string", name: "tags", label: "Tagi", list: true },
          { type: "string", name: "category", label: "Kategorie", list: true },
          { type: "image", name: "thumbnail", label: "Thumbnail" },
          { type: "number", name: "order", label: "Kolejność" },
          { type: "rich-text", name: "body", label: "Treść", isBody: true },
        ],
      },
      {
        name: "realizacje",
        label: "Realizacje",
        path: "src/content/realizacje",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Tytuł", isTitle: true, required: true },
          { type: "string", name: "description", label: "Opis", ui: { component: "textarea" } },
          { type: "string", name: "author", label: "Autor" },
          { type: "string", name: "client", label: "Klient" },
          { type: "string", name: "category", label: "Kategorie", list: true },
          { type: "string", name: "link", label: "Link" },
          { type: "image", name: "thumbnail", label: "Thumbnail" },
          { type: "string", name: "background", label: "Background" },
          { type: "number", name: "order", label: "Kolejność" },
          { type: "datetime", name: "date", label: "Data" },
          { type: "rich-text", name: "body", label: "Treść", isBody: true },
        ],
      },
      {
        name: "miasta",
        label: "Miasta",
        path: "src/content/miasta",
        format: "md",
        fields: [
          { type: "string", name: "town", label: "Miasto", required: true },
          { type: "string", name: "title", label: "Tytuł", required: true },
          { type: "string", name: "description", label: "Opis", ui: { component: "textarea" } },
          { type: "string", name: "maplink", label: "Map link", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "Treść", isBody: true },
        ],
      },
      {
        name: "faq",
        label: "FAQ",
        path: "src/content/faq",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Pytanie", isTitle: true, required: true },
          { type: "string", name: "answer", label: "Odpowiedź", ui: { component: "textarea" } },
        ],
      },
      {
        name: "opinie",
        label: "Opinie",
        path: "src/content/opinie",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Autor", isTitle: true, required: true },
          { type: "string", name: "client", label: "Klient" },
          { type: "string", name: "industry", label: "Branża" },
          { type: "string", name: "review", label: "Opinia", ui: { component: "textarea" } },
          { type: "image", name: "clientlogo", label: "Logo" },
          { type: "image", name: "clientavatar", label: "Avatar" },
          { type: "string", name: "addate", label: "Data dodania" },
          { type: "number", name: "order", label: "Kolejność" },
        ],
      },
      {
        name: "klienci",
        label: "Klienci",
        path: "src/content/klienci",
        format: "md",
        fields: [{ type: "image", name: "logo", label: "Logo" }],
      },
    ],
  },
});
