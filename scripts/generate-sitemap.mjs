import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIG ---
const BASE_URL = "https://mysurian.in";
// If you keep a "categories" collection, we’ll read from it.
// Otherwise we’ll fall back to this list for now:
const FALLBACK_CATEGORIES = ["hotels", "gyms", "restaurants", "events"];

// Firestore paths (adjust if yours differ)
const CATEGORIES_COLLECTION = "categories"; // optional
// For listings we assume collection per category: /<category>/*
// Example: /hotels/{listingId}, /gyms/{listingId}, etc.

function today() {
  return new Date().toISOString().split("T")[0];
}

function urlTag(
  loc,
  lastmod = today(),
  changefreq = "weekly",
  priority = "0.8"
) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function readCategories(db) {
  // Try central categories collection first
  try {
    const snap = await db.collection(CATEGORIES_COLLECTION).get();
    if (!snap.empty) {
      const cats = [];
      snap.forEach((doc) => {
        const d = doc.data() || {};
        // prefer a 'slug' field; fallback to document id or 'name'
        const slug = (d.slug || d.id || d.name || doc.id || "")
          .toString()
          .trim()
          .toLowerCase();
        if (slug) cats.push(slug);
      });
      // Deduplicate + sort
      return Array.from(new Set(cats)).sort();
    }
  } catch (_) {
    // If the collection doesn't exist, we’ll use fallback.
  }
  return FALLBACK_CATEGORIES;
}

async function readListingsForCategory(db, category) {
  // We assume collection name equals the category slug (e.g., "hotels")
  // Adjust here if your structure is different.
  try {
    const snap = await db.collection(category).limit(5000).get();
    const urls = [];
    snap.forEach((doc) => {
      const d = doc.data() || {};
      const slug = (d.slug || doc.id).toString();
      urls.push(`/${category}/${slug}`);
    });
    return urls;
  } catch (_) {
    // If collection missing, return empty (categories will still be added)
    return [];
  }
}

async function main() {
  // init admin
  const serviceAccountPath = path.resolve(process.cwd(), "serviceAccount.json");
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"))
    ),
  });
  const db = admin.firestore();

  const pieces = [];
  // Home
  pieces.push(urlTag(`${BASE_URL}/`, today(), "daily", "1.0"));

  // Categories
  const categories = await readCategories(db);
  for (const cat of categories) {
    pieces.push(urlTag(`${BASE_URL}/${cat}`, today(), "weekly", "0.8"));

    // Listings under each category (optional until you add them)
    const listingPaths = await readListingsForCategory(db, cat);
    for (const p of listingPaths) {
      // If your Detail page route differs, adjust above
      pieces.push(urlTag(`${BASE_URL}${p}`, today(), "monthly", "0.6"));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pieces.join("\n")}
</urlset>
`;

  // write to public/
  const outDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml, "utf-8");

  // also ensure robots.txt points to it
  const robotsPath = path.join(outDir, "robots.txt");
  const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(robotsPath, robots, "utf-8");

  console.log("✅ Generated public/sitemap.xml and public/robots.txt");
}

main().catch((e) => {
  console.error("❌ Sitemap generation failed:", e);
  process.exit(1);
});
