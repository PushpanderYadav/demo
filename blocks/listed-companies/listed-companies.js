// listed-companies.js
// Combined version with API integration

const STOCK_API_URL = 'http://13.200.106.168:4000/api/share/get-latest-share-price';
const AUTH_TOKEN = 'U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw';

// ────────────────────────────────────────────────
// Utility: Fetch stock data
// ────────────────────────────────────────────────
async function fetchStockPrices() {
  try {
    const response = await fetch(STOCK_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': AUTH_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Invalid response format');
    }

    return json.data;
  } catch (err) {
    console.error('[Stock API] Fetch failed:', err);
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

  // Format timestamp
  let displayTime = 'Latest';
  if (companyData.fetchedAt) {
    try {
      const dt = new Date(companyData.fetchedAt);
      displayTime = dt.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch { }
  }

  let html = `
    <div class="d-flex align-items-center">  
      <div class="market-title">${displayName} - MARKET OVERVIEW</div>
      <div class="as-on">As on ${displayTime}</div>
    </div>
    <div class="exchanges">
  `;

  // Show NSE and BSE (first two exchanges)
  companyData.exchanges.slice(0, 2).forEach(ex => {
    const isNegative = ex.change < 0;
    const arrow = isNegative ? '↓' : '↑';
    const changeAbs = Math.abs(ex.change).toFixed(2);
    const pctAbs = Math.abs(ex.changePercent).toFixed(2);
    const volumeFormatted = ex.volume ? ex.volume.toLocaleString('en-IN') : '—';

    html += `
      <div class="exchange-row">
        <div class="exchange">${ex.exchange}</div>
        <div class="exchange_price">
          <div class="price"><span class="arrow ${isNegative ? 'negative' : 'positive'}">${arrow}</span> ₹${ex.lastTradedPrice.toFixed(2)}</div>
          <div class="change ${isNegative ? 'negative' : 'positive'}">
            ${changeAbs} (${pctAbs}%)
          </div>
        </div>
      </div>
    `;
  });

  // Volume from NSE or first available
  const mainVolume = companyData.exchanges[0]?.volume?.toLocaleString('en-IN') || '—';
  html += `
    </div>
    <div class="volume">Volume ${mainVolume}</div>
  `;

  return html;
}

// ────────────────────────────────────────────────
// Main decorate function - Your code with API integration
// ────────────────────────────────────────────────
export default async function decorate(block) {
  const children = [...block.children];

  /* ===============================
     HEADER
  =============================== */

  const header = document.createElement('header');
  header.className = 'd-md-flex align-items-center gap-3';

  const entryContainer = document.createElement('div');
  entryContainer.className = 'entry-container fullCont mb-5';

  // Title + description (wrap first child in <h2>)
  if (children[0]) {
    const h2 = document.createElement('h2');
    while (children[0].childNodes.length > 0) {
      h2.appendChild(children[0].childNodes[0]);
    }
    entryContainer.appendChild(h2);
  }

  // Append second child (description) as-is
  if (children[1]) entryContainer.appendChild(children[1]);

  header.appendChild(entryContainer);

  // CTA button (children[2] = label, children[3] = href)
  if (children[2] && children[3]) {
    const btnLabel = children[2].textContent.trim();
    const btnHref = children[3].textContent.trim() || '#';

    const btnAnchor = document.createElement('a');
    btnAnchor.href = btnHref;
    btnAnchor.title = btnLabel;
    btnAnchor.className = 'btn btn-orange';
    btnAnchor.textContent = btnLabel;

    header.appendChild(btnAnchor);
  }

  /* ===============================
     COMPANIES - Modified to include API data
  =============================== */

  const companiesCol = document.createElement('div');
  companiesCol.className = 'companiesCol';

  const row = document.createElement('div');
  row.className = 'row';

  // Map to store stock divs by symbol for later population
  const stockDivsMap = new Map();

  for (let i = 4; i < children.length; i++) {
    const companyItem = children[i];

    if (!companyItem || companyItem.children.length < 3) continue;

    companyItem.classList.add('listed-company-item');

    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';

    const companiesGrid = document.createElement('div');
    companiesGrid.className = 'companiesGrid';

    // Wrap the first child in <h3> (companyName)
    const firstChild = companyItem.children[0];
    let companySymbol = null;

    if (firstChild) {
      const h3 = document.createElement('h3');
      const p = firstChild.querySelector('p');
      h3.textContent = p ? p.textContent.trim() : firstChild.textContent.trim();

      // Extract symbol from stockSymbol field (child index 2)
      const stockSymbolEl = companyItem.children[2];
      if (stockSymbolEl) {
        companySymbol = stockSymbolEl.textContent.trim();
      }

      companyItem.replaceChild(h3, firstChild);

      /* ===============================
         HIDE ALL BUT h3 + NEXT DIV
         (DO NOT REMOVE — AEM SAFE)
      =============================== */
      [...companyItem.children].forEach((child, index) => {
        if (index > 1) {
          child.style.display = 'none';
        }
      });
    }


    // Create stock div placeholder - will be populated with API data
    const companiesStock = document.createElement('div');
    companiesStock.className = 'companiesStock';
    companiesStock.innerHTML = '<div class="loading">Loading market data...</div>';

    // Store reference for later if we have a symbol
    if (companySymbol) {
      stockDivsMap.set(companySymbol, companiesStock);
    }

    // Process buttons - CORRECTED INDICES BASED ON JSON
    // child 3 = visitWebsiteText, child 4 = visitWebsiteUrl
    // child 5 = exploreHighlightsText, child 6 = exploreHighlightsUrl
    const btnContainer = document.createElement('div');
    btnContainer.className = 'companies-links mt-5 mb-4';

    // First button pair: Visit Website
    if (companyItem.children[3] && companyItem.children[4]) {
      const btnLabel = companyItem.children[3].textContent.trim() || 'Visit Website';
      const btnHref = companyItem.children[4].textContent.trim() || '#';

      const btnAnchor = document.createElement('a');
      btnAnchor.href = btnHref;
      btnAnchor.title = btnLabel;
      btnAnchor.className = 'btn btn-circle';
      btnAnchor.textContent = btnLabel;
      btnContainer.appendChild(btnAnchor);
    }

    // Second button pair: Explore Highlights
    if (companyItem.children[5] && companyItem.children[6]) {
      const btnLabel = companyItem.children[5].textContent.trim() || 'Explore Highlights';
      const btnHref = companyItem.children[6].textContent.trim() || '#';

      const btnAnchor = document.createElement('a');
      btnAnchor.href = btnHref;
      btnAnchor.title = btnLabel;
      btnAnchor.className = 'btn btn-circle';
      btnAnchor.textContent = btnLabel;
      btnContainer.appendChild(btnAnchor);
    }

    // Append companyItem into companiesGrid
    companiesGrid.appendChild(companyItem);
    // Append button container after content
    companiesGrid.appendChild(btnContainer);

    col.appendChild(companiesGrid);

    // Append companiesStock outside of companiesGrid
    if (companiesStock) col.appendChild(companiesStock);

    row.appendChild(col);
  }

  companiesCol.appendChild(row);

  /* ===============================
     FINAL - Replace children
  =============================== */

  block.replaceChildren(header, companiesCol);

  /* ===============================
     API CALL - Fetch and populate stock data
  =============================== */

  // Only fetch if we have symbols to look up
  if (stockDivsMap.size > 0) {
    try {
      const rawData = await fetchStockPrices();
      const dataByName = {};

      // Create lookup map by company name
      rawData.forEach(item => {
        // Store by company name for lookup
        dataByName[item.companyName] = item;

        // Also store by uppercase name without spaces for easier matching
        const cleanName = item.companyName.toUpperCase().replace(/\s+/g, '');
        dataByName[cleanName] = item;
      });

      // Map symbols to company names
      const symbolToCompanyMap = {
        'GAL': 'GMR INFRA',    // Symbol GAL maps to "GMR INFRA" in API
        'GPUIL': 'GPUIL'        // Symbol GPUIL maps to "GPUIL" in API
      };

      // Update each stock div with real data
      for (const [symbol, stockDiv] of stockDivsMap.entries()) {
        let companyData = null;

        // Try exact mapping first
        const mappedName = symbolToCompanyMap[symbol];
        if (mappedName) {
          companyData = dataByName[mappedName] || dataByName[mappedName.toUpperCase().replace(/\s+/g, '')];
        }

        // If not found, try direct match
        if (!companyData) {
          companyData = dataByName[symbol] || dataByName[symbol.toUpperCase()];
        }

        if (companyData) {
          stockDiv.innerHTML = renderStockOverview(companyData, symbol);
        } else {
          stockDiv.innerHTML = `<div class="error">No data found for ${symbol}</div>`;
        }
      }
    } catch (err) {
      console.error('[Stock API] Failed to load data:', err);

      // Show error in all stock divs
      for (const [symbol, stockDiv] of stockDivsMap.entries()) {
        stockDiv.innerHTML = `
          <div class="error">
            Market data unavailable<br>
            <small style="opacity:0.7;">${err.message}</small>
          </div>
        `;
      }
    }
  }
}