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
    icon: "💸",
    text: "Price Drop!",
    sub: "All posters now at ₹44 — grab them before it's gone! 🔥",
    active: true,
  },
  {
    type: "frame",  
    icon: "💸",
    text: "Buy 3 Frames → Get ₹49 OFF!",
    sub: "3 frames = free delivery🖼️", // \n1-2 frames = delivery charge applicable (DM for details)",
    active: true,
  },
  {
    type: "polaroid",
    icon: "🚚",
    text: "Order 3 Sets → FREE Delivery!",
    sub: "🎉\n", //1-2 sets = delivery charge applicable (DM for details)",
    active: true,
  },
  {
    type: "figure",
    icon: "🚚",
    text: "Order 2 Figures → FREE Delivery!",
    sub: "",
    active: true,
  },
  {
    type: "keychain",
    icon: "💸",
    text: "Price Drop! Limited Offer",
    sub: "All keychains now at ₹119! 🎉",
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
  ...(typeof PRODUCTS_KEYCHAINS  !== "undefined" ? PRODUCTS_KEYCHAINS  : []),
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
let currentKeychainSubFilter = "all"; // for keychain sub-tabs: all | minecraft | batman
let currentSearch = "";
let holdTimer = null;
let shuffleOrder = null; // null = original order
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
    keychain:     "KEYCHAIN",
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
  // Apply shuffle order if active
  var sourceList = (shuffleOrder && filter === currentFilter) ? shuffleOrder : PRODUCTS;

  var filtered = sourceList.filter(function(p) {
    var typeMatch = filter === "all" || p.type === filter;
    var subMatch = true;
    if (filter === "poster" && currentSubFilter !== "all") {
      subMatch = p.subtype === currentSubFilter;
    }
    if (filter === "keychain" && currentKeychainSubFilter !== "all") {
      subMatch = p.subtype === currentKeychainSubFilter;
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

  // Show/hide keychain sub-tabs
  var keychainSubBar = document.getElementById("keychainSubBar");
  if (keychainSubBar) {
    keychainSubBar.style.display = (filter === "keychain") ? "flex" : "none";
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
    var multiHint = (hasImgs && p.imgs.length > 1)
      ? '<div class="multi-hint">👁 ' + p.imgs.length + ' photos</div>'
      : "";

    return (
      '<div class="product-card" data-type="' + p.type + '" data-id="' + p.id + '">' +
        '<div class="product-img-wrap" ' +
          'onclick="openLightbox(' + p.id + ')" ' +
          'oncontextmenu="return false" style="cursor:pointer">' +
          (firstImg
            ? '<img class="product-img" src="' + firstImg + '" alt="' + p.name + '" loading="lazy" draggable="false" />'
            : '<div class="product-img-placeholder">' + p.emoji + '</div>'
          ) +
          '<span class="badge-type">' + badgeLabel(p.type) + '</span>' +
          (!p.inStock ? '<div class="badge-sold">SOLD OUT</div>' : "") +
          multiHint +
        '</div>' +
        '<div class="product-info">' +
          '<div class="product-name">' + p.name + '</div>' +
          '<div class="product-series">' + p.series + '</div>' +
          '<div class="product-price">' + (p.oldPrice ? '<s>₹' + p.oldPrice + '</s> ' : '') + '₹' + p.price + '</div>' +
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
  lb.querySelector(".lb-price").innerHTML = (product.oldPrice ? "<s>₹" + product.oldPrice + "</s> " : "") + "₹" + product.price;

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
  if (lbImgs.length === 0) return;
  lbIndex = ((idx % lbImgs.length) + lbImgs.length) % lbImgs.length; // infinite loop 🔄
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
    // If user scrolled past last slide (native scroll bounce), wrap to first
    if (newIdx >= lbImgs.length) {
      lbGoTo(0);
    } else if (newIdx < 0) {
      lbGoTo(lbImgs.length - 1);
    } else {
      lbIndex = newIdx;
      renderLbDots();
      updateLbCounter();
    }
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
//  OFFER BANNER — saare active offers ek saath ticker mein
// ============================================================
function showOfferBanner(type) {
  var banner = document.getElementById("offerBanner");
  if (!banner) return;

  // Sirf current tab ka offer dikhao
  var activeOffers = OFFERS.filter(function(o) { return o.active && o.type === type; });
  if (activeOffers.length === 0) { banner.style.display = "none"; return; }

  var tickerItems = activeOffers.map(function(o) {
    return '<span class="offer-ticker-item">' +
      o.icon + ' ' + o.text +
      (o.sub ? ' — ' + o.sub.replace(/\n/g, ' ') : '') +
    '</span>';
  }).join('<span class="offer-ticker-sep">✦</span>');

  var tickerContent = tickerItems;

  banner.innerHTML =
    '<span class="offer-icon">🔥</span>' +
    '<div class="offer-ticker-wrap">' +
      '<div class="offer-ticker" id="offerTicker">' +
        tickerContent +
      '</div>' +
    '</div>' +
    '<span class="offer-tag">OFFERS</span>';

  banner.style.display = "flex";
}

// ============================================================
//  MAIN FILTER (POSTERS / FIGURES / POLAROID / FRAMES / CUSTOMIZABLE)
// ============================================================
function filterProducts(type, el) {
  currentFilter = type;
  shuffleOrder = null;
  if (type !== "poster") currentSubFilter = "all";
  if (type !== "keychain") currentKeychainSubFilter = "all";

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
  var keychainSubBar = document.getElementById("keychainSubBar");

  if (type === "customizable") {
    grid.style.display = "none";
    if (customPage) customPage.style.display = "flex";
    if (comingSoonPage) comingSoonPage.style.display = "none";
    if (searchWrap) searchWrap.style.display = "none";
    if (subBar) subBar.style.display = "none";
    if (keychainSubBar) keychainSubBar.style.display = "none";
  } else {
    grid.style.display = "";
    if (customPage) customPage.style.display = "none";
    if (comingSoonPage) comingSoonPage.style.display = "none";
    if (searchWrap) searchWrap.style.display = "";
    if (subBar) subBar.style.display = (type === "poster") ? "flex" : "none";
    if (keychainSubBar) keychainSubBar.style.display = (type === "keychain") ? "flex" : "none";

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
  document.querySelectorAll("#posterSubBar .sub-filter-btn").forEach(function(b) { b.classList.remove("active"); });
  el.classList.add("active");
  scrollTabToCenter(el);
  renderProducts("poster", currentSearch);
}

// ============================================================
//  KEYCHAIN SUB-FILTER (ALL / MINECRAFT / BATMAN)
// ============================================================
function filterKeychainsBy(subtype, el) {
  currentKeychainSubFilter = subtype;
  currentPage = 1;
  document.querySelectorAll("#keychainSubBar .sub-filter-btn").forEach(function(b) { b.classList.remove("active"); });
  el.classList.add("active");
  scrollTabToCenter(el);
  renderProducts("keychain", currentSearch);
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
      // No active poster cart offer currently
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

    if (offer.type === "figure") {
      if (qtyOfType >= 2) {
        applied.push({
          icon: "🚚",
          label: "2+ Figures → Free Delivery!",
          discount: 0,
          note: "FREE DELIVERY"
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
//  ORDER ON INSTAGRAM — Step 1: Show Delivery Details Form
// ============================================================
function orderOnInstagram() {
  if (cart.length === 0) { showToast("Cart is empty!"); return; }
  showDeliveryForm();
}

// ============================================================
//  DELIVERY DETAILS FORM MODAL — postiiify boxy style
// ============================================================
var dfPayMode = "COD";
var lastDeliveryInfo = null; // store for going back from order preview

function showDeliveryForm(prefill) {
  var existing = document.getElementById("deliveryFormModal");
  if (existing) existing.remove();
  if (!prefill) dfPayMode = "Online (UPI/GPay)";

  var p = prefill || {};

  var modal = document.createElement("div");
  modal.id = "deliveryFormModal";
  modal.className = "order-preview-overlay";
  modal.innerHTML = [
    '<div class="df-modal">',

      // Header
      '<div class="df-header">',
        '<div>',
          '<div class="df-step">Step 1 of 2</div>',
          '<div class="df-title">Delivery details</div>',
        '</div>',
        '<button class="df-close-btn" onclick="closeDeliveryForm()">&#x2715;</button>',
      '</div>',

      // Body
      '<div class="df-body">',

        // Payment — TOP pe
        '<div class="df-field">',
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">',
            '<label class="df-label">Payment</label>',
            '<div class="df-cod-warn" id="df_cod_warn" style="display:' + (prefill && p.payMode === 'COD' ? 'flex' : 'none') + '">',
              '<span class="df-cod-warn-icon">!</span>',
              '<span class="df-cod-warn-text">Partial payment required</span>',
            '</div>',
          '</div>',
          '<div class="df-pay-toggle">',
            '<button class="df-pay-btn' + (prefill && p.payMode === 'COD' ? ' df-pay-active' : '') + '" id="df_cod" onclick="dfSelectPay(\'COD\', this)">Cash on delivery</button>',
            '<button class="df-pay-btn' + (!prefill || p.payMode !== 'COD' ? ' df-pay-active' : '') + '" id="df_online" onclick="dfSelectPay(\'Online (UPI/GPay)\', this)">Online / UPI</button>',
          '</div>',
        '</div>',

        // Name + Phone
        '<div class="df-row2">',
          '<div class="df-field">',
            '<label class="df-label" for="df_name">Name</label>',
            '<input class="df-input" id="df_name" type="text" placeholder="Xxx Yadav" autocomplete="name" value="' + (p.name||'') + '" />',
          '</div>',
          '<div class="df-field">',
            '<label class="df-label" for="df_phone">Phone</label>',
            '<input class="df-input" id="df_phone" type="tel" placeholder="9876543210" autocomplete="tel" maxlength="10" value="' + (p.phone||'') + '" />',
          '</div>',
        '</div>',

        // Email
        '<div class="df-field">',
          '<label class="df-label" for="df_email">Email <span style="font-size:10px;color:var(--text-dim)">(optional)</span></label>',
          '<input class="df-input" id="df_email" type="email" placeholder="xxx@gmail.com" autocomplete="email" value="' + (p.email||'') + '" />',
        '</div>',

        // Address
        '<div class="df-field">',
          '<label class="df-label" for="df_address">Address</label>',
          '<textarea class="df-input df-textarea" id="df_address" placeholder="House no., Street, Locality..." rows="2" autocomplete="street-address">' + (p.address||'') + '</textarea>',
        '</div>',

        // City + Pincode
        '<div class="df-row2">',
          '<div class="df-field">',
            '<label class="df-label" for="df_city">City</label>',
            '<input class="df-input" id="df_city" type="text" placeholder="Delhi" autocomplete="address-level2" value="' + (p.city||'') + '" />',
          '</div>',
          '<div class="df-field">',
            '<label class="df-label" for="df_pin">Pincode</label>',
            '<input class="df-input" id="df_pin" type="number" placeholder="110001" value="' + (p.pin||'') + '" />',
          '</div>',
        '</div>',

      '</div>',

      // Footer
      '<div class="df-footer">',
        '<button class="df-cancel-btn" onclick="closeDeliveryForm()">Cancel</button>',
        '<button class="df-continue-btn" onclick="submitDeliveryForm()">Continue →</button>',
      '</div>',

    '</div>'
  ].join("");

  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add("open"); }, 10);

  // Focus hone par field scroll into view
  setTimeout(function() {
    var body = modal.querySelector(".df-body");
    if (body) {

      // Har df-field mai enter icon add karo
      body.querySelectorAll(".df-field").forEach(function(field) {
        var icon = document.createElement("span");
        icon.className = "df-enter-icon";
        icon.textContent = "↵";
        icon.style.pointerEvents = "auto";
        icon.style.cursor = "pointer";
        icon.addEventListener("mousedown", function(e) {
          e.preventDefault(); // focusout trigger karo without blur issues
          var input = field.querySelector(".df-input, .df-textarea");
          if (input) input.blur();
        });
        field.appendChild(icon);
      });

      // Typing hone par icon show/hide karo
      body.addEventListener("input", function(e) {
        var el = e.target;
        if (!el || (!el.matches(".df-input") && !el.matches(".df-textarea"))) return;
        var field = el.closest(".df-field");
        if (!field) return;
        if (el.value.trim()) {
          field.classList.add("df-typing");
        } else {
          field.classList.remove("df-typing");
        }
      });

      // Focus hatne par icon hide karo
      body.addEventListener("focusout", function(e) {
        var el = e.target;
        if (!el) return;
        var field = el.closest(".df-field");
        if (field) field.classList.remove("df-typing");

        if (!el.matches(".df-input") && !el.matches(".df-textarea")) return;
        var field = el.closest(".df-field");
        if (!field) return;
        var val = el.value ? el.value.trim() : "";
        if (!val) return;
        if (field.classList.contains("df-filled")) return;

        var label = field.querySelector(".df-label");

        // Filled value span add karo
        var span = field.querySelector(".df-filled-value");
        if (!span) {
          span = document.createElement("span");
          span.className = "df-filled-value";
          field.appendChild(span);
        }
        span.textContent = val;

        var edit = field.querySelector(".df-filled-edit");
        if (!edit) {
          edit = document.createElement("span");
          edit.className = "df-filled-edit";
          edit.textContent = "✎ edit";
          field.appendChild(edit);
        }

        field.classList.add("df-filled");

        // Field ko body ke neeche move karo
        body.appendChild(field);

        // Click karne par expand + top pe move karo
        field.onclick = function() {
          field.classList.remove("df-filled");
          // Sabse upar le jao
          var firstChild = body.firstChild;
          body.insertBefore(field, firstChild);
          var input = field.querySelector(".df-input, .df-textarea");
          if (input) input.focus();
          field.onclick = null;
        };
      });
    }
  }, 100);

  if (!prefill) {
    setTimeout(function() {
      var el = document.getElementById("df_name");
      if (el) el.focus();
    }, 200);
  }
}

function dfSelectPay(mode, btn) {
  dfPayMode = mode;
  document.querySelectorAll(".df-pay-btn").forEach(function(b) { b.classList.remove("df-pay-active"); });
  btn.classList.add("df-pay-active");
  var warn = document.getElementById("df_cod_warn");
  if (warn) warn.style.display = (mode === "COD") ? "flex" : "none";
}

function closeDeliveryForm() {
  var modal = document.getElementById("deliveryFormModal");
  if (modal) {
    modal.classList.remove("open");
    setTimeout(function() { modal.remove(); }, 300);
  }
}

function submitDeliveryForm() {
  var name    = (document.getElementById("df_name").value || "").trim();
  var phone   = (document.getElementById("df_phone").value || "").trim();
  var email   = (document.getElementById("df_email").value || "").trim();
  var address = (document.getElementById("df_address").value || "").trim();
  var city    = (document.getElementById("df_city").value || "").trim();
  var pin     = (document.getElementById("df_pin").value || "").trim();

  if (!name)    { shakeField("df_name");    showToast("Name daalo!"); return; }
  if (!phone || phone.length < 10) { shakeField("df_phone"); showToast("Valid phone daalo!"); return; }
  if (!address) { shakeField("df_address"); showToast("Address daalo!"); return; }
  if (!city)    { shakeField("df_city");    showToast("City daalo!"); return; }
  if (!pin || pin.length < 6) { shakeField("df_pin"); showToast("Valid pincode daalo!"); return; }

  var deliveryInfo = { name: name, phone: phone, email: email, address: address, city: city, pin: pin, payMode: dfPayMode };
  closeDeliveryForm();
  setTimeout(function() { buildAndShowOrder(deliveryInfo); }, 350);
}

function shakeField(id) {
  var el = document.getElementById(id);
  if (!el) return;

  // Agar field collapsed hai to pehle expand karo
  var field = el.closest(".df-field");
  if (field && field.classList.contains("df-filled")) {
    field.classList.remove("df-filled");
    var body = field.closest(".df-body");
    if (body) body.insertBefore(field, body.firstChild);
    field.onclick = null;
  }

  el.classList.add("df-shake");
  setTimeout(function() { el.focus(); }, 50);
  setTimeout(function() { el.classList.remove("df-shake"); }, 500);
}

// ============================================================
//  BUILD ORDER MESSAGE (with delivery details)
// ============================================================
function buildAndShowOrder(delivery) {
  lastDeliveryInfo = delivery; // save for going back

  var itemsList = cart.map(function(item, i) {
    var line = (i + 1) + ". " + item.name + " (" + item.series + ")";
    if (item.qty > 1) line += " × " + item.qty;
    line += " — ₹" + (item.price * item.qty);
    return line;
  }).join("\n");

  var totalQty  = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var subtotal  = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
  var appliedOffers  = calcAppliedOffers();
  var totalDiscount  = appliedOffers.reduce(function(s, o) { return s + o.discount; }, 0);
  var finalTotal     = Math.max(0, subtotal - totalDiscount);

  var offerLines = "";
  if (appliedOffers.length > 0) {
    offerLines = "\n\n🎉 OFFERS APPLIED:\n" + appliedOffers.map(function(o) {
      return o.icon + " " + o.label + (o.discount > 0 ? " (−₹" + o.discount + ")" : o.note === "DELIVERY CHARGE" ? " ⚠️ Please confirm delivery charge in DM" : " (" + o.note + ")");
    }).join("\n");
  }

  var message =
    "🛒 Order from postiiify website!\n\n" +
    itemsList +
    offerLines +
    "\n\n──────────────────\n" +
    "Items: " + totalQty + "  |  Total: ₹" + finalTotal +
    (totalDiscount > 0 ? "  (saved ₹" + totalDiscount + "! 🎉)" : "") +
    "\n\n📦 DELIVERY DETAILS:\n" +
    "👤 Name    : " + delivery.name + "\n" +
    "📱 Phone   : " + delivery.phone + "\n" +
    (delivery.email ? "📧 Email   : " + delivery.email + "\n" : "") +
    "🏠 Address : " + delivery.address + "\n" +
    "🏙️ City    : " + delivery.city + "\n" +
    "📮 Pincode : " + delivery.pin + "\n" +
    "💳 Payment : " + delivery.payMode;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(function() {});
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
      '<div class="op-step-bar">',
        '<button class="op-step-item op-step-done op-step-clickable" onclick="goBackToDeliveryForm()" title="Edit delivery details">',
          '<span class="op-step-num">&#10003;</span>',
          '<span class="op-step-lbl">Delivery details</span>',
          '<span class="op-step-edit">&#9998; edit</span>',
        '</button>',
        '<div class="op-step-arrow">&#8250;</div>',
        '<div class="op-step-item op-step-active">',
          '<span class="op-step-num">2</span>',
          '<span class="op-step-lbl">Order message</span>',
        '</div>',
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

function goBackToDeliveryForm() {
  closeOrderPreview();
  setTimeout(function() {
    showDeliveryForm(lastDeliveryInfo);
  }, 320);
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
//  SHUFFLE POSTERS
// ============================================================
function shuffleAll() {
  // Get current tab's products
  var typeItems = PRODUCTS.filter(function(p) { return p.type === currentFilter; });
  var others = PRODUCTS.filter(function(p) { return p.type !== currentFilter; });

  // Fisher-Yates shuffle
  for (var i = typeItems.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = typeItems[i]; typeItems[i] = typeItems[j]; typeItems[j] = tmp;
  }
  shuffleOrder = typeItems.concat(others);
  currentPage = 1;

  // Simple flash animation
  var btn = document.getElementById("shuffleBtn");
  if (btn) {
    btn.classList.add("shuffled");
    btn.textContent = "✅";
    setTimeout(function() {
      btn.classList.remove("shuffled");
      btn.textContent = "🔀";
    }, 600);
  }
  renderProducts(currentFilter, currentSearch);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  // Auto-shuffle all products on page load
  autoShuffleAll();

  var subBar = document.getElementById("posterSubBar");
  if (subBar) subBar.style.display = "flex";
  showOfferBanner("poster");
});

function autoShuffleAll() {
  // Shuffle entire PRODUCTS array in place (Fisher-Yates)
  for (var i = PRODUCTS.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = PRODUCTS[i]; PRODUCTS[i] = PRODUCTS[j]; PRODUCTS[j] = tmp;
  }
  renderProducts("poster", "");
}

function handleLbOverlayClick(e) {
  if (e.target === document.getElementById("lightbox")) closeLightbox();
}
