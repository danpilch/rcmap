// Scrapes Relais & Châteaux European member hotels into src/data/properties.json
//
// The site is a Next.js app. Every page embeds a <script id="__NEXT_DATA__">
// JSON blob with the full server props. We:
//   1. Query the site's Algolia index (credentials live in the client bundle,
//      no auth beyond the public search key) for every European member, then
//      keep the unique hotels (~309). Standalone restaurants are skipped.
//   2. Fetch each hotel page and pull the rich data out of __NEXT_DATA__.
//
// Re-runnable. Throttled. Run with: npm run scrape

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/properties.json");
const BASE = "https://www.relaischateaux.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

// Public Algolia search credentials (extracted from the site's JS bundle).
const ALGOLIA = {
  appId: "EYAFFS0RC4",
  apiKey: "4d7f08f365ed4ba5bfc3e344ddc4c598",
  index: "global_gb",
  filter: "tags_destinations:'europe'",
};
const CONCURRENCY = 6;

// A few members have no fixed country (e.g. a roving cruise yacht). Label them.
const COUNTRY_OVERRIDE = {
  "ponant-mediterranee": "Mediterranean",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchNextData(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const html = await res.text();
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) throw new Error(`no __NEXT_DATA__ for ${url}`);
  return JSON.parse(m[1]).props.pageProps;
}

// Resize a cloudfront image URL by appending width/height query params.
function img(url, w = 1200, h = 800) {
  if (!url) return null;
  const clean = url.split("?")[0];
  return `${clean}?w=${w}&h=${h}`;
}

// "Our 19 rooms and suites" -> 19
function parseRooms(title) {
  const m = (title || "").match(/(\d+)\s+rooms?/i);
  return m ? Number(m[1]) : null;
}

// "1 Michelin Star 2026" / "2 Michelin Stars 2026" -> 1 / 2 ; "" -> 0
function parseStars(stars) {
  const m = String(stars || "").match(/(\d+)\s+Michelin/i);
  return m ? Number(m[1]) : 0;
}

// Pull a flat list of amenity service strings from the equipment blocks.
function collectServices(equipments = []) {
  const out = [];
  for (const e of equipments) for (const s of e.services || []) out.push(s);
  return out;
}

// Derive boolean feature flags used by the UI filters.
function deriveFeatures({ services, michelinStars, locTypes, roomTitle }) {
  const hay = (services.join(" ") + " " + (roomTitle || "")).toLowerCase();
  const has = (...words) => words.some((w) => hay.includes(w));
  return {
    spa: has("spa", "wellness", "massage", "hammam", "sauna"),
    pool: has("pool", "swimming"),
    michelin: michelinStars > 0,
    golf: has("golf"),
    gardens: has("garden", "park", "grounds", "vineyard"),
    fireplace: has("fireplace", "open fire"),
    petFriendly: has("pet", "dog"),
    countryside:
      locTypes.includes("In the countryside") || locTypes.includes("In a village"),
    seaside: locTypes.includes("By the sea") || has("sea view", "coast"),
  };
}

// One Algolia query returns every European member. Group by short_code and
// keep the ones that have a hotel-type entry (hotel_restaurant | hotel).
async function scrapeListing() {
  const res = await fetch(
    `https://${ALGOLIA.appId}-dsn.algolia.net/1/indexes/${ALGOLIA.index}/query`,
    {
      method: "POST",
      headers: {
        "X-Algolia-Application-Id": ALGOLIA.appId,
        "X-Algolia-API-Key": ALGOLIA.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        params: `filters=${encodeURIComponent(ALGOLIA.filter)}&hitsPerPage=1000`,
      }),
    },
  );
  if (!res.ok) throw new Error(`Algolia ${res.status}`);
  const { hits } = await res.json();

  const byCode = new Map(); // short_code -> { name, url, isHotel }
  for (const h of hits) {
    const isHotel = h.type_code === "hotel_restaurant" || h.type_code === "hotel";
    const prev = byCode.get(h.short_code);
    const entry = prev || { name: h.name, url: null, isHotel: false };
    if (isHotel) {
      entry.isHotel = true;
      entry.name = h.name;
      entry.url = h.urlv2 || h.url; // the /hotel/... url
    }
    byCode.set(h.short_code, entry);
  }
  return [...byCode.values()].filter((e) => e.isHotel && e.url);
}

function normalize(pp) {
  const d = pp.data;
  const g = d.tab_generic_informations;
  const loc = g.localisation || {};
  const stay = d.tab_stay || {};
  const eat = d.tab_eat || {};
  const details = d.tab_details || {};
  const info = details.block_informations || {};
  const restaurant = eat.block_main_restaurant || {};

  const services = [
    ...collectServices(stay.block_equipments_stay?.equipments),
    ...collectServices(eat.block_equipments_eat?.equipments),
  ];
  const michelinStars = parseStars(restaurant.stars);
  const roomTitle = stay.block_rooms?.title;
  const locTypes = loc.localisation_type || [];

  const gbpPrice = (g.prices || []).find((p) => p.currency_iso === "gbp");

  const gallery = (stay.media_gallery || [])
    .filter((m) => m.media_type === "image")
    .map((m) => img(m.url, 1400, 933))
    .slice(0, 8);

  return {
    id: g.short_code,
    name: g.name,
    type: g.type, // "Hotel"
    typeCode: g.type_code,
    architecture: g.type_architecture || null,
    city: loc.city || null,
    county: loc.departement || null,
    // zone_2 is the country grouping (e.g. "France", "Scandinavia")
    country: COUNTRY_OVERRIDE[g.short_code] || loc.zone_2 || loc.country_name || "Europe",
    // zone_3 is the human region label (e.g. "Provence", "Tuscany", "London")
    region: loc.zone_3 || loc.departement || loc.country_name || "Europe",
    postalCode: loc.postal_code || null,
    lat: Number(loc.latitude),
    lng: Number(loc.longitude),
    locationType: locTypes,
    memberSince: info.date_member || null,
    description: g.description || pp.data.tab_stay?.seo?.description || "",
    rooms: parseRooms(roomTitle),
    priceFrom: gbpPrice?.priceRounded ?? null,
    priceFromLabel: gbpPrice?.amountWithTaxesFeesRound ?? null,
    services,
    features: deriveFeatures({ services, michelinStars, locTypes, roomTitle }),
    restaurant: restaurant.name
      ? {
          name: restaurant.name,
          chef: restaurant.chef || null,
          cuisine: restaurant.type || null,
          stars: michelinStars,
          description: restaurant.description || null,
        }
      : null,
    heroImage: img(stay.media_url || details.media_url, 1600, 1000),
    gallery: gallery.length ? gallery : [img(stay.media_url, 1400, 933)].filter(Boolean),
    website: info.website || null,
    rcUrl: `${BASE}${g.url}`,
    phone: info.phone || null,
    nearestAirport: (info.airports || [])[0] || null,
    nearestStation: (info.train || [])[0] || null,
  };
}

// Run `worker` over `items` with a fixed concurrency pool.
async function pool(items, concurrency, worker) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function main() {
  console.log("Enumerating European hotels…");
  const hotels = await scrapeListing();
  console.log(`Found ${hotels.length} hotels. Fetching (concurrency ${CONCURRENCY})…`);

  let done = 0;
  const settled = await pool(hotels, CONCURRENCY, async (h) => {
    const url = `${BASE}/gb${h.url.replace(/\/$/, "")}/`;
    try {
      const pp = await fetchNextData(url);
      const prop = normalize(pp);
      done++;
      if (done % 25 === 0) console.log(`  …${done}/${hotels.length}`);
      if (!Number.isFinite(prop.lat)) console.log(`  ⚠ ${prop.name}: missing coords`);
      return prop;
    } catch (err) {
      console.log(`  ✗ ${h.name}: ${err.message}`);
      return null;
    }
  });
  const properties = settled.filter(Boolean);

  properties.sort((a, b) => a.name.localeCompare(b.name));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(properties, null, 2));

  const noCoords = properties.filter((p) => !Number.isFinite(p.lat));
  const noDesc = properties.filter((p) => !p.description);
  const byCountry = {};
  for (const p of properties) byCountry[p.country] = (byCountry[p.country] || 0) + 1;
  console.log(`\nWrote ${properties.length} properties to ${OUT}`);
  console.log(`  countries (${Object.keys(byCountry).length}): ` +
    Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(", "));
  if (noCoords.length) console.log(`  ⚠ missing coords: ${noCoords.map((p) => p.name).join(", ")}`);
  if (noDesc.length) console.log(`  ⚠ missing description: ${noDesc.map((p) => p.name).join(", ")}`);
  console.log(`  Michelin-starred: ${properties.filter((p) => p.features.michelin).length}`);
  console.log(`  with spa: ${properties.filter((p) => p.features.spa).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
