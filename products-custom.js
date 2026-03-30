// ============================================================
//  postiiify — CUSTOMIZABLE PRODUCTS
//
//  HOW TO ADD A CUSTOMIZABLE ITEM:
//  1. Copy one of the blocks below
//  2. Change id (must be unique across ALL product files)
//  3. Fill in name, series (describe what can be customized), price, emoji, imgs
//  4. Set inStock: true or false
//
//  imgs: array of image paths e.g. ["images/custom1.jpg"]
//        leave as [] to use emoji placeholder
//
//  TIP: In the "series" field, mention what info customer
//       should DM you — e.g. "Send name + photo on IG DM"
// ============================================================

const PRODUCTS_CUSTOM = [

  {
    id: 701,
    name: "Custom Name Poster",
    series: "Your name + character · A4",
    price: 249,
    type: "customizable",
    subtype: "customizable",
    inStock: true,
    emoji: "✏️",
    imgs: [],
  },
  {
    id: 702,
    name: "Custom Couple Polaroid Pack",
    series: "Your photos · 6 pcs · DM details",
    price: 299,
    type: "customizable",
    subtype: "customizable",
    inStock: true,
    emoji: "💌",
    imgs: [],
  },
  {
    id: 703,
    name: "Custom Framed Portrait",
    series: "Your photo · A4 · Black Frame",
    price: 549,
    type: "customizable",
    subtype: "customizable",
    inStock: true,
    emoji: "🎨",
    imgs: [],
  },
  {
    id: 704,
    name: "Custom Birthday Poster",
    series: "Name + date + theme · A3",
    price: 349,
    type: "customizable",
    subtype: "customizable",
    inStock: true,
    emoji: "🎂",
    imgs: [],
  },
  // ➕ Add more customizable products below this line...

];
