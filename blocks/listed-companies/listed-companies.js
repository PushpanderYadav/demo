// listed-companies.js
// Combined version – WORKING + FIXED + localStorage CACHED (60s)

const STOCK_API_URL =
  "https://gmrapi.itsneobot.com/api/share/get-latest-share-price";
    const apiKey = document.querySelector('meta[name="api-key"]').getAttribute('content');
  const AUTH_TOKEN = apiKey;

// ────────────────────────────────────────────────
// Cache Configuration
// ────────────────────────────────────────────────
const CACHE_KEY = "listed-companies-stock-data";
const CACHE_TIME_KEY = "listed-companies-stock-data-time";
const CACHE_TTL = 60 * 1000; // 60 seconds

// ────────────────────────────────────────────────
// Utility: Fetch stock data with localStorage cache
// ────────────────────────────────────────────────
async function fetchStockPrices(skipCache = false) {
  try {
    if (!skipCache) {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < CACHE_TTL) {
          return JSON.parse(cached);
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(STOCK_API_URL, {
      signal: controller.signal,
      method: "GET",
      headers: {
        Authorization: AUTH_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Invalid response format");
    }

    if (json.data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }

    return json.data;
  } catch (err) {
    console.error("[Stock API] Fetch failed:", err);
    const fallback = localStorage.getItem(CACHE_KEY);
    if (fallback) return JSON.parse(fallback);
    throw err;
  }
}

// ────────────────────────────────────────────────
// Format stock card HTML
// ────────────────────────────────────────────────
function renderStockOverview(companyData, displayName) {
  if (!companyData || !companyData.exchanges?.length) {
    return `<div class="error">No market data available for ${displayName}</div>`;
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
    } catch { }
  }

  let html = `
    <div class="d-sm-flex align-items-center">
      <div class="market-title">${displayName} - MARKET OVERVIEW</div>
      <div class="as-on mt-sm-0 mt-2">As on ${displayTime}</div>
    </div>
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
            <span class="arrow ${isNegative ? "negative" : "positive"}">${arrow}</span>
            ₹${ex.lastTradedPrice.toFixed(2)}
          </div>
          <div class="change ${isNegative ? "negative" : "positive"}">
            ${Math.abs(ex.change).toFixed(2)} (${Math.abs(ex.changePercent).toFixed(2)}%)
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

// ────────────────────────────────────────────────
// Main decorate function
// ────────────────────────────────────────────────
export default async function decorate(block) {
  const children = [...block.children];

  /* ===============================
     HEADER
  =============================== */

  const header = document.createElement("header");
  header.className = "d-md-flex align-items-center gap-3";

  const entryContainer = document.createElement("div");
  entryContainer.className = "entry-container fullCont mb-md-5";

  if (children[0]) {
    const h2 = document.createElement("h2");
    while (children[0].firstChild) {
      h2.appendChild(children[0].firstChild);
    }
    entryContainer.appendChild(h2);
  }

  if (children[1]) entryContainer.appendChild(children[1]);
  header.appendChild(entryContainer);

  if (children[2] && children[3]) {
    const btn = document.createElement("a");
    btn.href = children[3].textContent.trim() || "#";
    btn.className = "btn btn-primary";
    btn.textContent = children[2].textContent.trim();
    header.appendChild(btn);
  }

  /* ===============================
     COMPANIES GRID
  =============================== */

  const companiesCol = document.createElement("div");
  companiesCol.className = "companiesCol";

  const row = document.createElement("div");
  row.className = "row";

  const stockDivsMap = new Map();

  for (let i = 4; i < children.length; i++) {
    const companyItem = children[i];
    if (!companyItem || companyItem.children.length < 3) continue;

    companyItem.classList.add("listed-company-item");

    const col = document.createElement("div");
    col.className = "col-lg-6 mt-4";

    const companiesGrid = document.createElement("div");
    companiesGrid.className = "companiesGrid";

    const h3 = document.createElement("h3");
    const p = companyItem.children[0].querySelector("p");
    h3.textContent = p
      ? p.textContent.trim()
      : companyItem.children[0].textContent.trim();
    companyItem.replaceChild(h3, companyItem.children[0]);

    const symbol = companyItem.children[2]?.textContent.trim();

    [...companyItem.children].forEach((child, index) => {
      if (index > 1) child.style.display = "none";
    });

    const companiesStock = document.createElement("div");
    companiesStock.className = "companiesStock";
    companiesStock.innerHTML =
      '<div class="loading">Loading market data...</div>';

    if (symbol) stockDivsMap.set(symbol, companiesStock);

    const btnContainer = document.createElement("div");
    btnContainer.className = "companies-links mt-5 mb-4";

    if (companyItem.children[3] && companyItem.children[4]) {
      const a = document.createElement("a");
      a.href = companyItem.children[4].textContent.trim() || "#";
      a.className = "btn btn-circle";
      a.textContent = companyItem.children[3].textContent.trim();

      // Open in new tab
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      btnContainer.appendChild(a);
    }

    if (companyItem.children[5] && companyItem.children[6]) {
      const a = document.createElement("a");
      a.href = companyItem.children[6].textContent.trim() || "#";
      a.className = "btn btn-circle";
      a.textContent = companyItem.children[5].textContent.trim();
      btnContainer.appendChild(a);
    }

    companiesGrid.appendChild(companyItem);
    companiesGrid.appendChild(btnContainer);
    col.appendChild(companiesGrid);
    col.appendChild(companiesStock);
    row.appendChild(col);
  }

  companiesCol.appendChild(row);
  block.replaceChildren(header, companiesCol);

  /* ===============================
     API CALL – CACHED + BY CODE
  =============================== */

  // Defer execution to avoid blocking rendering with SWR
  (async () => {
    const CACHE_KEY = "listed-companies-stock-data";
    const CACHE_TIME_KEY = "listed-companies-stock-data-time";
    const TTL = 60000; // 60 seconds

    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    let isStale = true;

    const symbolToCompanyCode = {
      GAL: "15210029",
      GPUIL: "15131133",
    };

    const updateUI = (data) => {
      const apiDataByCode = {};
      data.forEach((item) => {
        if (item.companyCode) {
          apiDataByCode[String(item.companyCode)] = item;
        }
      });

      for (const [symbol, stockDiv] of stockDivsMap.entries()) {
        const code = symbolToCompanyCode[symbol];
        const companyData = code ? apiDataByCode[code] : null;

        stockDiv.innerHTML = companyData
          ? renderStockOverview(companyData, symbol)
          : `<div class="error">No data found for ${symbol}</div>`;
      }
    };

    if (cached && cachedTime) {
      try {
        const data = JSON.parse(cached);
        updateUI(data);
        const age = Date.now() - Number(cachedTime);
        if (age < TTL) isStale = false;
        console.log(`[Listed Companies] Cache found (age: ${Math.round(age / 1000)}s), stale: ${isStale}`);
      } catch (e) {
        console.error("Cache Parse Error:", e);
      }
    }

    // Always revalidate if stale or missing
    if (isStale || !cached) {
      try {
        const freshData = await fetchStockPrices(true);
        updateUI(freshData);
        console.log("[Listed Companies] UI refreshed with fresh data");
      } catch (err) {
        console.error("[Stock API] Failed to load fresh data:", err);
        if (!cached) {
          for (const stockDiv of stockDivsMap.values()) {
            stockDiv.innerHTML = '<div class="error">Market data unavailable</div>';
          }
        }
      }
    }
  })();
}
