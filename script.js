// ============================================================
//  postiiify – Anime Shop Script
// ============================================================

// ============================================================
//  🛍️  YOUR PRODUCTS — Edit this section!
//
//  imgs: [] — array of image paths for this product
//    - First image shows on the card
//    - All images show in swipeable popup (hold/long-press card)
//    - Example: imgs: ["images/poster1a.jpg", "images/poster1b.jpg"]
//    - Leave as [] to use emoji placeholder
// ============================================================
const PRODUCTS = [
  {
    id: 2,
    name: "Monkey D. Luffy — Gear 5",
    series: "One Piece",
    price: 149,
    type: "poster",
    inStock: true,
    emoji: "⚪",
    imgs: [],
  },
  {
    id: 5,
    name: "Levi Ackerman — ODM Pose",
    series: "Attack on Titan",
    price: 149,
    type: "poster",
    inStock: true,
    emoji: "⚡",
    imgs: [],
  },
  {
    id: 6,
    name: "Naruto Uzumaki — Sage Mode",
    series: "Naruto Shippuden",
    price: 149,
    type: "poster",
    inStock: true,
    emoji: "🍃",
    imgs: [],
  },
  {
    id: 8,
    name: "Mikasa Ackerman — A3 Poster",
    series: "Attack on Titan",
    price: 179,
    type: "poster",
    inStock: false,
    emoji: "🔺",
    imgs: [],
  },



  // for anime figures 

  {
    id: 1,
    name: "Itadori Yuji — Sukuna Mode",
    series: "Jujutsu Kaisen",
    price: 149,
    type: "figure",
    inStock: true,
    emoji: "🔴",
    imgs: ["anime_figures/Akaza.jpeg","anime_figures/Goku.jpeg"]
  },
  {
    id: 7,
    name: "Gojo Satoru Figure",
    series: "Jujutsu Kaisen | 18cm",
    price: 749,
    type: "figure",
    inStock: true,
    emoji: "🔵",
    imgs: [],
  },
  {
    id: 3,
    name: "Roronoa Zoro Figure",
    series: "One Piece | 15cm",
    price: 599,
    type: "figure",
    inStock: true,
    emoji: "🗡️",
    imgs: [],
  },
  {
    id: 4,
    name: "Nezuko Kamado Figure",
    series: "Demon Slayer | 12cm",
    price: 549,
    type: "figure",
    inStock: false,
    emoji: "🌸",
    imgs: [],
  },
];

// ============================================================
//  INSTAGRAM DM LINK
// ============================================================
const IG_DM_URL = "https://www.instagram.com/direct/t/18063073595391388/";

// ============================================================
//  STATE
// ============================================================
let cart = [];
let currentFilter = "all";
let holdTimer = null;
const HOLD_MS = 500;
let lbImgs = [];
let lbIndex = 0;
let lbTouchStartX = 0;
let lbProductId = null;

// ============================================================
//  RENDER PRODUCTS
// ============================================================
function renderProducts(filter) {
  filter = filter || "all";
  var grid = document.getElementById("productGrid");
  var filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(function(p) { return p.type === filter; });

  grid.innerHTML = filtered.map(function(p) {
    var hasImgs = p.imgs && p.imgs.length > 0;
    var firstImg = hasImgs ? p.imgs[0] : "";
    var multiHint = hasImgs
      ? (p.imgs.length > 1
          ? '<div class="multi-hint">👁 ' + p.imgs.length + ' photos · hold</div>'
          : '<div class="multi-hint">👁 hold to preview</div>')
      : "";

    return (
      '<div class="product-card" data-type="' + p.type + '" data-id="' + p.id + '">' +
        '<div class="product-img-wrap" ' +
          'onpointerdown="startHold(event,' + p.id + ')" ' +
          'onpointerup="cancelHold()" ' +
          'onpointercancel="cancelHold()" ' +
          'onpointerleave="cancelHold()" ' +
          'oncontextmenu="return false">' +
          (firstImg
            ? '<img class="product-img" src="' + firstImg + '" alt="' + p.name + '" loading="lazy" draggable="false" />'
            : '<div class="product-img-placeholder">' + p.emoji + '</div>'
          ) +
          '<span class="badge-type">' + (p.type === "poster" ? "POSTER" : "FIGURE") + '</span>' +
          (!p.inStock ? '<div class="badge-sold">SOLD OUT</div>' : "") +
          multiHint +
          '<div class="hold-ring" id="ring-' + p.id + '"></div>' +
        '</div>' +
        '<div class="product-info">' +
          '<div class="product-name">' + p.name + '</div>' +
          '<div class="product-series">' + p.series + '</div>' +
          '<div class="product-price">₹' + p.price + '</div>' +
          '<button class="add-btn" id="btn-' + p.id + '" onclick="addToCart(' + p.id + ')" ' +
            (!p.inStock ? "disabled" : "") + '>' +
            (!p.inStock ? "SOLD OUT" : "+ ADD TO CART") +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}

// ============================================================
//  HOLD TO PREVIEW
// ============================================================
function startHold(e, productId) {
  cancelHold();
  var product = PRODUCTS.find(function(p) { return p.id === productId; });
  if (!product || !product.imgs || product.imgs.length === 0) return;

  var ring = document.getElementById("ring-" + productId);
  if (ring) ring.classList.add("active");

  holdTimer = setTimeout(function() {
    if (ring) ring.classList.remove("active");
    openLightbox(productId);
  }, HOLD_MS);
}

function cancelHold() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  document.querySelectorAll(".hold-ring.active").forEach(function(r) {
    r.classList.remove("active");
  });
}

// ============================================================
//  LIGHTBOX
// ============================================================
function openLightbox(productId) {
  var product = PRODUCTS.find(function(p) { return p.id === productId; });
  if (!product || !product.imgs || product.imgs.length === 0) return;

  lbProductId = productId;
  lbImgs = product.imgs;
  lbIndex = 0;

  var lb = document.getElementById("lightbox");
  lb.querySelector(".lb-title").textContent = product.name;
  lb.querySelector(".lb-series").textContent = product.series;
  lb.querySelector(".lb-price").textContent = "₹" + product.price;

  renderLbSlide();
  renderLbDots();

  var lbAddBtn = lb.querySelector(".lb-add-btn");
  if (!product.inStock) {
    lbAddBtn.disabled = true;
    lbAddBtn.textContent = "SOLD OUT";
  } else {
    lbAddBtn.disabled = false;
    lbAddBtn.textContent = "+ ADD TO CART";
  }

  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
  lbImgs = [];
  lbProductId = null;
}

function renderLbSlide() {
  var track = document.getElementById("lbTrack");
  track.innerHTML = lbImgs.map(function(src, i) {
    return '<div class="lb-slide">' +
      '<img src="' + src + '" alt="photo ' + (i+1) + '" draggable="false" />' +
    '</div>';
  }).join("");

  // Scroll track to current index
  var slideW = track.parentElement.offsetWidth;
  track.scrollTo({ left: lbIndex * slideW, behavior: "smooth" });
  updateLbCounter();
}

function renderLbDots() {
  var dots = document.getElementById("lbDots");
  if (lbImgs.length <= 1) { dots.innerHTML = ""; return; }
  dots.innerHTML = lbImgs.map(function(_, i) {
    return '<span class="lb-dot' + (i === lbIndex ? " active" : "") + '" onclick="lbGoTo(' + i + ')"></span>';
  }).join("");
}

function lbGoTo(idx) {
  lbIndex = Math.max(0, Math.min(idx, lbImgs.length - 1));
  var track = document.getElementById("lbTrack");
  var slideW = track.parentElement.offsetWidth;
  track.scrollTo({ left: lbIndex * slideW, behavior: "smooth" });
  renderLbDots();
  updateLbCounter();
}

function lbPrev() { lbGoTo(lbIndex - 1); }
function lbNext() { lbGoTo(lbIndex + 1); }

function updateLbCounter() {
  var el = document.getElementById("lbCounter");
  el.textContent = lbImgs.length > 1 ? (lbIndex + 1) + " / " + lbImgs.length : "";
}

// Track scroll to sync dots + counter
function lbTrackScroll() {
  var track = document.getElementById("lbTrack");
  var slideW = track.parentElement.offsetWidth;
  var newIdx = Math.round(track.scrollLeft / slideW);
  if (newIdx !== lbIndex) {
    lbIndex = newIdx;
    renderLbDots();
    updateLbCounter();
  }
}

// Touch swipe fallback
function lbTouchStart(e) { lbTouchStartX = e.touches[0].clientX; }
function lbTouchEnd(e) {
  var dx = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); }
}

// Keyboard
document.addEventListener("keydown", function(e) {
  if (!document.getElementById("lightbox").classList.contains("open")) return;
  if (e.key === "ArrowRight") lbNext();
  if (e.key === "ArrowLeft") lbPrev();
  if (e.key === "Escape") closeLightbox();
});

function lbAddFromPopup() {
  if (lbProductId !== null) addToCart(lbProductId);
}

// ============================================================
//  FILTER
// ============================================================
function filterProducts(type, el) {
  currentFilter = type;
  document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
  el.classList.add("active");
  renderProducts(type);
}

// ============================================================
//  ADD TO CART
// ============================================================
function addToCart(id) {
  var product = PRODUCTS.find(function(p) { return p.id === id; });
  if (!product || !product.inStock) return;

  cart.push(Object.assign({}, product, { cartId: Date.now() + Math.random() }));
  updateCartUI();
  updateCartCount();

  var btn = document.getElementById("btn-" + id);
  if (btn) {
    btn.textContent = "✓ ADDED!";
    btn.classList.add("added");
    setTimeout(function() {
      btn.textContent = "+ ADD TO CART";
      btn.classList.remove("added");
    }, 1200);
  }

  // Also update lightbox btn if open
  var lbAddBtn = document.querySelector(".lb-add-btn");
  if (lbAddBtn && lbProductId === id && product.inStock) {
    lbAddBtn.textContent = "✓ ADDED!";
    lbAddBtn.classList.add("added");
    setTimeout(function() {
      lbAddBtn.textContent = "+ ADD TO CART";
      lbAddBtn.classList.remove("added");
    }, 1200);
  }

  showToast(product.name + " added!");
}

// ============================================================
//  REMOVE FROM CART
// ============================================================
function removeFromCart(cartId) {
  cart = cart.filter(function(item) { return item.cartId !== cartId; });
  updateCartUI();
  updateCartCount();
}

// ============================================================
//  CART UI
// ============================================================
function updateCartUI() {
  var container = document.getElementById("cartItems");
  var totalEl = document.getElementById("cartTotal");

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Cart is empty~ 空っぽ</p>';
    totalEl.textContent = "₹0";
    return;
  }

  container.innerHTML = cart.map(function(item) {
    return '<div class="cart-item">' +
      '<div class="cart-item-name">' + item.name +
        '<br><span style="color:var(--text-dim);font-size:11px">' + item.series + '</span>' +
      '</div>' +
      '<div class="cart-item-price">₹' + item.price + '</div>' +
      '<button class="cart-item-remove" onclick="removeFromCart(' + item.cartId + ')" title="Remove">✕</button>' +
    '</div>';
  }).join("");

  var total = cart.reduce(function(sum, item) { return sum + item.price; }, 0);
  totalEl.textContent = "₹" + total;
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.length;
}

// ============================================================
//  CART TOGGLE
// ============================================================
function toggleCart() {
  var sidebar = document.getElementById("cartSidebar");
  var overlay = document.getElementById("cartOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
  document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : "";
}

// ============================================================
//  ORDER ON INSTAGRAM
// ============================================================
function orderOnInstagram() {
  if (cart.length === 0) { showToast("Cart is empty!"); return; }

  var itemsList = cart.map(function(item, i) {
    return (i + 1) + ". " + item.name + " (" + item.series + ") — ₹" + item.price;
  }).join("\n");
  var total = cart.reduce(function(sum, item) { return sum + item.price; }, 0);
  var message = "🛒 Order from postiiify website!\n\n" + itemsList + "\n\nTotal: ₹" + total + "\n\nPlease confirm availability!";

  if (navigator.clipboard) { navigator.clipboard.writeText(message).catch(function() {}); }
  window.open(IG_DM_URL, "_blank");
  showToast("Opening Instagram DM! 📩");
}

// ============================================================
//  TOAST
// ============================================================
var toastTimeout;
function showToast(msg) {
  var toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function() { toast.classList.remove("show"); }, 2000);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  renderProducts("all");
});

// Close lightbox when clicking overlay background
function handleLbOverlayClick(e) {
  if (e.target === document.getElementById("lightbox")) closeLightbox();
}
