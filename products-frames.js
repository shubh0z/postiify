// ============================================================
//  postiiify — FRAMES PRODUCTS
//
//  HOW TO ADD A FRAME:
//  1. Copy one of the blocks below
//  2. Change id (must be unique across ALL product files)
//  3. Fill in name, series (include size), price, emoji, imgs
//  4. Set inStock: true or false
//
//  imgs: array of image paths e.g. ["images/frame1.jpg"]
//        leave as [] to use emoji placeholder
// ============================================================

const PRODUCTS_FRAMES = [

  {
    id: 601,
    name: "Black Frame - with custom posters",
    series: "A4 · Light Frame ",
    price: 250,
    type: "frame",
    subtype: "frame",
    inStock: true,
    emoji: "🖼️",
    imgs: ["frames/black.PNG"],
  },
  {
    id: 602,
    name: "White Frame - with custom posters",
    series: "A4 · Dark Frame",
    price: 250,
    type: "frame",
    subtype: "frame",
    inStock: true,
    emoji: "🖼️",
    imgs: ["frames/White.PNG"],
  },
  // ➕ Add more frames below this line...

];
