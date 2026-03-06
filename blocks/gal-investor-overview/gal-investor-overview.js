const STOCK_API_URL =
  "https://gmrapi.itsneobot.com/api/share/get-latest-share-price";

    const apiKey = document.querySelector('meta[name="api-key"]').getAttribute('content');
  const AUTH_TOKEN = apiKey;

const CACHE_KEY = "gal-gpuil-stock-cache";
const CACHE_TIME_KEY = "gal-gpuil-stock-cache-time";
const CACHE_TTL = 60000;
const FETCH_TIMEOUT_MS = 5000;

/* ===============================
   FETCH STOCK WITH CACHE
=============================== */

async function fetchStockData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL) {
        return JSON.parse(cached);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(STOCK_API_URL, {
        method: "GET",
        headers: {
          Authorization: AUTH_TOKEN,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) throw new Error("API failed");

    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return json.data;
    }

    return [];
  } catch (e) {
    const fallback = localStorage.getItem(CACHE_KEY);
    return fallback ? JSON.parse(fallback) : [];
  }
}

/* ===============================
   MARKET HTML
=============================== */

function renderMarketHTML(companyData, displayName) {
  if (!companyData || !companyData.exchanges?.length) {
    return `<div class="stock-error">Market data unavailable</div>`;
  }

  let displayTime = "Latest";
  if (companyData.fetchedAt) {
    try {
      const dt = new Date(companyData.fetchedAt);
      displayTime = dt.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {}
  }

  let html = `
    <div class="market-title">${displayName} - MARKET OVERVIEW</div>
    <div class="as-on">As on ${displayTime}</div>
    <div class="exchanges">
  `;

  companyData.exchanges.slice(0, 2).forEach((ex) => {
    const isNegative = ex.change < 0;
    const arrow = isNegative ? "↓" : "↑";

    html += `
      <div class="exchange-row">
        <div class="exchange">${ex.exchange}</div>
        <div class="exchange_price">
          <div class="price">
            <span class="${isNegative ? "negative" : "positive"}">
              ${arrow} ₹${ex.lastTradedPrice.toFixed(2)}
            </span>
          </div>
          <div class="change ${isNegative ? "negative" : "positive"}">
            ${Math.abs(ex.change).toFixed(2)} 
            (${Math.abs(ex.changePercent).toFixed(2)}%)
          </div>
        </div>
      </div>
    `;
  });

  const mainVolume =
    companyData.exchanges[0]?.volume?.toLocaleString("en-IN") || "—";

  html += `
    </div>
    <div class="volume">Volume ${mainVolume}</div>
  `;

  return html;
}

/* ===============================
   DECORATE
=============================== */

export default async function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.search.includes("wcmmode=edit");

  if (isAuthorMode) return;

  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
     FIELD MAPPING (DO NOT SHIFT STATS)
  =============================== */

  const sectionTitle = rows[0]?.textContent?.trim();
  const sectionDescription = rows[1]?.innerHTML?.trim();

  const primaryBtnText = rows[2]?.textContent?.trim();
  const primaryBtnLink = rows[3]?.textContent?.trim();

  const secondaryBtnText = rows[4]?.textContent?.trim();
  const secondaryBtnLink = rows[5]?.textContent?.trim();

  const primaryTitle = rows[6]?.textContent?.trim();
  const primaryDescription = rows[7]?.innerHTML?.trim();

  const secondaryTitle = rows[8]?.textContent?.trim();
  const secondaryDescription = rows[9]?.innerHTML?.trim();

  /* ===============================
     STAT EXTRACTION (UNCHANGED)
  =============================== */

  const statRows = rows.slice(11);
  const stats = [];

  for (let i = 0; i < statRows.length; i += 2) {
    const textRow = statRows[i];
    const imageRow = statRows[i + 1];

    if (!textRow) continue;

    const text = textRow.innerHTML?.trim() || "";
    const image =
      imageRow?.querySelector("img")?.src ||
      imageRow?.querySelector("picture img")?.src ||
      "";

    if (text || image) {
      stats.push({ text, image });
    }
  }

  /* ===============================
     RENDER
  =============================== */

  block.innerHTML = `
    <div class="gal-investor-wrapper">

      <div class="investors-trust-wrapper">
        ${sectionTitle ? `<h2 class="investors-title">${sectionTitle}</h2>` : ""}
        ${sectionDescription ? `<div class="investors-desc">${sectionDescription}</div>` : ""}

        <div class="investors-cta">
          ${primaryBtnText ? `<button class="cta primary active">${primaryBtnText}</button>` : ""}
          ${secondaryBtnText ? `<button class="cta secondary">${secondaryBtnText}</button>` : ""}
        </div>
      </div>

      <!-- PRIMARY -->
      <div class="company-content primary-content">
        <div class="gal-content">
          <div class="gal-main">

            <div class="gal-left">
              ${primaryTitle ? `<h3>${primaryTitle}</h3>` : ""}
              ${primaryDescription ? `<div class="gal-desc">${primaryDescription}</div>` : ""}
              <div class="gal-market">
                <div class="market-symbol">Loading market data...</div>
              </div>
              ${primaryBtnLink ? `<a class="gal-cta" href="${primaryBtnLink}">Visit Website</a>` : ""}
            </div>

            <div class="gal-right">
              ${stats.map(stat => `
                <div class="gal-stat-card">
                  ${stat.image ? `
                    <div class="stat-image">
                      <img src="${stat.image}" alt="">
                    </div>
                  ` : ""}
                  ${stat.text ? `
                    <div class="stat-text">
                      ${stat.text}
                    </div>
                  ` : ""}
                </div>
              `).join("")}
            </div>

          </div>
        </div>
      </div>

      <!-- SECONDARY -->
      <div class="company-content secondary-content" style="display:none;">
        <div class="gal-content">
          <div class="gal-main">
            <div class="gal-left">
              ${secondaryTitle ? `<h3>${secondaryTitle}</h3>` : ""}
              ${secondaryDescription ? `<div class="gal-desc">${secondaryDescription}</div>` : ""}
              <div class="gal-market">
                <div class="market-symbol">Click to load market data</div>
              </div>
              ${secondaryBtnLink ? `<a class="gal-cta" href="${secondaryBtnLink}">Visit Website</a>` : ""}
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  const primaryBtn = block.querySelector(".cta.primary");
  const secondaryBtn = block.querySelector(".cta.secondary");
  const primaryContent = block.querySelector(".primary-content");
  const secondaryContent = block.querySelector(".secondary-content");

  const galContainer = primaryContent.querySelector(".market-symbol");
  const gpuilContainer = secondaryContent.querySelector(".market-symbol");

  const codeMap = {
    GAL: "15210029",
    GPUIL: "15131133",
  };

  let apiData = null;

  async function loadStock(symbol, container) {
    if (!container) return;

    container.innerHTML = "Loading market data...";

    if (!apiData) {
      apiData = await fetchStockData();
    }

    const apiByCode = {};
    apiData.forEach((item) => {
      if (item.companyCode) {
        apiByCode[String(item.companyCode)] = item;
      }
    });

    const companyData = apiByCode[codeMap[symbol]];
    container.innerHTML = renderMarketHTML(companyData, symbol);
  }

  primaryBtn?.addEventListener("click", async () => {
    primaryBtn.classList.add("active");
    secondaryBtn.classList.remove("active");
    primaryContent.style.display = "block";
    secondaryContent.style.display = "none";
    await loadStock("GAL", galContainer);
  });

  secondaryBtn?.addEventListener("click", async () => {
    secondaryBtn.classList.add("active");
    primaryBtn.classList.remove("active");
    primaryContent.style.display = "none";
    secondaryContent.style.display = "block";
    await loadStock("GPUIL", gpuilContainer);
  });

  setTimeout(() => {
    loadStock("GAL", galContainer);
  }, 0);
}






