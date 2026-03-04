import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX } = window.APP_CONFIG;

/* ---------- Algolia Client ---------- */
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, {
  hosts: [
    { url: `${ALGOLIA_APP_ID}-dsn.algolia.net`, accept: true },
    { url: `${ALGOLIA_APP_ID}-1.algolianet.com`, accept: true },
    { url: `${ALGOLIA_APP_ID}-2.algolianet.com`, accept: true },
  ],
});

const index = client.initIndex(ALGOLIA_INDEX);

/* ---------- Helpers ---------- */
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function getPage() {
  const params = new URLSearchParams(window.location.search);
  return Math.max(0, parseInt(params.get("page") || "0", 10));
}

function highlight(text, query) {
  if (!text) return "";
  return text.replace(new RegExp(`(${query})`, "ig"), "<mark>$1</mark>");
}
function getBreadcrumb(path) {
  if (!path) return "";

  const parts = path
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map(seg => seg.replace(/[-_]/g, " ").toUpperCase());
  return parts.join(" > "); 
}

/* ---------- No Results Template ---------- */
function renderNoResults(container, query) {
  container.innerHTML = `
    <section class="no-results-section">
      <div class="no-results">

        <p class="no-results-query">
          Search results for "<strong>${query}</strong>"
        </p>

        <div class="no-results-icon">
          <img src="../icons/search-no-result.svg" alt="No results" />
        </div>

        <h2 class="no-results-title">
          We couldn't find any exact matches.
        </h2>

        <p class="no-results-subtext">
          Try checking the spelling or explore the sections below.
        </p>

        <div class="no-results-divider"></div>

        <div class="no-results-links">
          <a href="/en/investors">INVESTOR RELATIONS</a>
          <a href="/en/sustainability">SUSTAINABILITY</a>
          <a href="/en/careers">CAREERS</a>
        </div>

        <div class="no-results-divider"></div>

        <div class="no-results-links">
          <a href="/en/airports-and-aero-services">AIRPORT &amp; AERO SERVICES</a>
          <a href="/en/energy">ENERGY</a>
          <a href="/en/transportation">TRANSPORTATION &amp; URBAN INFRA</a>
          <a href="/en/sports">SPORTS</a>
          <a href="/en/other-services">OTHER SERVICES</a>
        </div>

        <div class="no-results-divider"></div>

      </div>
    </section>
  `;
}

/* ---------- Render Pagination ---------- */
function renderPagination(container, currentPage, totalPages, query, lang) {
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const buildUrl = (page) =>
    `/${lang}/search?q=${encodeURIComponent(query)}&page=${page}`;

  // Show at most 5 page buttons around the current page
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  let prev = null;
  for (const i of range) {
    if (prev !== null && i - prev > 1) rangeWithDots.push("...");
    rangeWithDots.push(i);
    prev = i;
  }

  const prevDisabled = currentPage === 0;
  const nextDisabled = currentPage === totalPages - 1;

  container.innerHTML = `
    <nav class="search-pagination" aria-label="Search results pages">
      <a
        class="pagination-btn pagination-prev ${prevDisabled ? "disabled" : ""}"
        href="${prevDisabled ? "#" : buildUrl(currentPage - 1)}"
        aria-disabled="${prevDisabled}"
        aria-label="Previous page"
      >&lsaquo; Prev</a>

      ${rangeWithDots
        .map((p) =>
          p === "..."
            ? `<span class="pagination-dots">…</span>`
            : `<a
                class="pagination-btn ${p === currentPage ? "active" : ""}"
                href="${buildUrl(p)}"
                aria-current="${p === currentPage ? "page" : "false"}"
              >${p + 1}</a>`
        )
        .join("")}

      <a
        class="pagination-btn pagination-next ${nextDisabled ? "disabled" : ""}"
        href="${nextDisabled ? "#" : buildUrl(currentPage + 1)}"
        aria-disabled="${nextDisabled}"
        aria-label="Next page"
      >Next &rsaquo;</a>
    </nav>
  `;

  // Prevent navigation on disabled links
  container.querySelectorAll(".pagination-btn.disabled").forEach((el) => {
    el.addEventListener("click", (e) => e.preventDefault());
  });
}

/* ---------- Main Decorate ---------- */
export default async function decorate(block) {
  const query = getQuery();
  const currentPage = getPage();
  const HITS_PER_PAGE = 25;

  block.innerHTML = `
    <div class="search-results-header">
     ${query ? `<h2 class="mb-4" id="search-results-heading">Search results for "${query}"</h2>` : ""}
      <div class="search-results-search-box">
        <div class="search-box-inline" role="combobox" aria-expanded="false">
          <input
            type="text"
            class="form-control search-input-results"
            placeholder="Search..."
            value="${query}"
          />

          <div class="search-loader" hidden>
            <span class="spinner"></span>
            <span class="loader-text">Searching...</span>
          </div>

        </div>
      </div>
    </div>

    <section class="sec-search py-4">
      <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-10">
              <div class="search-results-list"></div>
              <div class="search-results-pagination"></div>
            </div>
        </div>
      </div>
    </section>
  `;

  const input = block.querySelector(".search-input-results");
  const loader = block.querySelector(".search-loader");
  const resultsList = block.querySelector(".search-results-list");
  const paginationContainer = block.querySelector(".search-results-pagination");
  const searchBox = block.querySelector(".search-box-inline");

  let dropdownResults = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- UI Helpers ---------- */
  function showLoader() {
    loader.hidden = false;
  }

  function hideLoader() {
    loader.hidden = true;
  }

  /* ---------- Dropdown Search ---------- */
  async function runDropdownSearch() {
    const q = input.value.trim();

    // Clear any existing dropdown (if you add one back later)
    if (q.length < 2) return;

    showLoader();

    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const region = parts[0] || "en";
      const { hits } = await index.search(q, {
        filters: `region:${region}`,
        hitsPerPage: 10,
        attributesToSnippet: ["content:35", "description:25"],
        snippetEllipsisText: "...",
      });

      // Dropdown rendering kept as-is (optional: re-add dropdown if needed)
      _ = hits;
    } catch (e) {
      console.error("Dropdown search failed", e);
    } finally {
      hideLoader();
    }
  }

  /* ---------- Input Events ---------- */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runDropdownSearch, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      const lang =
        window.location.pathname.split("/").filter(Boolean)[0] || "en";
      // Reset to page 0 on new search
      window.location.href = `/${lang}/search?q=${encodeURIComponent(q)}&page=0`;
    }

    if (e.key === "Escape") {
      input.blur();
    }
  });

  /* ---------- Load Main Search Results ---------- */
  if (!query) return;

  try {
    const lang = window.location.pathname.split("/").filter(Boolean)[0] || "en";

    const { hits, nbPages } = await index.search(query, {
      filters: `region:${lang}`,
      page: currentPage,
      hitsPerPage: HITS_PER_PAGE,
      attributesToSnippet: ["content:40"],
      snippetEllipsisText: "...",
    });

    if (!hits.length) {
      const heading = block.querySelector("#search-results-heading");
      if (heading) heading.hidden = true;
      renderNoResults(resultsList, query);
      return;
    }

    resultsList.innerHTML = "";

    hits.forEach((item) => {
      const el = document.createElement("div");
      el.className = "search-result-item";

      const snippet =
        item._snippetResult?.content?.value || item.description || "";

      const isPdf = item.url && item.url.toLowerCase().endsWith(".pdf");
      const safeHref = isPdf? item.url: (item.url || item.sourcePage || `/${lang}/`);
      const breadcrumb = getBreadcrumb(item.path || "");

      el.innerHTML = `
        <div class="search-result-content">
          <a style="border-bottom: none;" href="${safeHref}" ${isPdf ? 'target="_blank"' : ''}>
            <h3>${item.title || item.metaTitle || "Untitled"}</h3>
          </a>

          ${breadcrumb ? `<div><span class="search-result-breadcrumb">${breadcrumb}</span></div>` : ""}

          ${snippet ? `<p class="search-result-snippet">${snippet}</p>` : ""}

          ${
            isPdf
              ? `
              <div class="pdf-download">
                <a href="${item.url}" target="_blank" class="pdf-link">
                  <img src="/icons/pdf-icon.png" alt="PDF" class="pdf-icon"/>
                  Download PDF
                </a>
              </div>
              `
              : ""
          }
        </div>
      `;

      resultsList.appendChild(el);
    });

    // Render pagination below results
    renderPagination(paginationContainer, currentPage, nbPages, query, lang);

    // Scroll to top of results on page change
    if (currentPage > 0) {
      block.scrollIntoView({ behavior: "smooth" });
    }
  } catch (e) {
    console.error("Search page failed", e);
    renderNoResults(resultsList, query);
  }
}