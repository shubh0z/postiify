// ============================================================
//  postiiify — ANIME FIGURES PRODUCTS
//
//  HOW TO ADD A FIGURE:
//  1. Copy one of the blocks below
//  2. Change id (must be unique across ALL product files)
//  3. Fill in name, series (include size e.g. "| 18cm"), price, emoji, imgs
//  4. Set inStock: true or false
//
//  imgs: array of image paths e.g. ["anime_figures/figure1.jpg"]
//        leave as [] to use emoji placeholder
// ============================================================

const PRODUCTS_FIGURES = [

  {
    id: 401,
    name: "Itadori Yuji — Sukuna Mode",
    series: "Jujutsu Kaisen",
    price: 149,
    type: "figure",
    subtype: "figure",
    inStock: true,
    emoji: "🔴",
    imgs: ["anime_figures/Akaza.jpeg", "anime_figures/Goku.jpeg"],
  },
  {
    id: 402,
    name: "Gojo Satoru Figure",
    series: "Jujutsu Kaisen | 18cm",
    price: 749,
    type: "figure",
    subtype: "figure",
    inStock: true,
    emoji: "🔵",
    imgs: [],
  },
  {
    id: 403,
    name: "Roronoa Zoro Figure",
    series: "One Piece | 15cm",
    price: 599,
    type: "figure",
    subtype: "figure",
    inStock: true,
    emoji: "🗡️",
    imgs: [],
  },
  {
    id: 404,
    name: "Nezuko Kamado Figure",
    series: "Demon Slayer | 12cm",
    price: 549,
    type: "figure",
    subtype: "figure",
    inStock: false,
    emoji: "🌸",
    imgs: [],
  },
  // ➕ Add more figures below this line...

];
