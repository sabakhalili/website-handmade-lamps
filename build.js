/**
 * Zero-dependency static site builder.
 * Reads data/products/*.json + partials/*.html + src/*.html and writes the
 * final static pages (index.html, about.html, contact.html, products/*.html,
 * sitemap.xml) into the project root, ready to deploy as-is.
 *
 * Run: node build.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE_URL = "https://dock9studio.vercel.app"; // TODO(real-content): update once a custom domain is added

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function write(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function fill(template, tokens) {
  let out = template;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split("{{" + key + "}}").join(value);
  }
  return out;
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// ---------- Load partials ----------
const partials = {
  head: read("partials/head.html"),
  nav: read("partials/nav.html"),
  footer: read("partials/footer.html"),
  whatsappButton: read("partials/whatsapp-button.html"),
  productCard: read("partials/product-card.html"),
  productDetail: read("partials/product-detail.html"),
};

// ---------- Load product data ----------
const productsDir = path.join(ROOT, "data/products");
const products = fs
  .readdirSync(productsDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf8")))
  .sort((a, b) => (a.date_added < b.date_added ? 1 : -1));

// ---------- Page wrapper ----------
function wrapPage({ content, title, description, canonicalPath, active, whatsappProduct }) {
  const head = fill(partials.head, {
    TITLE: title,
    DESCRIPTION: description,
    CANONICAL: SITE_URL + canonicalPath,
    OG_IMAGE: SITE_URL + "/assets/og-image.jpg",
  });

  const nav = fill(partials.nav, {
    ACTIVE_HOME: active === "home" ? 'aria-current="page"' : "",
    ACTIVE_ABOUT: active === "about" ? 'aria-current="page"' : "",
    ACTIVE_PRODUCTS: active === "products" ? 'aria-current="page"' : "",
    ACTIVE_CONTACT: active === "contact" ? 'aria-current="page"' : "",
  });

  const footer = fill(partials.footer, { YEAR: String(new Date().getFullYear()) });

  const whatsappButton = fill(partials.whatsappButton, {
    PRODUCT_ATTR: whatsappProduct ? ` data-product="${escapeAttr(whatsappProduct)}"` : "",
  });

  return `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
${nav}
<main>
${content}
</main>
${footer}
${whatsappButton}
<script src="/js/config.js"></script>
<script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------- Product card / detail rendering ----------
function renderCard(product) {
  const hero = product.images[0];
  return fill(partials.productCard, {
    SLUG: product.slug,
    CATEGORY: product.category,
    NAME: product.name,
    IMAGE_SRC: hero.src,
    IMAGE_ALT: escapeAttr(hero.alt),
  });
}

function renderThumbs(product) {
  return product.images
    .map(
      (img) =>
        `<button type="button" class="product-detail__thumb-btn" data-full="/${img.src}" data-alt="${escapeAttr(img.alt)}"><img src="/${img.src}" alt="" /></button>`
    )
    .join("\n");
}

function renderProductDetail(product) {
  const hero = product.images[0];
  return fill(partials.productDetail, {
    CATEGORY: product.category,
    NAME: product.name,
    DESCRIPTION: product.description,
    CRAFT_NOTE: product.craft_note,
    HERO_IMAGE_SRC: hero.src,
    HERO_IMAGE_ALT: escapeAttr(hero.alt),
    THUMBNAILS: product.images.length > 1 ? renderThumbs(product) : "",
  });
}

// ---------- Build Home ----------
const featured = products.slice(0, 3).map(renderCard).join("\n");
write(
  "index.html",
  wrapPage({
    content: fill(read("src/index.html"), { FEATURED_PRODUCTS: featured }),
    title: "Dock9 Studio — Handmade Lamps",
    description: "Small-batch, hand-finished lamps from Dock9 Studio. Browse the collection and get in touch to enquire.",
    canonicalPath: "/",
    active: "home",
  })
);

// ---------- Build About ----------
write(
  "about.html",
  wrapPage({
    content: read("src/about.html"),
    title: "Our Story — Dock9 Studio",
    description: "The story behind Dock9 Studio's handmade lamps — who makes them, where, and how.",
    canonicalPath: "/about",
    active: "about",
  })
);

// ---------- Build Products index ----------
const categories = ["All", "Wall", "Pendant", "Floor", "Table"];
const pills = categories
  .map(
    (cat) =>
      `<button type="button" class="pill${cat === "All" ? " pill--active" : ""}" data-category-pill="${cat}" aria-pressed="${cat === "All"}">${cat}</button>`
  )
  .join("\n");
const productGrid = products.map(renderCard).join("\n");

write(
  "products/index.html",
  wrapPage({
    content: fill(read("src/products.html"), {
      CATEGORY_PILLS: pills,
      PRODUCT_GRID: productGrid,
    }),
    title: "All Lamps — Dock9 Studio",
    description: "Browse Dock9 Studio's full collection of handmade wall, pendant, floor, and table lamps.",
    canonicalPath: "/products",
    active: "products",
  })
);

// ---------- Build each Product detail page ----------
for (const product of products) {
  write(
    `products/${product.slug}.html`,
    wrapPage({
      content: renderProductDetail(product),
      title: `${product.name} — Dock9 Studio`,
      description: product.description,
      canonicalPath: `/products/${product.slug}`,
      active: "products",
      whatsappProduct: product.name,
    })
  );
}

// ---------- Build Contact ----------
write(
  "contact.html",
  wrapPage({
    content: read("src/contact.html"),
    title: "Contact — Dock9 Studio",
    description: "Get in touch with Dock9 Studio on WhatsApp or Instagram — trade and wholesale enquiries welcome.",
    canonicalPath: "/contact",
    active: "contact",
  })
);

// ---------- Sitemap ----------
const urls = [
  "/",
  "/about",
  "/products",
  "/contact",
  ...products.map((p) => `/products/${p.slug}`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);

console.log(`Built ${products.length} product pages + 4 core pages + sitemap.xml`);
