const ALGOLIA_APP_ID = 'YOUR_APP_ID';
const ALGOLIA_SEARCH_KEY = 'YOUR_SEARCH_API_KEY';
const ALGOLIA_INDEX = 'site_pages';

let index = null;

/* ===============================
   Initialize Algolia safely
function initAlgolia() {
  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
    index = client.initIndex(ALGOLIA_INDEX);
  } catch (e) {
    console.error('Algolia init failed', e);
  }
}

/* ===============================
   Render results (UNCHANGED UX)
function renderResults(results, container) {
  container.innerHTML = '';

  if (!results || !results.length) {
    container.innerHTML = '<p>No results found</p>';
    return;
  }

  results.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'search-result';

    el.innerHTML = `
      <a href="${item.path}">
        <h3>${item.title}</h3>
        ${item.description ? `<p>${item.description}</p>` : ''}
      </a>
    `;

    container.appendChild(el);
  });
}

/* ===============================
   EDS decorate (DO NOT async)
export default function decorate(block) {
  const input = block.querySelector('.search-input');
  const resultsContainer = block.querySelector('.search-results');

  if (!input || !resultsContainer) {
    console.warn('Search block markup missing');
    return;
  }

  // init Algolia AFTER DOM is confirmed
  initAlgolia();

  let timeout;

  input.addEventListener('input', (e) => {
    clearTimeout(timeout);

    const term = e.target.value.trim();

    if (term.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    timeout = setTimeout(async () => {
      if (!index) {
        console.warn('Algolia index not available');
        return;
      }

      try {
        const { hits } = await index.search(term, {
          hitsPerPage: 8
        });

        renderResults(hits, resultsContainer);
      } catch (err) {
        console.error('Algolia search failed', err);
      }
    }, 300);
// export default async function decorate(block) {
//   block.innerHTML = `
//     <div class="search-box" role="combobox" aria-expanded="false">
//       <input
//         type="text"
//         placeholder="Search..."
//         aria-autocomplete="list"
//         aria-controls="search-results"
//         aria-activedescendant=""
//       />
//       <div
//         class="search-results"
//         id="search-results"
//         role="listbox"
//       ></div>
//     </div>
//   `;

//   const input = block.querySelector('input');
//   const resultsEl = block.querySelector('.search-results');

//   let indexData = [];
//   let results = [];
//   let activeIndex = -1;
//   let debounceTimer;

//   // Load index once
//   async function loadIndex() {
//     try {
//       const resp = await fetch('/query-index.json');
//       const json = await resp.json();
//       indexData = json.data || [];
//     } catch (e) {
//       console.error('Search index load failed', e);
//     }
//   }

//   await loadIndex();

//   function clearResults() {
//     resultsEl.innerHTML = '';
//     results = [];
//     activeIndex = -1;
//     input.setAttribute('aria-activedescendant', '');
//     block.querySelector('.search-box')
//       .setAttribute('aria-expanded', 'false');
//   }

//   function updateActiveResult() {
//     results.forEach((el, i) => {
//       el.classList.toggle('active', i === activeIndex);
//     });

//     if (results[activeIndex]) {
//       input.setAttribute(
//         'aria-activedescendant',
//         results[activeIndex].id
//       );
//       results[activeIndex].scrollIntoView({ block: 'nearest' });
//     }
//   }

//   function renderResults(matches, query) {
//     resultsEl.innerHTML = '';

//     matches.slice(0, 10).forEach((item, i) => {
//       const a = document.createElement('a');
//       a.href = item.path;
//       a.id = `search-option-${i}`;
//       a.role = 'option';

//       const title = (item.title || '').replace(
//         new RegExp(`(${query})`, 'ig'),
//         '<mark>$1</mark>'
//       );

//       a.innerHTML = `
//         <div class="search-result">
//           <strong>${title}</strong>
//           <p>${item.description || ''}</p>
//         </div>
//       `;

//       resultsEl.appendChild(a);
//     });

//     results = Array.from(resultsEl.querySelectorAll('a'));
//     activeIndex = -1;

//     block.querySelector('.search-box')
//       .setAttribute('aria-expanded', 'true');
//   }

//   // ---------- Search Logic ----------
//   function runSearch() {
//     const q = input.value.trim().toLowerCase();
//     clearResults();

//     if (q.length < 2) return;

//     const matches = indexData.filter((item) =>
//       item.title?.toLowerCase().includes(q) ||
//       item.description?.toLowerCase().includes(q) ||
//       item.content?.toLowerCase().includes(q)
//     );

//     if (matches.length) {
//       renderResults(matches, q);
//     }
//   }

//   // ---------- Events ----------
//   input.addEventListener('input', () => {
//     clearTimeout(debounceTimer);
//     debounceTimer = setTimeout(runSearch, 250);
//   });

//   input.addEventListener('keydown', (e) => {
//     if (!results.length) return;

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault();
//         activeIndex =
//           activeIndex < results.length - 1 ? activeIndex + 1 : 0;
//         updateActiveResult();
//         break;

//       case 'ArrowUp':
//         e.preventDefault();
//         activeIndex =
//           activeIndex > 0 ? activeIndex - 1 : results.length - 1;
//         updateActiveResult();
//         break;

//       case 'Enter':
//         if (activeIndex >= 0) {
//           e.preventDefault();
//           results[activeIndex].click();
//         }
//         break;

//       case 'Escape':
//         clearResults();
//         input.blur();
//         break;
//     }
//   });

//   // Close when clicking outside
//   document.addEventListener('click', (e) => {
//     if (!block.contains(e.target)) {
//       clearResults();
//     }
//   });
// }

import algoliasearch from 'https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js';

/* ===============================
   Algolia config (FRONTEND SAFE)
const ALGOLIA_APP_ID = 'BARVAFD3OC';
const ALGOLIA_SEARCH_KEY = 'e3ba8576fac702f5c6826b7b24cf221c';
const ALGOLIA_INDEX = 'site_pages';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const algoliaIndex = client.initIndex(ALGOLIA_INDEX);

export default function decorate(block) {
  /* ---------- UI Markup ---------- */
  block.innerHTML = `
    <div class="search-box" role="combobox" aria-expanded="false">
      <input
        type="text"
        placeholder="Search..."
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-activedescendant=""
      />
      <div
        class="search-results"
        id="search-results"
        role="listbox"
      ></div>
    </div>
  `;

  const input = block.querySelector('input');
  const resultsEl = block.querySelector('.search-results');

  let results = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- Helpers ---------- */
  function clearResults() {
    resultsEl.innerHTML = '';
    results = [];
    activeIndex = -1;
    input.setAttribute('aria-activedescendant', '');
    block.querySelector('.search-box')
      .setAttribute('aria-expanded', 'false');
  }

  function updateActiveResult() {
    results.forEach((el, i) => {
      el.classList.toggle('active', i === activeIndex);
    });

    if (results[activeIndex]) {
      input.setAttribute(
        'aria-activedescendant',
        results[activeIndex].id
      );
      results[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function renderResults(hits, query) {
    resultsEl.innerHTML = '';

    hits.slice(0, 10).forEach((item, i) => {
      const a = document.createElement('a');
      a.href = item.path;
      a.id = `search-option-${i}`;
      a.role = 'option';

      const title = (item.title || '').replace(
        new RegExp(`(${query})`, 'ig'),
        '<mark>$1</mark>'
      );

      a.innerHTML = `
        <div class="search-result">
          <strong>${title}</strong>
          <p>${item.description || ''}</p>
        </div>
      `;

      resultsEl.appendChild(a);
    });

    results = Array.from(resultsEl.querySelectorAll('a'));
    activeIndex = -1;

    block.querySelector('.search-box')
      .setAttribute('aria-expanded', 'true');
  }

  /* ---------- Algolia Search ---------- */
  async function runSearch() {
    const q = input.value.trim();
    clearResults();

    if (q.length < 2) return;

    try {
      const { hits } = await algoliaIndex.search(q, {
        hitsPerPage: 10
      });

      if (hits.length) {
        renderResults(hits, q);
      }
    } catch (e) {
      console.error('Algolia search failed', e);
    }
  }

  /* ---------- Events ---------- */
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (!results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex =
          activeIndex < results.length - 1 ? activeIndex + 1 : 0;
        updateActiveResult();
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex =
          activeIndex > 0 ? activeIndex - 1 : results.length - 1;
        updateActiveResult();
        break;

      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault();
          results[activeIndex].click();
        }
        break;

      case 'Escape':
        clearResults();
        input.blur();
        break;
    }
  });

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      clearResults();
    }
  });
}
