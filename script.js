// ============================================================
//  postiiify – Main Script
// ============================================================

// ============================================================
//  OFFERS — seedha yahan edit karo!
//  active: true  = banner dikhega
//  active: false = band
// ============================================================
const OFFERS = [
  {
    type: "poster",
    icon: "🎁",
    text: "Buy 8 Posters → Get 2 FREE!",
    sub: "Order 8 and pick any 2 extra posters absolutely free 🔥",
    active: false,
  },
  {
    type: "frame",  
    icon: "💸",
    text: "Buy 3+ Frames → Get ₹49 OFF!",
    sub: "3+ frames = ₹49 off with free delivery🖼️", // \n1-2 frames = delivery charge applicable (DM for details)",
    active: true,
  },
  {
    type: "polaroid",
    icon: "🚚",
    text: "Order 3+ Sets → FREE Delivery!",
    sub: "3+ sets = FREE delivery 🎉\n", //1-2 sets = delivery charge applicable (DM for details)",
    active: true,
  },
];

// Merge all product arrays into one master list
const PRODUCTS = [
  ...(typeof PRODUCTS_POSTERS    !== "undefined" ? PRODUCTS_POSTERS    : []),
  ...(typeof PRODUCTS_FIGURES    !== "undefined" ? PRODUCTS_FIGURES    : []),
  ...(typeof PRODUCTS_POLAROIDS  !== "undefined" ? PRODUCTS_POLAROIDS  : []),
  ...(typeof PRODUCTS_FRAMES     !== "undefined" ? PRODUCTS_FRAMES     : []),
  ...(typeof PRODUCTS_CUSTOM     !== "undefined" ? PRODUCTS_CUSTOM     : []),
];

// ============================================================
//  INSTAGRAM DM LINK
// ============================================================
const IG_DM_URL = "https://www.instagram.com/direct/t/18063073595391388/";

// ============================================================
//  STATE
// ============================================================
let cart = [];
let currentFilter = "poster";
let currentSubFilter = "all"; // for poster sub-tabs: all | anime | cars | singers
let currentSearch = "";
let holdTimer = null;
const HOLD_MS = 500;
let lbImgs = [];
let lbIndex = 0;
let lbTouchStartX = 0;
let lbProductId = null;

// ============================================================
//  BADGE LABEL HELPER
// ============================================================
function badgeLabel(type) {
  const map = {
    poster:       "POSTER",
    figure:       "FIGURE",
    polaroid:     "POLAROID",
    frame:        "FRAME",
    customizable: "CUSTOM",
  };
  return map[type] || type.toUpperCase();
}

// ============================================================
//  PAGINATION STATE
// ============================================================
var currentPage = 1;
var ITEMS_PER_PAGE = 8;

// ============================================================
//  RENDER PRODUCTS
// ============================================================
function renderProducts(filter, search, page) {
  filter = filter || currentFilter || "all";
  search = (search !== undefined ? search : currentSearch).trim().toLowerCase();
  if (page) currentPage = page;

  var grid = document.getElementById("productGrid");
  var filtered = PRODUCTS.filter(function(p) {
    var typeMatch = filter === "all" || p.type === filter;
    var subMatch = true;
    if (filter === "poster" && currentSubFilter !== "all") {
      subMatch = p.subtype === currentSubFilter;
    }
    var searchMatch = !search ||
      p.name.toLowerCase().includes(search) ||
      p.series.toLowerCase().includes(search) ||
      p.type.toLowerCase().includes(search) ||
      (p.subtype && p.subtype.toLowerCase().includes(search));
    return typeMatch && subMatch && searchMatch;
  });

  // Show/hide poster sub-tabs
  var subBar = document.getElementById("posterSubBar");
  if (subBar) {
    subBar.style.display = (filter === "poster") ? "flex" : "none";
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results">No results for "<span>' + (search || filter) + '</span>" 😔</div>';
    renderPagination(0, 0);
    return;
  }

  // Pagination slice
  var totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = 1;
  var start = (currentPage - 1) * ITEMS_PER_PAGE;
  var pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  grid.innerHTML = pageItems.map(function(p) {
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
          '<span class="badge-type">' + badgeLabel(p.type) + '</span>' +
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

  renderPagination(totalPages, currentPage);

  // Scroll to top of grid smoothly
  if (page && page !== 1) {
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ============================================================
//  PAGINATION RENDERER
// ============================================================
function renderPagination(totalPages, active) {
  var existing = document.getElementById("paginationBar");
  if (existing) existing.remove();
  if (totalPages <= 1) return;

  var bar = document.createElement("div");
  bar.id = "paginationBar";
  bar.className = "pagination-bar";

  // Prev button
  var prevDisabled = active <= 1 ? "disabled" : "";
  bar.innerHTML += '<button class="pg-btn pg-prev" ' + prevDisabled + ' onclick="goPage(' + (active - 1) + ')">&#8249;</button>';

  // Page number buttons — show max 5 around current
  var start = Math.max(1, active - 2);
  var end = Math.min(totalPages, active + 2);

  if (start > 1) {
    bar.innerHTML += '<button class="pg-btn" onclick="goPage(1)">1</button>';
    if (start > 2) bar.innerHTML += '<span class="pg-ellipsis">…</span>';
  }

  for (var i = start; i <= end; i++) {
    var activeClass = i === active ? " pg-active" : "";
    bar.innerHTML += '<button class="pg-btn' + activeClass + '" onclick="goPage(' + i + ')">' + i + '</button>';
  }

  if (end < totalPages) {
    if (end < totalPages - 1) bar.innerHTML += '<span class="pg-ellipsis">…</span>';
    bar.innerHTML += '<button class="pg-btn" onclick="goPage(' + totalPages + ')">' + totalPages + '</button>';
  }

  // Next button
  var nextDisabled = active >= totalPages ? "disabled" : "";
  bar.innerHTML += '<button class="pg-btn pg-next" ' + nextDisabled + ' onclick="goPage(' + (active + 1) + ')">&#8250;</button>';

  // Info text
  bar.innerHTML += '<div class="pg-info">Page ' + active + ' of ' + totalPages + '</div>';

  document.querySelector("main").appendChild(bar);
}

function goPage(p) {
  currentPage = p;
  renderProducts(currentFilter, currentSearch, p);
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

  var slideW = track.parentElement.offsetWidth;
  track.scrollTo({ left: lbIndex * slideW, behavior: "instant" });
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

function lbTouchStart(e) { lbTouchStartX = e.touches[0].clientX; }
function lbTouchEnd(e) {
  var dx = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); }
}

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
//  SCROLL ACTIVE TAB TO CENTER (mobile UX)
// ============================================================
function scrollTabToCenter(btn) {
  if (!btn) return;
  var bar = btn.parentElement;
  if (!bar) return;
  var btnLeft   = btn.offsetLeft;
  var btnWidth  = btn.offsetWidth;
  var barWidth  = bar.offsetWidth;
  var scrollTo  = btnLeft - (barWidth / 2) + (btnWidth / 2);
  bar.scrollTo({ left: scrollTo, behavior: "smooth" });
}

// ============================================================
//  OFFER BANNER
// ============================================================
function showOfferBanner(type) {
  var banner = document.getElementById("offerBanner");
  if (!banner) return;

  var offer = OFFERS.find(function(o) { return o.type === type && o.active; });

  if (offer) {
    document.getElementById("offerIcon").textContent = offer.icon;
    document.getElementById("offerMainText").textContent = offer.text;
    var subEl = document.getElementById("offerSubText");
    var subHtml = (offer.sub || "").replace(/\n/g, "<br>");
    subEl.innerHTML = subHtml;
    subEl.style.display = offer.sub ? "block" : "none";
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

// ============================================================
//  MAIN FILTER (POSTERS / FIGURES / POLAROID / FRAMES / CUSTOMIZABLE)
// ============================================================
function filterProducts(type, el) {
  currentFilter = type;
  if (type !== "poster") currentSubFilter = "all";

  document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
  el.classList.add("active");
  scrollTabToCenter(el);

  showOfferBanner(type);

  // Custom tab → show contact page, hide grid + search
  var grid = document.getElementById("productGrid");
  var customPage = document.getElementById("customContactPage");
  var comingSoonPage = document.getElementById("comingSoonPage");
  var searchWrap = document.querySelector(".search-bar-wrap");
  var subBar = document.getElementById("posterSubBar");

  if (type === "customizable") {
    grid.style.display = "none";
    if (customPage) customPage.style.display = "flex";
    if (comingSoonPage) comingSoonPage.style.display = "none";
    if (searchWrap) searchWrap.style.display = "none";
    if (subBar) subBar.style.display = "none";
  } else if (type === "figure") {
    grid.style.display = "none";
    if (customPage) customPage.style.display = "none";
    if (comingSoonPage) comingSoonPage.style.display = "flex";
    if (searchWrap) searchWrap.style.display = "none";
    if (subBar) subBar.style.display = "none";
  } else {
    grid.style.display = "";
    if (customPage) customPage.style.display = "none";
    if (comingSoonPage) comingSoonPage.style.display = "none";
    if (searchWrap) searchWrap.style.display = "";
    currentPage = 1;
    renderProducts(type, currentSearch);
  }
}

// ============================================================
//  POSTER SUB-FILTER (ANIME / CARS / SINGERS)
// ============================================================
function filterPostersBy(subtype, el) {
  currentSubFilter = subtype;
  currentPage = 1;
  document.querySelectorAll(".sub-filter-btn").forEach(function(b) { b.classList.remove("active"); });
  el.classList.add("active");
  scrollTabToCenter(el);
  renderProducts("poster", currentSearch);
}

// ============================================================
//  SEARCH
// ============================================================
function onSearchInput(val) {
  currentSearch = val;
  currentPage = 1;
  var clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.style.display = val ? "flex" : "none";
  renderProducts(currentFilter, val);
}

function clearSearch() {
  currentSearch = "";
  currentPage = 1;
  var input = document.getElementById("searchInput");
  if (input) input.value = "";
  var clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.style.display = "none";
  renderProducts(currentFilter, "");
}

// ============================================================
//  ADD TO CART
// ============================================================
function addToCart(id) {
  var product = PRODUCTS.find(function(p) { return p.id === id; });
  if (!product || !product.inStock) return;

  var existing = cart.find(function(item) { return item.id === id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(Object.assign({}, product, { qty: 1 }));
  }
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
function removeFromCart(id) {
  cart = cart.filter(function(item) { return item.id !== id; });
  updateCartUI();
  updateCartCount();
}

function changeQty(id, delta) {
  var item = cart.find(function(i) { return i.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(function(i) { return i.id !== id; });
  }
  updateCartUI();
  updateCartCount();
}

// ============================================================
//  CART UI
// ============================================================
// ============================================================
//  CALCULATE APPLIED OFFERS FROM CART
// ============================================================
function calcAppliedOffers() {
  var applied = [];

  OFFERS.forEach(function(offer) {
    if (!offer.active) return;

    // Count total qty of this type in cart
    var qtyOfType = cart
      .filter(function(i) { return i.type === offer.type; })
      .reduce(function(s, i) { return s + i.qty; }, 0);

    if (offer.type === "poster") {
      // Buy 8 → 2 free: discount = price of 2 cheapest posters in cart
      if (qtyOfType >= 8) {
        var posterPrices = [];
        cart.filter(function(i) { return i.type === "poster"; })
          .forEach(function(i) {
            for (var q = 0; q < i.qty; q++) posterPrices.push(i.price);
          });
        posterPrices.sort(function(a, b) { return a - b; });
        var freeVal = (posterPrices[0] || 0) + (posterPrices[1] || 0);
        applied.push({
          icon: "🎁",
          label: "Buy 8 Posters → 2 FREE!",
          discount: freeVal,
          note: ""
        });
      }
    }

    if (offer.type === "frame") {
      if (qtyOfType >= 3) {
        // 3+ frames → ₹49 off
        applied.push({
          icon: "💸",
          label: "3+ Frames → ₹49 OFF!",
          discount: 49,
          note: ""
        });
      } else if (qtyOfType >= 1) {
        // 1-2 frames → delivery charge (DM)
        applied.push({
          icon: "🚚",
          label: "Delivery charge applicable (DM for details)",
          discount: 0,
          note: "DELIVERY CHARGE"
        });
      }
    }

    if (offer.type === "polaroid") {
      if (qtyOfType >= 3) {
        // 3+ sets → free delivery
        applied.push({
          icon: "🚚",
          label: "3+ Polaroid Sets → Free Delivery!",
          discount: 0,
          note: "FREE DELIVERY"
        });
      } else if (qtyOfType >= 1) {
        // 1-2 sets → delivery charge (DM)
        applied.push({
          icon: "🚚",
          label: "Delivery charge applicable (DM for details)",
          discount: 0,
          note: "DELIVERY CHARGE"
        });
      }
    }
  });

  return applied;
}

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
      '<div class="cart-item-right">' +
        '<div class="qty-controls">' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)" title="Remove one">−</button>' +
          '<span class="qty-value">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', 1)" title="Add one">+</button>' +
        '</div>' +
        '<div class="cart-item-price">₹' + (item.price * item.qty) + '</div>' +
        '<button class="cart-item-remove" onclick="removeFromCart(' + item.id + ')" title="Remove">✕</button>' +
      '</div>' +
    '</div>';
  }).join("");

  // Applied offers rows
  var appliedOffers = calcAppliedOffers();
  var subtotal = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
  var totalDiscount = appliedOffers.reduce(function(s, o) { return s + o.discount; }, 0);
  var finalTotal = Math.max(0, subtotal - totalDiscount);

  if (appliedOffers.length > 0) {
    // Subtotal row
    container.innerHTML +=
      '<div class="cart-subtotal-row">' +
        '<span>Subtotal</span><span>₹' + subtotal + '</span>' +
      '</div>';

    // Each offer row
    appliedOffers.forEach(function(o) {
      container.innerHTML +=
        '<div class="cart-offer-row">' +
          '<span>' + o.icon + ' ' + o.label + '</span>' +
          '<span>' + (o.discount > 0 ? '−₹' + o.discount : '<span class="offer-free-tag" style="' + (o.note === 'DELIVERY CHARGE' ? 'background:#ffaa00;' : '') + '">' + o.note + '</span>') + '</span>' +
        '</div>';
    });
  }

  totalEl.textContent = "₹" + finalTotal;
}

function updateCartCount() {
  var total = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  document.getElementById("cartCount").textContent = total;
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
    var line = (i + 1) + ". " + item.name + " (" + item.series + ")";
    if (item.qty > 1) line += " × " + item.qty;
    line += " — ₹" + (item.price * item.qty);
    return line;
  }).join("\n");

  var totalQty = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var subtotal = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
  var appliedOffers = calcAppliedOffers();
  var totalDiscount = appliedOffers.reduce(function(s, o) { return s + o.discount; }, 0);
  var finalTotal = Math.max(0, subtotal - totalDiscount);

  var offerLines = "";
  if (appliedOffers.length > 0) {
    offerLines = "\n\n🎉 OFFERS APPLIED:\n" + appliedOffers.map(function(o) {
      return o.icon + " " + o.label + (o.discount > 0 ? " (−₹" + o.discount + ")" : o.note === "DELIVERY CHARGE" ? " ⚠️ Please confirm delivery charge in DM" : " (" + o.note + ")");
    }).join("\n");
  }

  var message = "🛒 Order from postiiify website!\n\n" +
    itemsList +
    offerLines +
    "\n\n──────────────────\n" +
    "Items: " + totalQty + "  |  Total: ₹" + finalTotal +
    (totalDiscount > 0 ? "  (saved ₹" + totalDiscount + "! 🎉)" : "");

  var copied = false;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(function() {
      copied = true;
    }).catch(function() {});
  }

  try { sessionStorage.setItem("postiify_order", message); } catch(e) {}

  showOrderPreview(message);
}

// ============================================================
//  ORDER PREVIEW POPUP
// ============================================================
function showOrderPreview(message) {
  var existing = document.getElementById("orderPreview");
  if (existing) existing.remove();

  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var hint = isMobile
    ? "📋 STEP 1: Copy this message below<br/>📩 STEP 2: Open Instagram → tap Message → paste!"
    : "Copy this message, then paste it in the Instagram DM:";
  var igBtnLabel = isMobile ? "📩 OPEN @postiiify ON INSTAGRAM" : "📩 OPEN INSTAGRAM DM";

  var popup = document.createElement("div");
  popup.id = "orderPreview";
  popup.className = "order-preview-overlay";
  popup.innerHTML = [
    '<div class="order-preview-modal">',
      '<div class="order-preview-header">',
        '<span>📋 YOUR ORDER MESSAGE</span>',
        '<button onclick="closeOrderPreview()">✕</button>',
      '</div>',
      '<div class="order-preview-body">',
        '<p class="order-preview-hint">' + hint + '</p>',
        '<pre class="order-preview-text" id="orderMsgText">' + message.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</pre>',
      '</div>',
      '<div class="order-preview-footer">',
        '<button class="order-copy-btn" onclick="copyOrderMsg()">📋 COPY MESSAGE</button>',
        '<button class="order-ig-btn" onclick="openInstagram()">' + igBtnLabel + '</button>',
      '</div>',
    '</div>'
  ].join("");

  document.body.appendChild(popup);
  setTimeout(function() { popup.classList.add("open"); }, 10);
}

function closeOrderPreview() {
  var popup = document.getElementById("orderPreview");
  if (popup) {
    popup.classList.remove("open");
    setTimeout(function() { popup.remove(); }, 300);
  }
}

function copyOrderMsg() {
  var el = document.getElementById("orderMsgText");
  var text = el ? el.textContent : "";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast("✓ Message copied!");
    }).catch(function() { fallbackCopy(text); });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); showToast("✓ Message copied!"); } catch(e) {}
  document.body.removeChild(ta);
}

// ============================================================
//  INSTAGRAM DM LINK — mobile vs desktop detection
// ============================================================
function openInstagram() {
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var url = isMobile
    ? "https://www.instagram.com/postiiify/"   // mobile: open profile, user DMs manually after copying
    : IG_DM_URL;                                // desktop: direct DM link works
  window.open(url, "_blank");
  showToast(isMobile ? "Copy karke DM karo! 📩" : "Opening Instagram DM! 📩");
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
  renderProducts("poster", "");
  var subBar = document.getElementById("posterSubBar");
  if (subBar) subBar.style.display = "flex";
  showOfferBanner("poster");
});

function handleLbOverlayClick(e) {
  if (e.target === document.getElementById("lightbox")) closeLightbox();
}
