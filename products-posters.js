// ============================================================
//  postiiify — POSTERS PRODUCTS
//  Sub-categories: anime, cars, singers
//
//  HOW TO ADD A POSTER:
//  1. Copy one of the blocks below
//  2. Change id (must be unique across ALL product files)
//  3. Fill in name, series, price, subtype, emoji, imgs
//  4. Set inStock: true or false
//
//  subtype options: "anime" | "cars" | "singers"
//  imgs: array of image paths e.g. ["images/poster1.jpg"]
//        leave as [] to use emoji placeholder
// ============================================================

const PRODUCTS_POSTERS = [

  // ── ANIME POSTERS ─────────────────────────────────────────
  {
    id: 101,
    name: "Monkey D. Luffy — Gear 5",
    series: "One Piece",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "⚪",
    imgs: [],
  },
  {
    id: 102,
    name: "Levi Ackerman — ODM Pose",
    series: "Attack on Titan",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "⚡",
    imgs: [],
  },
  {
    id: 103,
    name: "Naruto Uzumaki — Sage Mode",
    series: "Naruto Shippuden",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "🍃",
    imgs: [],
  },
  {
    id: 104,
    name: "Mikasa Ackerman — A3 Poster",
    series: "Attack on Titan",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: false,
    emoji: "🔺",
    imgs: [],
  },
  // ➕ Add more anime posters below this line...

  // ── CARS POSTERS ──────────────────────────────────────────
  {
    id: 201,
    name: "AE86 Trueno — Tofu Shop",
    series: "Initial D",
    price: 49,
    type: "poster",
    subtype: "cars",
    inStock: true,
    emoji: "🚗",
    imgs: [],
  },
  {
    id: 202,
    name: "Nissan Skyline GT-R R34",
    series: "JDM Classics",
    price: 49,
    type: "poster",
    subtype: "cars",
    inStock: true,
    emoji: "🏎️",
    imgs: [],
  },
  {
    id: 203,
    name: "Ferrari F40 — Retro Print",
    series: "Supercars Series",
    price: 49,
    type: "poster",
    subtype: "cars",
    inStock: true,
    emoji: "🔴",
    imgs: [],
  },
  // ➕ Add more cars posters below this line...

  // ── SINGERS POSTERS ───────────────────────────────────────
  {
    id: 301,
    name: "Arijit Singh — Live Concert",
    series: "Bollywood Icons",
    price: 49,
    type: "poster",
    subtype: "singers",
    inStock: true,
    emoji: "🎤",
    imgs: [],
  },
  {
    id: 302,
    name: "The Weeknd — After Hours",
    series: "International Artists",
    price: 49,
    type: "poster",
    subtype: "singers",
    inStock: true,
    emoji: "🌙",
    imgs: [],
  },
  {
    id: 303,
    name: "A.R. Rahman — Maestro",
    series: "Bollywood Legends",
    price: 49,
    type: "poster",
    subtype: "singers",
    inStock: false,
    emoji: "🎵",
    imgs: [],
  },
  // ➕ Add more singers posters below this line...

];
