/**
 * Header Utility Block – FINAL (Code-Based Lookup)
 * Stocks (Left) | Contact + Language + Icons (Right)
 * Universal Editor SAFE
 * Includes: Caching Strategy & ID-Based Lookup
 */

// Language mapping for UI labels - TOP LEVEL SCOPE
const langMatchMap = {
  en: "ENG",
  ja: "日本語",
  id: "Bahasa Indonesia",
  fr: "Français",
  es: "Español",
  el: "Ελληνικά",
  "zh-sg": "中文 (简体)",
  "zh-cn": "中文 (简体)",
};
export default async function decorate(block) {
  /* ===============================
     CONFIG (ID MAPPING)
     =============================== */
  // Mapped to Company Codes (Stable IDs) from your API
  const STOCK_CODES = {
    GAL: "15210029", // GMR Airports Ltd.
    GPUIL: "15131133", // GMR Power and Urban Infra Ltd.
  };

  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
     1️⃣ READ JSON MODEL (ROW BASED)
     =============================== */
  const stock1 = rows[0]?.textContent?.trim() || "";
  const stock2 = rows[1]?.textContent?.trim() || "";
  const contactLabel = rows[2]?.textContent?.trim() || "CONTACT";
  const contactUrl = rows[3]?.textContent?.trim() || "#";
  const stockSymbols = [stock1, stock2].filter(Boolean);

  /* ===============================
     2️⃣ HIDE AUTHORED ROWS (UE SAFE)
     =============================== */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ===============================
     3️⃣ BUILD RUNTIME DOM
     =============================== */
  const wrapper = document.createElement("div");
  wrapper.className = "header-utility-content";

  /* ---------- STOCK TICKER ---------- */
  const stockTicker = document.createElement("div");
  stockTicker.className = "stock-ticker d-xl-block d-none";

  const stockTrack = document.createElement("div");
  stockTrack.className = "stock-track";
  stockTrack.innerHTML = `<div class="stock-loading">Loading market data…</div>`;

  stockTicker.appendChild(stockTrack);

  /* ---------- RIGHT UTILITIES ---------- */
  const utilityNav = document.createElement("div");
  utilityNav.className = "utility-nav position-relative";

  /* CONTACT */
  const contactGroup = document.createElement("div");
  contactGroup.className = "nav-group contact-group";
  contactGroup.innerHTML = `
    <a href="${contactUrl}" class="nav-label">
      ${contactLabel}
    </a>
  `;

  /* LANGUAGE */
  const langGroup = document.createElement("div");
  langGroup.className = "nav-group language-group";

  // Determine initial label based on currentLang
  const currentLangCode = window.location.pathname.split('/').find(s => s.length === 2 && /^[a-z]{2}$/.test(s)) || 'en';
  const initialLabel = langMatchMap[currentLangCode] || 'ENG';

  langGroup.innerHTML = `
    <div class="language-dropdown">
      <span class="nav-label language-trigger">
        <span class="current-lang">${initialLabel}</span>
        <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
        </svg></span>
      </span>
      <div class="language-dropdown-menu">
        <button class="language-option ${currentLangCode === 'en' ? 'active' : ''}" data-lang="en" data-name="ENG">
          <span class="lang-native">English</span>
          <span class="lang-code">en</span>
        </button>
        <button class="language-option ${currentLangCode === 'ja' ? 'active' : ''}" data-lang="ja" data-name="日本語">
          <span class="lang-native">日本語</span>
          <span class="lang-code">ja</span>
        </button>
        <button class="language-option ${currentLangCode === 'id' ? 'active' : ''}" data-lang="id" data-name="Bahasa Indonesia">
          <span class="lang-native">Bahasa Indonesia</span>
          <span class="lang-code">id</span>
        </button>
        <button class="language-option ${currentLangCode === 'fr' ? 'active' : ''}" data-lang="fr" data-name="Français">
          <span class="lang-native">Français</span>
          <span class="lang-code">fr</span>
        </button>
        <button class="language-option ${currentLangCode === 'es' ? 'active' : ''}" data-lang="es" data-name="Español">
          <span class="lang-native">Español</span>
          <span class="lang-code">es</span>
        </button>
        <button class="language-option ${currentLangCode === 'el' ? 'active' : ''}" data-lang="el" data-name="Ελληνικά">
          <span class="lang-native">Ελληνικά</span>
          <span class="lang-code">el</span>
        </button>
        <button class="language-option ${currentLangCode === 'zh-sg' ? 'active' : ''}" data-lang="zh-sg" data-name="中文 (简体)">
          <span class="lang-native">中文 (简体)</span>
          <span class="lang-code">zh-sg</span>
        </button>
        <button class="language-option ${currentLangCode === 'zh-cn' ? 'active' : ''}" data-lang="zh-cn" data-name="中文 (简体)">
          <span class="lang-native">中文 (简体)</span>
          <span class="lang-code">zh-cn</span>
        </button>
      </div>
    </div>
  `;


  /* BHASHINI BUTTON – swapped with language */
  const bhashiniGroup = document.createElement("div");
  bhashiniGroup.className = "nav-group bhashini-group";
  const bhashiniBtn = document.createElement("div");
  bhashiniBtn.className = "bhashini-btn";
  bhashiniGroup.appendChild(bhashiniBtn);

  /* ICONS */
  const iconsGroup = document.createElement("div");
  iconsGroup.className = "utility-icons";
  iconsGroup.innerHTML = `
    <button class="icon-btn audio-btn" id="speech-button" aria-label="Play Audio" type="button">
      <span class="icon-headphone">
        <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 17V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12V17" stroke="currentColor" stroke-width="1.5"/>
          <path d="M22 15.5V17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 15.5V17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8 13.8446C8 13.0802 8 12.698 7.82526 12.4323C7.73733 12.2985 7.62061 12.188 7.4844 12.1095C7.21371 11.9535 6.84812 11.9896 6.11694 12.0617C4.88487 12.1831 4.26884 12.2439 3.82737 12.5764C3.60394 12.7448 3.41638 12.9593 3.27646 13.2067C3 13.6955 3 14.3395 3 15.6276V17.1933C3 18.4685 3 19.1061 3.28198 19.5986C3.38752 19.7829 3.51981 19.9491 3.67416 20.0913C4.08652 20.4714 4.68844 20.5901 5.89227 20.8275C6.73944 20.9945 7.16302 21.078 7.47564 20.9021C7.591 20.8372 7.69296 20.7493 7.77572 20.6434C8 20.3565 8 19.9078 8 19.0104V13.8446Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 13.8446C16 13.0802 16 12.698 16.1747 12.4323C16.2627 12.2985 16.3794 12.188 16.5156 12.1095C16.7863 11.9535 17.1519 11.9896 17.8831 12.0617C19.1151 12.1831 19.7312 12.2439 20.1726 12.5764C20.3961 12.7448 20.5836 12.9593 20.7235 13.2067C21 13.6955 21 14.3395 21 15.6276V17.1933C21 18.4685 21 19.1061 20.718 19.5986C20.6125 19.7829 20.4802 19.9491 20.3258 20.0913C19.9135 20.4714 19.3116 20.5901 18.1077 20.8275C17.2606 20.9945 16.837 21.078 16.5244 20.9021C16.409 20.8372 16.307 20.7493 16.2243 20.6434C16 20.3565 16 19.9078 16 19.0104V13.8446Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <svg class="icon-stop" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <rect x="8" y="8" width="8" height="8" stroke="currentColor" stroke-width="1.5"/>
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </span>
    </button>
    <button class="icon-btn accessibility-btn" id="accessibility-button" aria-label="Accessibility Options" type="button">
      <span class="icon-accessibility">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M18 10C18 10 14.4627 11.5 12 11.5C9.53727 11.5 6 10 6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 12V13.4522M12 13.4522C12 14.0275 12.1654 14.5906 12.4765 15.0745L15 19M12 13.4522C12 14.0275 11.8346 14.5906 11.5235 15.0745L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </button>
  `;

  // Append in order: Contact → BHASHINI → Language → Icons
  utilityNav.append(contactGroup, bhashiniGroup, langGroup, iconsGroup);

  /* ---------- ASSEMBLE ---------- */
  wrapper.append(stockTicker, utilityNav);
  block.after(wrapper);

  /* ===============================
     4️⃣ INITIALIZE UTILITIES (NON-BLOCKING)
     =============================== */

  // 2. Initialize components in parallel (these are fast, run immediately)
  initBhashini(wrapper);
  initAccessibilityModal();
  initLanguageDropdown(wrapper);

  // 1. Fetch stock data — deferred via setTimeout(0) so decorate() resolves
  //    immediately and does NOT block header or other blocks from rendering.
  setTimeout(() => {
    (async () => {
      const CACHE_KEY = "header-stock-data";
      const CACHE_TIME_KEY = "header-stock-data-time";
      const TTL = 60000; // 60 seconds

      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      let isStale = true;

      // STEP 1: Always render from cache first (instant, no network wait)
      if (cached && cachedTime) {
        try {
          const data = JSON.parse(cached);
          renderStocks(stockTrack, stockSymbols, data, STOCK_CODES);
          const age = Date.now() - Number(cachedTime);
          if (age < TTL) isStale = false;
          console.log(`Stocks SWR: Cache found (age: ${Math.round(age / 1000)}s), stale: ${isStale}`);
        } catch (e) {
          console.error("Cache Parse Error:", e);
        }
      }

      // STEP 2: Revalidate in background only if stale or no cache exists
      if (isStale || !cached) {
        try {
          const freshData = await fetchStockData(true);
          renderStocks(stockTrack, stockSymbols, freshData, STOCK_CODES);
          console.log("Stocks SWR: UI refreshed with fresh data");
        } catch (e) {
          console.error("Stock Refresh Error:", e);
          if (!cached) {
            stockTrack.innerHTML = `<div class="stock-error">Market data unavailable</div>`;
          }
        }
      }
    })();
  }, 0);

  console.log("Header Utility initialized (optimized)");
}

/* ======================================================
   ACCESSIBILITY MODAL FUNCTIONALITY
   ====================================================== */
function initAccessibilityModal() {
  console.log("Initializing accessibility modal...");

  // Check if modal already exists
  if (document.getElementById("accessibility-modal")) {
    console.log("Accessibility modal already exists");
    return;
  }

  // Create modal HTML with two separate font size buttons
  const modalHTML = `
<div class="accessibility-modal" id="accessibility-modal">
  <div class="accessibility-modal-content">

    <div class="accessibility-modal-header">
      <h3 class="accessibility-modal-title">Accessibility Options</h3>
      <button class="accessibility-modal-close" aria-label="Close accessibility options">&times;</button>
    </div>

    <div class="accessibility-modal-body">
      <div class="accessibility-options">

        <!-- Smaller Text -->
        <button class="accessibility-font-btn" id="text-small-btn" data-action="text-small">
          <span class="option-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6666 16H20.6666V25.3333H24.6666V16H28.6666V12H16.6666V16ZM20.6666 5.33334H3.33325V9.33334H9.99992V25.3333H13.9999V9.33334H20.6666V5.33334Z" fill="#003366"/>
            </svg>
          </span>
          <span class="option-text">Smaller Text</span>
          <span class="option-checkmark"></span>
        </button>

        <!-- Bigger Text -->
        <button class="accessibility-font-btn" id="text-big-btn" data-action="text-big">
          <span class="option-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(-1 0 0 1 32 0)">
                <path d="M16.6666 16H20.6666V25.3333H24.6666V16H28.6666V12H16.6666V16ZM20.6666 5.33334H3.33325V9.33334H9.99992V25.3333H13.9999V9.33334H20.6666V5.33334Z" fill="#003366"/>
              </g>
            </svg>
          </span>
          <span class="option-text">Bigger Text</span>
          <span class="option-checkmark"></span>
        </button>

        <!-- Highlight Links -->
        <button class="accessibility-option-btn" data-option="highlight-links">
          <span class="option-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="mask0_1836_2723" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                <rect width="32" height="32" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_1836_2723)">
                <path d="M9.33341 22.6667C7.48897 22.6667 5.91675 22.0167 4.61675 20.7167C3.31675 19.4167 2.66675 17.8444 2.66675 16C2.66675 14.1556 3.31675 12.5833 4.61675 11.2833C5.91675 9.98334 7.48897 9.33334 9.33341 9.33334H13.3334C13.7112 9.33334 14.0279 9.46111 14.2834 9.71667C14.539 9.97222 14.6667 10.2889 14.6667 10.6667C14.6667 11.0444 14.539 11.3611 14.2834 11.6167C14.0279 11.8722 13.7112 12 13.3334 12H9.33341C8.2223 12 7.27786 12.3889 6.50008 13.1667C5.7223 13.9444 5.33341 14.8889 5.33341 16C5.33341 17.1111 5.7223 18.0556 6.50008 18.8333C7.27786 19.6111 8.2223 20 9.33341 20H13.3334C13.7112 20 14.0279 20.1278 14.2834 20.3833C14.539 20.6389 14.6667 20.9556 14.6667 21.3333C14.6667 21.7111 14.539 22.0278 14.2834 22.2833C14.0279 22.5389 13.7112 22.6667 13.3334 22.6667H9.33341ZM12.0001 17.3333C11.6223 17.3333 11.3056 17.2056 11.0501 16.95C10.7945 16.6944 10.6667 16.3778 10.6667 16C10.6667 15.6222 10.7945 15.3056 11.0501 15.05C11.3056 14.7944 11.6223 14.6667 12.0001 14.6667H20.0001C20.3779 14.6667 20.6945 14.7944 20.9501 15.05C21.2056 15.3056 21.3334 15.6222 21.3334 16C21.3334 16.3778 21.2056 16.6944 20.9501 16.95C20.6945 17.2056 20.3779 17.3333 20.0001 17.3333H12.0001ZM18.6667 22.6667C18.289 22.6667 17.9723 22.5389 17.7167 22.2833C17.4612 22.0278 17.3334 21.7111 17.3334 21.3333C17.3334 20.9556 17.4612 20.6389 17.7167 20.3833C17.9723 20.1278 18.289 20 18.6667 20H22.6667C23.7779 20 24.7223 19.6111 25.5001 18.8333C26.2779 18.0556 26.6667 17.1111 26.6667 16C26.6667 14.8889 26.2779 13.9444 25.5001 13.1667C24.7223 12.3889 23.7779 12 22.6667 12H18.6667C18.289 12 17.9723 11.8722 17.7167 11.6167C17.4612 11.3611 17.3334 11.0444 17.3334 10.6667C17.3334 10.2889 17.4612 9.97222 17.7167 9.71667C17.9723 9.46111 18.289 9.33334 18.6667 9.33334H22.6667C24.5112 9.33334 26.0834 9.98334 27.3834 11.2833C28.6834 12.5833 29.3334 14.1556 29.3334 16C29.3334 17.8444 28.6834 19.4167 27.3834 20.7167C26.0834 22.0167 24.5112 22.6667 22.6667 22.6667H18.6667Z" fill="#003366"/>
              </g>
            </svg>
          </span>
          <span class="option-text">Highlight Links</span>
          <span class="option-checkmark"></span>
        </button>

        <!-- Dark Mode -->
        <button class="accessibility-option-btn" data-option="dark-mode">
          <span class="option-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="mask0_1836_2729" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                <rect width="32" height="32" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_1836_2729)">
                <path d="M16.0001 29.3333C14.1556 29.3333 12.4223 28.9833 10.8001 28.2833C9.17786 27.5833 7.76675 26.6333 6.56675 25.4333C5.36675 24.2333 4.41675 22.8222 3.71675 21.2C3.01675 19.5778 2.66675 17.8444 2.66675 16C2.66675 14.1556 3.01675 12.4222 3.71675 10.8C4.41675 9.17777 5.36675 7.76666 6.56675 6.56666C7.76675 5.36666 9.17786 4.41666 10.8001 3.71666C12.4223 3.01666 14.1556 2.66666 16.0001 2.66666C17.8445 2.66666 19.5779 3.01666 21.2001 3.71666C22.8223 4.41666 24.2334 5.36666 25.4334 6.56666C26.6334 7.76666 27.5834 9.17777 28.2834 10.8C28.9834 12.4222 29.3334 14.1556 29.3334 16C29.3334 17.8444 28.9834 19.5778 28.2834 21.2C27.5834 22.8222 26.6334 24.2333 25.4334 25.4333C24.2334 26.6333 22.8223 27.5833 21.2001 28.2833C19.5779 28.9833 17.8445 29.3333 16.0001 29.3333ZM17.3334 26.5667C19.9779 26.2333 22.1945 25.0722 23.9834 23.0833C25.7723 21.0944 26.6667 18.7333 26.6667 16C26.6667 13.2667 25.7723 10.9056 23.9834 8.91666C22.1945 6.92777 19.9779 5.76666 17.3334 5.43333V26.5667Z" fill="#003366"/>
              </g>
            </svg>
          </span>
          <span class="option-text">Dark Mode</span>
          <span class="option-checkmark"></span>
        </button>

      </div>
    </div>

    <div class="accessibility-actions">
      <button class="accessibility-reset-btn" id="accessibility-reset">
        <span class="reset-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1836_2735)">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58001 4 4.01001 7.58 4.01001 12C4.01001 16.42 7.58001 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69001 18 6.00001 15.31 6.00001 12C6.00001 8.69 8.69001 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/>
            </g>
            <defs>
              <clipPath id="clip0_1836_2735">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </span>
        <span class="reset-text">Reset</span>
      </button>
    </div>

  </div>
</div>
`;

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  console.log("Modal HTML added to body");

  // Wait a bit for DOM to be ready, then set up event listeners
  setTimeout(() => {
    setupAccessibilityModalEvents();
  }, 100);
}

function setupAccessibilityModalEvents() {
  console.log("Setting up accessibility modal events...");

  // Get elements
  const accessibilityBtn = document.getElementById("accessibility-button");
  const modal = document.getElementById("accessibility-modal");

  if (!accessibilityBtn) {
    console.error("Accessibility button not found!");
    return;
  }

  if (!modal) {
    console.error("Accessibility modal not found!");
    return;
  }

  console.log("Found accessibility button and modal:", accessibilityBtn, modal);

  const closeBtn = modal.querySelector(".accessibility-modal-close");
  const resetBtn = document.getElementById("accessibility-reset");
  const optionButtons = modal.querySelectorAll(".accessibility-option-btn");
  const fontButtons = modal.querySelectorAll(".accessibility-font-btn");

  // Load saved preferences
  loadAccessibilityPreferences();
  setTimeout(() => {
    sendAccessibilityToTarget(getAccessibilityProfile());
  }, 500);

  // Toggle modal visibility
  accessibilityBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Accessibility button clicked!");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  });

  // Close modal when clicking close button
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  document.addEventListener("click", function (e) {
    if (
      modal.style.display === "block" &&
      !modal.contains(e.target) &&
      e.target !== accessibilityBtn
    ) {
      modal.style.display = "none";
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") {
      modal.style.display = "none";
    }
  });

  // Handle font button clicks
  fontButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      console.log("Font button clicked:", action);
      toggleFontSize(action, this);
    });
  });

  // Handle option button clicks
  optionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const option = this.getAttribute("data-option");
      console.log("Option clicked:", option);
      toggleAccessibilityOption(option, this);
    });
  });

  // Handle reset button
  resetBtn.addEventListener("click", function () {
    console.log("Reset button clicked - starting reset process");
    resetAccessibilityOptions();
    modal.style.display = "none";
  });

  console.log("Accessibility modal events setup complete");
}

// Font size functionality
let fontSizeLevel = 0;

function getAccessibilityProfile() {
  return {
    "profile.accessibility.fontLevel": fontSizeLevel,
    "profile.accessibility.darkMode":
      localStorage.getItem("accessibility-dark-mode") === "true",
    "profile.accessibility.highlightLinks":
      localStorage.getItem("accessibility-highlight-links") === "true",
  };
}

function toggleFontSize(action, button) {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById("accessibility-modal");

  if (!modal) return;

  // Remove all existing font size classes
  html.classList.remove(
    "font-size--1",
    "font-size--2",
    "font-size-1",
    "font-size-2",
  );
  body.classList.remove(
    "font-size--1",
    "font-size--2",
    "font-size-1",
    "font-size-2",
  );

  // Update level based on action
  if (action === "text-small") {
    // For small text, decrease the level (goes from 0 to -1 to -2)
    fontSizeLevel = Math.max(-2, fontSizeLevel - 1);
  } else if (action === "text-big") {
    // For big text, increase the level (goes from 0 to 1 to 2)
    fontSizeLevel = Math.min(2, fontSizeLevel + 1);
  }

  // Apply the appropriate class
  if (fontSizeLevel !== 0) {
    const cls =
      fontSizeLevel < 0
        ? `font-size--${Math.abs(fontSizeLevel)}`
        : `font-size-${fontSizeLevel}`;
    html.classList.add(cls);
    body.classList.add(cls);
    localStorage.setItem("accessibility-font-level", fontSizeLevel);
  } else {
    localStorage.removeItem("accessibility-font-level");
  }

  // Reset button UI
  modal.querySelectorAll(".accessibility-font-btn").forEach((btn) => {
    btn.classList.remove("active");
    const mark = btn.querySelector(".option-checkmark");
    if (mark) mark.style.display = "none";
  });

  // Activate correct button based on current level
  if (fontSizeLevel < 0) {
    // If font is smaller than normal, activate the "Smaller Text" button
    const smallBtn = modal.querySelector('[data-action="text-small"]');
    if (smallBtn) {
      smallBtn.classList.add("active");
      const checkmark = smallBtn.querySelector(".option-checkmark");
      if (checkmark) checkmark.style.display = "block";
    }
  } else if (fontSizeLevel > 0) {
    // If font is larger than normal, activate the "Bigger Text" button
    const bigBtn = modal.querySelector('[data-action="text-big"]');
    if (bigBtn) {
      bigBtn.classList.add("active");
      const checkmark = bigBtn.querySelector(".option-checkmark");
      if (checkmark) checkmark.style.display = "block";
    }
  }

  console.log("Font size level:", fontSizeLevel);
  sendAccessibilityToTarget(getAccessibilityProfile());
}

// function toggleAccessibilityOption(option, button) {
//   const html = document.documentElement;
//   const body = document.body;
//   const isActive = button.classList.contains('active');

//   console.log(`Toggling ${option}: currently ${isActive ? 'active' : 'inactive'}`);

//   switch (option) {
//     case 'highlight-links':
//       if (isActive) {
//         // Remove link highlighting
//         body.classList.remove('highlight-links-active');
//         html.classList.remove('highlight-links-active');
//         button.classList.remove('active');
//         localStorage.removeItem('accessibility-highlight-links');
//         console.log("Highlight links disabled");
//       } else {
//         // Add link highlighting
//         body.classList.add('highlight-links-active');
//         html.classList.add('highlight-links-active');
//         button.classList.add('active');
//         const checkmark = button.querySelector('.option-checkmark');
//         if (checkmark) checkmark.style.display = 'block';
//         localStorage.setItem('accessibility-highlight-links', 'true');
//         console.log("Highlight links enabled");
//       }
//       break;

//     case 'dark-mode':
//       if (isActive) {
//         // Remove dark mode
//         body.classList.remove('dark-mode-active');
//         html.classList.remove('dark-mode-active');
//         button.classList.remove('active');
//         localStorage.removeItem('accessibility-dark-mode');
//         console.log("Dark mode disabled");
//       } else {
//         // Add dark mode
//         body.classList.add('dark-mode-active');
//         html.classList.add('dark-mode-active');
//         button.classList.add('active');
//         const checkmark = button.querySelector('.option-checkmark');
//         if (checkmark) checkmark.style.display = 'block';
//         localStorage.setItem('accessibility-dark-mode', 'true');
//         console.log("Dark mode enabled");
//       }
//       break;
//   }
// }

function toggleAccessibilityOption(option, button) {
  const html = document.documentElement;
  const body = document.body;

  // If already active, do nothing
  if (button.classList.contains("active")) {
    return;
  }

  switch (option) {
    case "highlight-links":
      body.classList.add("highlight-links-active");
      html.classList.add("highlight-links-active");
      button.classList.add("active");
      localStorage.setItem("accessibility-highlight-links", "true");
      break;

    case "dark-mode":
      body.classList.add("dark-mode-active");
      html.classList.add("dark-mode-active");
      button.classList.add("active");
      localStorage.setItem("accessibility-dark-mode", "true");
      break;
  }

  // Show checkmark
  const checkmark = button.querySelector(".option-checkmark");
  if (checkmark) checkmark.style.display = "block";

  sendAccessibilityToTarget(getAccessibilityProfile());
}

function loadAccessibilityPreferences() {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById("accessibility-modal");

  if (!modal) return;

  console.log("Loading accessibility preferences...");

  // Font Size
  const savedLevel = localStorage.getItem("accessibility-font-level");
  if (savedLevel !== null) {
    fontSizeLevel = parseInt(savedLevel, 10);

    // Apply appropriate class
    if (fontSizeLevel !== 0) {
      const cls =
        fontSizeLevel < 0
          ? `font-size--${Math.abs(fontSizeLevel)}`
          : `font-size-${fontSizeLevel}`;
      html.classList.add(cls);
      body.classList.add(cls);
    }

    // Activate appropriate button
    if (fontSizeLevel < 0) {
      const smallBtn = modal.querySelector('[data-action="text-small"]');
      if (smallBtn) {
        smallBtn.classList.add("active");
        const checkmark = smallBtn.querySelector(".option-checkmark");
        if (checkmark) checkmark.style.display = "block";
      }
    } else if (fontSizeLevel > 0) {
      const bigBtn = modal.querySelector('[data-action="text-big"]');
      if (bigBtn) {
        bigBtn.classList.add("active");
        const checkmark = bigBtn.querySelector(".option-checkmark");
        if (checkmark) checkmark.style.display = "block";
      }
    }

    console.log("Loaded font size level:", fontSizeLevel);
  }

  // Highlight Links
  if (localStorage.getItem("accessibility-highlight-links") === "true") {
    body.classList.add("highlight-links-active");
    html.classList.add("highlight-links-active");
    const highlightBtn = modal.querySelector('[data-option="highlight-links"]');
    if (highlightBtn) {
      highlightBtn.classList.add("active");
      const checkmark = highlightBtn.querySelector(".option-checkmark");
      if (checkmark) checkmark.style.display = "block";
    }
    console.log("Loaded: Highlight Links enabled");
  }

  // Dark Mode
  if (localStorage.getItem("accessibility-dark-mode") === "true") {
    body.classList.add("dark-mode-active");
    html.classList.add("dark-mode-active");
    const darkModeBtn = modal.querySelector('[data-option="dark-mode"]');
    if (darkModeBtn) {
      darkModeBtn.classList.add("active");
      const checkmark = darkModeBtn.querySelector(".option-checkmark");
      if (checkmark) checkmark.style.display = "block";
    }
    console.log("Loaded: Dark Mode enabled");
  }
}

// function resetAccessibilityOptions() {
//   const html = document.documentElement;
//   const body = document.body;
//   const modal = document.getElementById('accessibility-modal');

//   if (!modal) return;

//   console.log("Resetting accessibility options...");

//   // Reset Highlight Links
//   html.classList.remove('highlight-links-active');
//   body.classList.remove('highlight-links-active');

//   // Reset Dark Mode
//   html.classList.remove('dark-mode-active');
//   body.classList.remove('dark-mode-active');

//   // Reset button states
//   modal.querySelectorAll('.accessibility-font-btn, .accessibility-option-btn').forEach(button => {
//     button.classList.remove('active');
//     const checkmark = button.querySelector('.option-checkmark');
//     if (checkmark) checkmark.style.display = 'none';
//   });

//   fontSizeLevel = 0;

//   html.classList.remove(
//     'font-size--1',
//     'font-size--2',
//     'font-size-1',
//     'font-size-2'
//   );
//   body.classList.remove(
//     'font-size--1',
//     'font-size--2',
//     'font-size-1',
//     'font-size-2'
//   );

//   // Clear localStorage;
//   localStorage.removeItem('accessibility-font-level');
//   localStorage.removeItem('accessibility-highlight-links');
//   localStorage.removeItem('accessibility-dark-mode');

//   console.log("Accessibility reset complete");
// }

function resetAccessibilityOptions() {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById("accessibility-modal");

  if (!modal) return;

  // Remove feature classes
  html.classList.remove("highlight-links-active", "dark-mode-active");
  body.classList.remove("highlight-links-active", "dark-mode-active");

  // Reset font size
  fontSizeLevel = 0;
  html.classList.remove(
    "font-size--1",
    "font-size--2",
    "font-size-1",
    "font-size-2",
  );
  body.classList.remove(
    "font-size--1",
    "font-size--2",
    "font-size-1",
    "font-size-2",
  );

  // Reset UI state
  modal
    .querySelectorAll(".accessibility-font-btn, .accessibility-option-btn")
    .forEach((btn) => {
      btn.classList.remove("active");
      const mark = btn.querySelector(".option-checkmark");
      if (mark) mark.style.display = "none";
    });

  // Clear storage
  localStorage.removeItem("accessibility-font-level");
  localStorage.removeItem("accessibility-highlight-links");
  localStorage.removeItem("accessibility-dark-mode");
  sendAccessibilityToTarget(getAccessibilityProfile());
}

/* ======================================================
   LANGUAGE DROPDOWN FUNCTIONALITY
   ====================================================== */
function initLanguageDropdown(container) {
  console.log("Initializing language dropdown...");

  const languageContainer = container.querySelector(".language-dropdown");
  const languageTrigger = container.querySelector(".language-trigger");
  const languageDropdown = container.querySelector(".language-dropdown-menu");
  const languageOptions = container.querySelectorAll(".language-option");

  if (!languageTrigger || !languageDropdown || !languageContainer) {
    console.error("Language dropdown elements not found in container");
    return;
  }

  // 1. Detect language from URL path (Source of Truth)
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split("/");
  let detectedLang = "";

  // Find the first segment that matches our known languages
  for (const segment of pathSegments) {
    const cleanSegment = segment.toLowerCase().trim();
    if (langMatchMap[cleanSegment]) {
      detectedLang = cleanSegment;
      break;
    }
  }

  // 2. Load saved preference as fallback
  const savedLang = localStorage.getItem("selected-language");
  const savedLangName = localStorage.getItem("selected-language-name");

  console.log(`Language Sync - URL: "${detectedLang}", Saved: "${savedLang}"`);

  // Determine behavior
  if (detectedLang) {
    // If URL has a language, sync storage and update UI (no redirect here)
    console.log(`Dropdown Init: Syncing UI to URL language "${detectedLang}".`);
    updateSelectedLanguage(detectedLang, langMatchMap[detectedLang], container, true, false);
  } else if (savedLang && langMatchMap[savedLang]) {
    // This case (root / or no-lang-path) is now handled by scripts.js early redirect.
    // If we reach here, scripts.js likely didn't redirect (e.g. root page en -> en),
    // so we just sync storage and UI.
    updateSelectedLanguage(savedLang, langMatchMap[savedLang], container, true, false);
  } else {
    // Default fallback to English (no reload)
    updateSelectedLanguage("en", "ENG", container, true, false);
  }

  // Toggle dropdown on click
  languageTrigger.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    languageDropdown.classList.toggle("show");
    languageContainer.classList.toggle("open");
    console.log("Language dropdown toggled");
  });

  // Handle language selection
  languageOptions.forEach(option => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const langCode = this.getAttribute("data-lang");
      const langName = this.getAttribute("data-name");

      console.log(`Language selected: ${langName} (${langCode})`);

      // Update active state
      languageOptions.forEach(opt => opt.classList.remove("active"));
      this.classList.add("active");

      // Update display and save
      updateSelectedLanguage(langCode, langName, container, true);

      // Close dropdown
      languageDropdown.classList.remove("show");
      languageContainer.classList.remove("open");
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".language-dropdown")) {
      languageDropdown.classList.remove("show");
      languageContainer.classList.remove("open");
    }
  });

  // Close dropdown with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && languageDropdown.classList.contains("show")) {
      languageDropdown.classList.remove("show");
      languageContainer.classList.remove("open");
    }
  });

  console.log("Language dropdown initialized");
}

function updateSelectedLanguage(langCode, langName, container, saveToStorage = true, shouldReload = true) {
  const currentLangDisplay = container ? container.querySelector(".current-lang") : document.querySelector(".current-lang");

  if (currentLangDisplay) {
    // Update the displayed language
    currentLangDisplay.textContent = langName;
  }

  // Save to localStorage
  if (saveToStorage) {
    localStorage.setItem("selected-language", langCode);
    localStorage.setItem("selected-language-name", langName);
    console.log(`Language preference saved: ${langName} (${langCode})`);
  }

  if (shouldReload) {
    // Trigger Microsoft Translator (Adobe AEM default)
    // Update the html lang attribute
    document.documentElement.lang = langCode;

    // Path-based routing for AEM (e.g., abc.com/en/ -> abc.com/ja/)
    const currentUrl = new URL(window.location.href);
    const pathSegments = currentUrl.pathname.split("/");

    // AEM standard structure often has the language code as the first segment
    // Support both 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
    let langSegmentIndex = -1;
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      // Match 2-char codes OR hyphenated codes like zh-sg, zh-cn
      if (/^[a-z]{2}(-[a-z]{2})?$/.test(segment) && langMatchMap[segment]) {
        langSegmentIndex = i;
        break;
      }
    }

    if (langSegmentIndex !== -1) {
      pathSegments[langSegmentIndex] = langCode;
    } else {
      pathSegments.splice(1, 0, langCode);
    }

    const newPath = pathSegments.join("/").replace(/\/+/g, "/");

    // CRITICAL GUARD: Only redirect if the URL is actually changing
    if (currentUrl.pathname !== newPath) {
      console.log(`Redirecting to: ${newPath}`);
      currentUrl.pathname = newPath;
      window.location.href = currentUrl.toString();
    }
  }

  // Update active state in dropdown
  const languageOptions = container ? container.querySelectorAll(".language-option") : document.querySelectorAll(".language-option");
  languageOptions.forEach((option) => {
    if (option.getAttribute("data-lang") === langCode) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

/* ======================================================
   BHASHINI - ACTIVE
   ====================================================== */
function initBhashini(container) {
  // Look for bhashini-plugin-container inside the bhashini-group
  const bhashiniGroup = container.querySelector(".bhashini-group");
  if (!bhashiniGroup) return;

  if (bhashiniGroup.querySelector(".bhashini-plugin-container")) return;

  const bhashiniContainer = document.createElement("div");
  bhashiniContainer.className = "bhashini-plugin-container";
  bhashiniGroup.appendChild(bhashiniContainer);

  if (!document.getElementById("bhashini-script")) {
    const script = document.createElement("script");
    script.id = "bhashini-script";
    script.src =
      "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
    script.defer = true;
    script.onload = function () {
      console.log("Bhashini script loaded");
      setTimeout(() => setupBhashiniLanguageMonitoring(container), 1000);
    };
    script.onerror = () => {
      console.error("Failed to load Bhashini script");
      bhashiniContainer.innerHTML =
        '<span class="bhashini-error">Translation unavailable</span>';
    };
    document.body.appendChild(script);
  }
}

/* ======================================================
   BHASHINI LANGUAGE MONITORING - ACTIVE
   ====================================================== */
function setupBhashiniLanguageMonitoring(container) {
  console.log("Setting up Bhashini language monitoring");

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === "preferredLanguage") {
      updateLanguageIndicator(value, container);
    }
  };

  window.addEventListener("storage", function (e) {
    if (e.key === "preferredLanguage") {
      updateLanguageIndicator(e.newValue, container);
    }
  });

  if (window.BhashiniTranslationUtility) {
    window.BhashiniTranslationUtility.onLanguageChange = function (lang) {
      updateLanguageIndicator(lang, container);
    };
  }
}

function updateLanguageIndicator(langCode, container) {
  const langTrigger = container ? container.querySelector(".language-trigger") : document.querySelector(".language-trigger");
  if (!langTrigger) return;

  const currentLangDisplay = langTrigger.querySelector(".current-lang");

  const langNames = {
    en: "ENG",
    hi: "हिन्दी",
    ta: "தமிழ்",
    te: "తెలుగు",
    kn: "ಕನ್ನಡ",
    ml: "മലയാളം",
    mr: "मराठी",
    gu: "ગુજરાતી",
    pa: "ਪੰਜਾਬੀ",
    bn: "বাংলা",
    ur: "اردو",
    as: "অসমীয়া",
    brx: "बर",
    doi: "डोगरी",
    gom: "कोंकणी",
    ks: "कॉशुर",
    mai: "मैथिली",
    mni: "मैतैलोन्",
    ne: "नेपाली",
    or: "ଓଡ଼ିଆ",
    sa: "संस्कृतम्",
    sat: "ᱥᱟᱱᱛᱟᱲी",
    sd: "سنڌي",
  };

  const displayName = langNames[langCode] || langCode.toUpperCase();

  if (currentLangDisplay) {
    currentLangDisplay.textContent = displayName;
  } else {
    const arrowSvg =
      '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>';

    langTrigger.innerHTML = `<span class="current-lang">${displayName}</span> <span class="arrow">${arrowSvg}</span>`;
  }
}

/* ======================================================
   STOCK HELPERS (CACHING + CODE LOOKUP)
   ====================================================== */
async function fetchStockData(skipCache = false) {
  const API_URL =
    "https://gmrapi.itsneobot.com/api/share/get-latest-share-price";
    const apiKey = document.querySelector('meta[name="api-key"]').getAttribute('content');
  const AUTH_TOKEN = apiKey;

  const CACHE_KEY = "header-stock-data";
  const CACHE_TIME_KEY = "header-stock-data-time";
  const CACHE_TTL = 60000;
  const FETCH_TIMEOUT_MS = 5000; // 5-second hard timeout — prevents hanging if API is slow/down

  try {
    // Check internal cache logic if not skipping
    if (!skipCache) {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < CACHE_TTL) return JSON.parse(cached);
      }
    }

    // Use AbortController to enforce a fetch timeout.
    // If the stock API takes longer than 5s (e.g. backend is down), we abort
    // and fall back to cached data rather than keeping the page waiting.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`Stock API timed out after ${FETCH_TIMEOUT_MS / 1000}s — using cached data`);
    }, FETCH_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(API_URL, {
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) throw new Error(`API Error ${response.status}`);

    const json = await response.json();
    const data = json.success && Array.isArray(json.data) ? json.data : [];

    // Save to cache
    if (data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Stock fetch aborted (timeout) — serving stale cache if available");
    } else {
      console.error("Stock fetch failed:", error);
    }
    const fallback = localStorage.getItem(CACHE_KEY);
    return fallback ? JSON.parse(fallback) : [];
  }
}

function renderStocks(container, symbols, apiData, stockCodes) {
  container.innerHTML = "";

  // 1. Index the API data by Company Code for O(1) Lookup
  const apiDataMap = {};
  apiData.forEach((item) => {
    if (item.companyCode) {
      apiDataMap[String(item.companyCode)] = item;
    }
  });

  // 2. Iterate through requested symbols (GAL, GPUIL)
  [...new Set(symbols)].forEach((sym) => {
    const upperSym = sym.toUpperCase();
    // Lookup the correct ID from our CONFIG map
    const code = stockCodes[upperSym];
    const record = code ? apiDataMap[code] : null;

    // Show placeholder if no data found
    if (!record) {
      const item = document.createElement("div");
      item.className = `stock-item stock-code stock-${upperSym}`;
      item.innerHTML = `<strong>${sym}</strong><span class="stock-no-data">No data</span>`;
      container.appendChild(item);
      return;
    }

    const item = document.createElement("div");
    item.className = `stock-item stock-code stock-${upperSym}`;
    item.innerHTML = `<strong>${sym}</strong>`; // Display "GAL" (Short Name)

    if (record.exchanges && Array.isArray(record.exchanges)) {
      record.exchanges.forEach((ex) => {
        const down = ex.change < 0;
        const exchangeWrapper = document.createElement("div");
        exchangeWrapper.className = `exchange-wrapper ${down ? "trend-down" : "trend-up"} stock-${upperSym} exchange-${ex.exchange.toLowerCase()}`;

        const price = Number(ex.lastTradedPrice) || 0;
        const change = Number(ex.change) || 0;
        const changePercent = Number(ex.changePercent) || 0;

        exchangeWrapper.innerHTML = `
          <span class="exchange_name">${ex.exchange}</span>
          <span class="exchange_trend">${down ? "↓" : "↑"}</span>
          <span class="exchange_price">₹${price.toFixed(2)}</span>
          <span class="exchange_change">${change.toFixed(2)} (${changePercent.toFixed(2)}%)</span>
        `;

        item.appendChild(exchangeWrapper);
      });
    }

    container.appendChild(item);
  });

  if (!container.children.length) {
    container.innerHTML = `<div class="stock-empty">No active stocks</div>`;
  }
}

/* ======================================================
   ADOBE TARGET BRIDGE
   ====================================================== */

function sendAccessibilityToTarget(payload) {
  if (!window.alloy) {
    console.warn("Target Alloy not loaded yet");
    return;
  }

  const targetPayload = {
    "profile.fontLevel": payload["profile.accessibility.fontLevel"],
    "profile.darkMode": payload["profile.accessibility.darkMode"],
    "profile.highlightLinks": payload["profile.accessibility.highlightLinks"],
  };
  console.log("🎯 Sending accessibility profile to Target:", payload);

  window
    .alloy("sendEvent", {
      renderDecisions: true,
      data: {
        __adobe: {
          target: targetPayload,
        },
      },
    })
    .catch((err) => {
      console.error("Target send failed:", err);
    });
}
