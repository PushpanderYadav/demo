import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

// Algolia config (FRONTEND SAFE)
const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX } = window.APP_CONFIG;

// ⚠️ Force stable hosts (fixes unreachable-host errors on corp networks)
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, {
  hosts: [
    { url: `${ALGOLIA_APP_ID}-dsn.algolia.net`, accept: true },
    { url: `${ALGOLIA_APP_ID}-1.algolianet.com`, accept: true },
    { url: `${ALGOLIA_APP_ID}-2.algolianet.com`, accept: true }
  ]
});

const algoliaIndex = client.initIndex(ALGOLIA_INDEX);

// function getBasePath() {
//   const parts = window.location.pathname
//     .split("/")
//     .filter(Boolean);

//   if (parts.length >= 2) {
//     return `/${parts[0]}/${parts[1]}`;
//   }

//   return `/${parts[0] || ""}`;
// }


export default function decorate(block) {
  /* ---------- UI Markup (UNCHANGED) ---------- */
block.innerHTML = `
  <button class="btn-search" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSearch">
    Search
  </button>
  <div class="collapse" id="collapseSearch">
    <div class="search-box" role="combobox" aria-expanded="false">
      <input
        type="text"
        class="form-control"
        placeholder="Search..."
      />
      <!-- 🔄 Loader -->
      <div class="search-loader" hidden>
        <span class="spinner"></span>
        <span class="loader-text">Searching...</span>
      </div>

      <div
        class="search-results"
        id="search-results"
        role="listbox"
      ></div>
    </div>
  </div>
`;

  const input = block.querySelector("input");
  const resultsEl = block.querySelector(".search-results");
  const loaderEl = block.querySelector(".search-loader");

  let results = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- Helpers ---------- */
  function clearResults() {
    resultsEl.innerHTML = "";
    results = [];
    activeIndex = -1;
    input.setAttribute("aria-activedescendant", "");
    // block.querySelector(".search-box").setAttribute("aria-expanded", "false");
  }
  function clearAll() {
    clearResults();
    input.value = "";  
    block.querySelector(".search-box").setAttribute("aria-expanded", "false");
  }
  function showLoader() {
    loaderEl.hidden = false;
  }

  function hideLoader() {
    loaderEl.hidden = true;
  }


  function updateActiveResult() {
    results.forEach((el, i) => {
      el.classList.toggle("active", i === activeIndex);
    });

    if (results[activeIndex]) {
      input.setAttribute("aria-activedescendant", results[activeIndex].id);
      results[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function highlight(text, query) {
    if (!text) return "";
    return text.replace(
      new RegExp(`(${query})`, "ig"),
      "<mark>$1</mark>"
    );
  }

  function renderResults(hits, query) {
    resultsEl.innerHTML = "";

    hits.slice(0, 10).forEach((item, i) => {
      const a = document.createElement("a");
      const parts = window.location.pathname.split("/").filter(Boolean);
      const lang = parts[0] || "en";

      a.href = item.path || `/${lang}/`;
      a.id = `search-option-${i}`;
      a.role = "option";

      // ✅ Enhanced field usage
      const title =
        item.title ||
        item.metaTitle ||
        "Untitled";

      const snippet =
        item._snippetResult?.content?.value ||
        item._snippetResult?.description?.value ||
        item.description ||
        "";


      const tags = Array.isArray(item.tags)
        ? item.tags.join(", ")
        : item.tags;

      a.innerHTML = `
        <div class="search-result">
          <strong>${highlight(title, query)}</strong>
          ${snippet ? `<p class="search-snippet">${snippet}</p>` : ""}
          ${tags ? `<small>${tags}</small>` : ""}
        </div>
      `;

      resultsEl.appendChild(a);
    });
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lang = parts[0] || "en";

    const viewAll = document.createElement("a");
    viewAll.href = `/${lang}/search?q=${encodeURIComponent(query)}`;
    viewAll.className = "search-view-all";
    viewAll.textContent = "View All Results →";
    resultsEl.appendChild(viewAll);

    results = Array.from(resultsEl.querySelectorAll("a"));
    activeIndex = -1;

    block.querySelector(".search-box").setAttribute("aria-expanded", "true");
  }

  /* ---------- Algolia Search ---------- */
  async function runSearch() {
    const q = input.value.trim();
    clearResults();

    if (q.length < 2) return;
    showLoader();

    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const lang = parts[0] || "en";
      const { hits } = await algoliaIndex.search(q, {
        filters: `lang:${lang}`,
        hitsPerPage: 10,
        attributesToRetrieve: [
          "title",
          "metaTitle",
          "description",
          "metaDescription",
          "content",
          "tags",
          "path"
        ],
        attributesToSnippet: [
          "content:35",
          "description:25"
        ],

        snippetEllipsisText: "..."
      });

      if (hits.length) {
        renderResults(hits, q);
      }
    } catch (e) {
      console.error("Algolia search failed", e);
    }
    finally {
      hideLoader(); 
    }
  }

  /* ---------- Events (UNCHANGED) ---------- */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 250);
  });

  input.addEventListener("keydown", (e) => {
    // if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = activeIndex < results.length - 1 ? activeIndex + 1 : 0;
        updateActiveResult();
        break;

      case "ArrowUp":
        e.preventDefault();
        activeIndex = activeIndex > 0 ? activeIndex - 1 : results.length - 1;
        updateActiveResult();
        break;

      case "Enter":
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        const parts = window.location.pathname.split("/").filter(Boolean);
        const lang = parts[0] || "en";
        window.location.href = `/${lang}/search?q=${encodeURIComponent(query)}`;
        break;

      case "Escape":
        clearAll();
        input.blur();
        break;
    }
  });

  document.addEventListener("mousedown", (e) => {
    const searchBox = block.querySelector(".search-box");
    const toggleBtn = block.querySelector(".btn-search");

    const clickedInsideSearch =
      searchBox.contains(e.target) || toggleBtn.contains(e.target);

    if (!clickedInsideSearch) {
      clearAll();
    }
  });
}
