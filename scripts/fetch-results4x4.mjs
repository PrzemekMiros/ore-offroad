#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "..", "src", "content", "wyniki");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function msToHMS(ms) {
  if (ms == null) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

async function fetchRound({ brand, year }) {
  const dashboardUrl = `https://results4x4.com/api/v1/public/dashboard?brand=${brand}&year=${year}`;
  const dashboard = await fetchJson(dashboardUrl);
  const round = dashboard.nearestRound;
  if (!round) return null;

  const roundId = round.id;
  const leaderboardUrl = `https://results4x4.com/api/v1/public/rounds/${roundId}/leaderboard?mode=final`;
  const leaderboard = await fetchJson(leaderboardUrl);

  const classByTeam = new Map(
    (dashboard.teams ?? []).map((t) => [t.teamId, t.classCode ?? ""])
  );

  const rows = leaderboard.rows ?? [];
  const results = rows.map((row) => ({
    position: row.position ?? null,
    crew: row.teamName,
    vehicle: "",
    class: classByTeam.get(row.teamId) ?? "",
    time: msToHMS(row.totalTimeMs),
    notes: "",
  }));

  const classes = Array.from(new Set(results.map((r) => r.class).filter(Boolean)));
  const date = round.startsAt ? round.startsAt.slice(0, 10) : `${year}-01-01`;

  return {
    brand,
    year,
    roundNo: round.roundNo ?? 1,
    roundName: round.name ?? `${brand} ${year}`,
    startsAt: date,
    results,
    classes,
    roundId,
  };
}

function writeMd(roundData) {
  const fm = {
    title: `${roundData.roundName} ${roundData.year}`,
    event: roundData.roundName,
    date: roundData.startsAt,
    location: "Poland Trophy",
    region: "",
    series: roundData.brand,
    round: `Runda ${roundData.roundNo}`,
    surface: "",
    link: "https://results4x4.com/",
    classes: roundData.classes,
    results: roundData.results,
  };

  const rowsYaml = fm.results
    .map((r) =>
      `  - position: ${r.position ?? ""}\n` +
      `    crew: "${r.crew ?? ""}"\n` +
      `    vehicle: "${r.vehicle ?? ""}"\n` +
      `    class: "${r.class ?? ""}"\n` +
      `    time: "${r.time ?? ""}"\n` +
      `    notes: "${r.notes ?? ""}"`
    )
    .join("\n");

  const md = `---\n` +
    `title: "${fm.title}"\n` +
    `event: "${fm.event}"\n` +
    `date: "${fm.date}"\n` +
    `location: "${fm.location}"\n` +
    `region: "${fm.region}"\n` +
    `series: "${fm.series}"\n` +
    `round: "${fm.round}"\n` +
    `surface: "${fm.surface}"\n` +
    `link: "${fm.link}"\n` +
    `classes: [${fm.classes.map((c) => `"${c}"`).join(", ")}]\n` +
    `results:\n${rowsYaml}\n` +
    `---\n\nAutomatycznie zaktualizowane z results4x4.com\n`;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const slug = `${roundData.brand.toLowerCase()}-runda-${roundData.roundNo}-${roundData.year}.md`;
  const outPath = path.join(OUT_DIR, slug);
  fs.writeFileSync(outPath, md, "utf8");
  console.log(`Saved ${outPath}`);
}

async function run() {
  const rounds = [
    { brand: "PT", year: 2026 },
    // możesz dodać kolejne brandy/lata tutaj
  ];

  for (const cfg of rounds) {
    try {
      const data = await fetchRound(cfg);
      if (!data) {
        console.log(`No round for ${cfg.brand} ${cfg.year}`);
        continue;
      }
      writeMd(data);
    } catch (err) {
      console.error(`Failed for ${cfg.brand} ${cfg.year}:`, err.message);
    }
  }
}

run();
