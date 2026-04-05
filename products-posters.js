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
    name: "Kokoushibo - upper moon",
    series: "Demon slayer",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "⚪",
    imgs: ["posters/kokoushibo,demon slayer.jpg"],
  },
  {
    id: 102,
    name: "Guts",
    series: "Berserk",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "⚡",
    imgs: ["posters/guts,berserk.jpg"],
  },
  {
    id: 103,
    name: "Batmen - DC",
    series: "DC",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "🍃",
    imgs: ["posters/batman.jpg"],
  },
  {
    id: 104,
    name: "Shion",
    series: "Hells paradsise",
    price: 49,
    type: "poster",
    subtype: "anime",
    inStock: true,
    emoji: "🔺",
    imgs: ["posters/Shion hells paradaise 5.jpg"],
  },
  // ➕ Add more anime posters below this line...

  // ── CARS POSTERS ──────────────────────────────────────────
  {
    id: 201,
    name: "Supra - Sunset",
    series: "911 Classics",
    price: 49,
    type: "poster",
    subtype: "cars",
    inStock: true,
    emoji: "🚗",
    imgs: ["posters/Supra.jpeg"],
  },


  // MARVEL POSTERS
  {
    id: 202,
    name: "Spiderman - Blue",
    series: "Marvel",
    price: 49,
    type: "poster",
    subtype: "marvel",
    inStock: true,
    emoji: "🕷",
    imgs: ["posters/Blue spiderman.jpeg"],
  },
  {
    id: 203,
    name: "Spiderman - Comic",
    series: "Marvel",
    price: 49,
    type: "poster",
    subtype: "marvel",
    inStock: true,
    emoji: "🕸",
    imgs: ["posters/Spiderman comic.jpeg"],
  },

  {
    id: 204,
    name: "Spiderman - Comic",
    series: "Marvel",
    price: 49,
    type: "poster",
    subtype: "marvel",
    inStock: true,
    emoji: "🕷",
    imgs: ["posters/Spiderman comic 1.jpeg"],
  },

  // GOD POSTERS
  {
    id: 205,
    name: "Krishna - The Divine Thunder",
    series: "Hindu Gods",
    price: 49,
    type: "poster",
    subtype: "god",
    inStock: true,
    emoji: "🛐",
    imgs: ["posters/Krishna Thunder.jpeg"],
  },
  {
    id: 206,
    name: "Radha Krishna - Eternal Love",
    series: "Hindu Gods",
    price: 49,
    type: "poster",
    subtype: "god",
    inStock: true,
    emoji: "🐘",
    imgs: ["posters/Radha Krishna wallpaper.jpeg"],
  },

    {
    id: 207,
    name: "Radha Krishna - Melody of Devotion",
    series: "Hindu Gods",
    price: 49,
    type: "poster",
    subtype: "god",
    inStock: true,
    emoji: "🎤",
    imgs: ["posters/Radha krishna.jpeg"],
  },

  // CRICKETERS POSTERS
  {
    id: 208,
    name: "MS Dhoni - The Finisher",
    series: "Cricket Legends",
    price: 49,
    type: "poster",
    subtype: "cricketer",
    inStock: true,
    emoji: "🏏",
    imgs: ["posters/MS Dhoni.jpeg"],
  },
  {
    id: 209,
    name: "Rohit Sharma - Hitman",
    series: "Cricket Legends",
    price: 49,
    type: "poster",
    subtype: "cricketer",
    inStock: true,
    emoji: "🧢",
    imgs: ["posters/Rohit Sharma.jpeg"],
  },    
  {
    id: 210,
    name: "The MMM - Mahi",
    series: "Cricket Legends",
    price: 49,
    type: "poster",
    subtype: "cricketer",
    inStock: true,
    emoji: "👑",
    imgs: ["posters/The MMM.jpeg"],
  },  
  {
    id: 211,
    name: "Virat and Rohit - The Dynamic Duo",
    series: "Cricket Legends",
    price: 49,
    type: "poster",
    subtype: "cricketer",
    inStock: true,
    emoji: "⚡",
    imgs: ["posters/Virat and Rohit.jpeg"],
  }


  // ➕ Add more cars posters below this line...

  // ── SINGERS POSTERS ───────────────────────────────────────

  // ➕ Add more singers posters below this line...

];
