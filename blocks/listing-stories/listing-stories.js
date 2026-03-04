import { getSharedData } from '../../scripts/shared-filter.js';
import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from '../../scripts/common.js';
import { formatDate } from '../../scripts/common.js';
import { getLangFromURL } from '../../scripts/common.js';

export default async function decorate(block) {
  /* ================= Get Shared Filter Data ================= */
  const data = getSharedData('pressFilters') || {};

  const dynamicYears = data.years || [];
  const dynamicMonths = data.months || [];
  const dynamicTags = data.tags || [];
  const dynamicSubCats = data.subCategories || [];

  const defaultYear = "All";
  const limit = 10;
  
  /* ================= State Management ================= */
  let state = {
    year: "",
    month: "",
    subCategory: "",
    tag: "",
    sort: "desc",
    page: 1,
    offset: 0,
    limit: limit,
    totalCount: 0
  };

  /* ================= Render HTML ================= */
  block.innerHTML = `
  <section class="press-listing-runtime bg-gray">
    <div class="container">
      <!-- Desktop Layout -->
      <div class="press-layout desktop-layout">
        <aside class="press-filter-panel">
          <h4>Filter By</h4>
          
          <!-- Year -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle active" data-target="year-options">
              <span>Year - <span class="selected-year">${defaultYear}</span></span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options" id="year-options">
              <label class="filter-option active">
                <input type="radio" name="desktop-year" value="" checked>
                <span>All Years</span>
              </label>
              ${dynamicYears.map(y =>
                `<label class="filter-option">
                  <input type="radio" name="desktop-year" value="${y}">
                  <span>${y}</span>
                </label>`
              ).join("")}
            </div>
          </div>

          <!-- Category -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="subcat-options">
              <span>Business Category</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="subcat-options">
              <label class="filter-option active" data-category="all">
                <input type="radio" name="desktop-subcat" value="" checked>
                <span>All Categories</span>
              </label>
              ${dynamicSubCats.map(s =>
                `<label class="filter-option">
                  <input type="radio" name="desktop-subcat" value="${s}">
                  <span>${s}</span>
                </label>`
              ).join("")}
            </div>
          </div>

          <!-- Tags -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="tag-options">
              <span>Tags</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="tag-options">
              <label class="filter-option active">
                <input type="radio" name="desktop-tag" value="" checked>
                <span>All Tags</span>
              </label>
              ${dynamicTags.map(t =>
                `<label class="filter-option">
                  <input type="radio" name="desktop-tag" value="${t}">
                  <span>${t}</span>
                </label>`
              ).join("")}
            </div>
          </div>
        </aside>
        
        <div class="press-main">
          <div class="press-header">
            <div class="press-header-info">
              <h2 class="press-title">All Releases - <span class="selected-summary">All Years</span></h2>
              <p class="press-count">Displaying <span class="count-text">Loading...</span></p>
            </div>
            
            <div class="press-sort">
              <div class="sort-dropdown">
                <button class="sort-toggle" id="sort-toggle">
                  <span>Sort by</span>
                  <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="sort-options" id="sort-options">
                  <label class="sort-option">
                    <span>Newest First</span>
                    <input type="radio" name="sort" value="desc" checked>
                  </label>
                  <label class="sort-option">
                    <span>Oldest First</span>
                    <input type="radio" name="sort" value="asc">
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="press-list"></div>
          <div class="press-pagination"></div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="press-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn year-btn" data-type="year">
            Year <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
          <button class="mobile-filter-btn category-btn" data-type="category">
            Category <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
          <button class="mobile-filter-btn tag-btn" data-type="tag">
            Tags <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
        </div>
        
        <div class="press-list"></div>
        <div class="press-pagination"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Filter by Category</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
              <div class="filter-group year-group" style="display: none;">
                <label><input type="radio" name="mobile-year" value="" checked> All Years</label>
                ${dynamicYears.map(y =>
                  `<label><input type="radio" name="mobile-year" value="${y}"> ${y}</label>`
                ).join("")}
              </div>
              
              <div class="filter-group category-group" style="display: none;">
                <label><input type="radio" name="mobile-subcat" value="" checked> All Categories</label>
                ${dynamicSubCats.map(s =>
                  `<label><input type="radio" name="mobile-subcat" value="${s}"> ${s}</label>`
                ).join("")}
              </div>
              
              <div class="filter-group tag-group" style="display: none;">
                <label><input type="radio" name="mobile-tag" value="" checked> All Tags</label>
                ${dynamicTags.map(t =>
                  `<label><input type="radio" name="mobile-tag" value="${t}"> ${t}</label>`
                ).join("")}
              </div>
            </div>
            <div class="apply-filter-btn">
              <button class="apply-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

  /* ================= DOM References ================= */
  const summaryText = block.querySelector(".selected-summary");
  const selectedYearText = block.querySelector('.selected-year');
  const countText = block.querySelector('.count-text');
  const desktopList = block.querySelector(".desktop-layout .press-list");
  const mobileList = block.querySelector(".mobile-layout .press-list");
  const desktopPagination = block.querySelector(".desktop-layout .press-pagination");
  const mobilePagination = block.querySelector(".mobile-layout .press-pagination");
  const sortToggle = block.querySelector("#sort-toggle");
  const sortOptions = block.querySelector("#sort-options");
  
  // Mobile elements
  const mobileFilterBtns = block.querySelectorAll('.mobile-filter-btn');
  const mobileModal = block.querySelector('.mobile-filter-modal');
  const modalOverlay = block.querySelector('.mobile-filter-overlay');
  const closeModalBtn = block.querySelector('.close-modal');
  const applyBtn = block.querySelector('.apply-btn');
  const yearGroup = block.querySelector('.year-group');
  const monthGroup = block.querySelector('.month-group');
  const categoryGroup = block.querySelector('.category-group');
  const tagGroup = block.querySelector('.tag-group');

  /* ================= Helper Functions ================= */

  function updateHeader() {
    const parts = [];
    if (state.year) parts.push(state.year);
    if (state.month) {
      // Convert month number to month name
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[parseInt(state.month) - 1] || state.month;
      parts.push(monthName);
    }
    if (state.subCategory) parts.push(slugToTitle(state.subCategory));
    if (state.tag) parts.push(state.tag);
    summaryText.textContent = parts.length ? parts.join(" • ") : "All Years";
  }

  function updateCountDisplay() {
    if (state.totalCount === 0) {
      countText.textContent = `0 results`;
      return;
    }
    const start = (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalCount);
    countText.textContent = `${start} - ${end} of ${state.totalCount}`;
  }

  function createCardHTML(item) {

    const title = item?.title || "Untitled";
    const description = item?.description?.plaintext || "";
    const subCategory = item?.subCategory || "";
    const updatedDate = item?.lastUpdated || "";
    const link = item?.slugUrl || "#";
    const publishDateRaw = item.publishDate;  
    const publishDateFormatted = formatDate(publishDateRaw);
    // Create badge class from subCategory
    const badgeClass = subCategory ? subCategory.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') : '';

    return `
      <article class="press-card">
        <div class="press-card-image">
        <a href="story-update?post=${link}">  
        <img
            src="${item.storyImage?._publishUrl || ""}"
            alt="${item.title || ""}"
            loading="lazy"
          />
          </a>
        </div>

        <div class="press-card-body">
          <h3 class="press-card-title"><a href="story-update?post=${link}">${title}</a></h3>
          <p class= "press-card-description"><a href="story-update?post=${link}">${description}</a></p>
          <div class="press-card-meta">
            ${subCategory ? `<span class="badge ${badgeClass}">${slugToTitle(subCategory)}</span>` : ""}
            ${subCategory && publishDateFormatted ? '<span class="meta-separator">|</span>' : ''}
            ${publishDateFormatted ? `<span class="meta-date">
              <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              ${publishDateFormatted}
            </span>` : ""}
          </div>
          <div class="press-card-footer">
            <a href="story-update?post=${link}" class="btn-link">
              READ MORE
            </a>
            ${updatedDate ? `<span class="meta-updated">Last Updated : ${updatedDate}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  /* ================= Render Functions ================= */
  
  async function renderCards() {
    try {
      desktopList.innerHTML = '<div class="loading">Loading...</div>';
      mobileList.innerHTML = '<div class="loading">Loading...</div>';
      countText.textContent = 'Loading...';

      state.totalCount = await fetchApiCount(
        state.category,
        state.subCategory,
        state.year,
        state.tag
      );

      state.offset = (state.page - 1) * state.limit;

      const items = await fetchApiData(
        state.limit,
        state.offset,
        state.subCategory,
        state.year,
        state.month,
        state.tag,
        state.sort
      );

      if (items.length === 0) {
        desktopList.innerHTML = '<div class="no-results">No results found</div>';
        mobileList.innerHTML = '<div class="no-results">No results found</div>';
      } else {
        const cardsHTML = items.map(createCardHTML).join("");
        desktopList.innerHTML = cardsHTML;
        mobileList.innerHTML = cardsHTML;
      }

      updateCountDisplay();
      renderPagination();
      updateMobileFilterButtons();

    } catch (error) {
      console.error("Error fetching API data:", error);
      desktopList.innerHTML = '<div class="error">Error loading data. Please try again.</div>';
      mobileList.innerHTML = '<div class="error">Error loading data. Please try again.</div>';
      countText.textContent = 'Error';
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(state.totalCount / state.limit);

    if (totalPages <= 1) {
      desktopPagination.innerHTML = "";
      mobilePagination.innerHTML = "";
      return;
    }

    let html = "";

    // Previous button
    html += `
      <button class="page-btn prev ${state.page === 1 ? "disabled" : ""}" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.6667 16H5.33335M5.33335 16L13.3334 8M5.33335 16L13.3334 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    // Page numbers with smart ellipsis
    const maxVisible = 5;
    let startPage = Math.max(1, state.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      html += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        html += `<span class="page-ellipsis">...</span>`;
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="page-ellipsis">...</span>`;
      }
      html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    html += `
      <button class="page-btn next ${state.page === totalPages ? "disabled" : ""}" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.33334 16H26.6667M26.6667 16L18.6667 8M26.6667 16L18.6667 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    desktopPagination.innerHTML = html;
    mobilePagination.innerHTML = html;
  }

  /* ================= Mobile Modal Functions ================= */
  
  function updateMobileFilterButtons() {
    mobileFilterBtns.forEach(btn => {
      const type = btn.dataset.type;
      let text = btn.textContent.split('<')[0].trim();
      
      switch(type) {
        case 'year-month':
          const yearText = state.year || 'Year';
          const monthText = state.month || 'Month';
          text = `${yearText} & ${monthText}`;
          break;
        case 'category':
          text = state.subCategory ? slugToTitle(state.subCategory) : 'Category';
          break;
        case 'tag':
          text = state.tag || 'Tags';
          break;
      }
      
      btn.innerHTML = `${text} <span class="arrow">
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
        </svg>
      </span>`;
    });
  }

  function openMobileModal(type) {
    mobileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Hide all groups first
    yearGroup.style.display = 'none';
    monthGroup.style.display = 'none';
    categoryGroup.style.display = 'none';
    tagGroup.style.display = 'none';
    
    // Show selected group based on button type
    switch(type) {
      case 'year-month':
        yearGroup.style.display = 'block';
        monthGroup.style.display = 'block';
        break;
      case 'category':
        categoryGroup.style.display = 'block';
        break;
      case 'tag':
        tagGroup.style.display = 'block';
        break;
    }
    
    // Set current values for each group
    // Year group
    const yearRadio = yearGroup.querySelector(`input[name="mobile-year"][value="${state.year}"]`);
    if (yearRadio) yearRadio.checked = true;
    else yearGroup.querySelector('input[name="mobile-year"][value=""]').checked = true;
    
    // Month group
    const monthRadio = monthGroup.querySelector(`input[name="mobile-month"][value="${state.month}"]`);
    if (monthRadio) monthRadio.checked = true;
    else monthGroup.querySelector('input[name="mobile-month"][value=""]').checked = true;
    
    // Category group
    const catRadio = categoryGroup.querySelector(`input[name="mobile-subcat"][value="${state.subCategory}"]`);
    if (catRadio) catRadio.checked = true;
    else categoryGroup.querySelector('input[name="mobile-subcat"][value=""]').checked = true;
    
    // Tag group
    const tagRadio = tagGroup.querySelector(`input[name="mobile-tag"][value="${state.tag}"]`);
    if (tagRadio) tagRadio.checked = true;
    else tagGroup.querySelector('input[name="mobile-tag"][value=""]').checked = true;
  }

  function closeMobileModal() {
    mobileModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function applyMobileFilters() {
    // Get values from all radio groups
    const selectedYear = yearGroup.querySelector('input[name="mobile-year"]:checked');
    const selectedMonth = monthGroup.querySelector('input[name="mobile-month"]:checked');
    const selectedCat = categoryGroup.querySelector('input[name="mobile-subcat"]:checked');
    const selectedTag = tagGroup.querySelector('input[name="mobile-tag"]:checked');
    
    // Update state if values changed
    if (selectedYear && selectedYear.value !== state.year) {
      state.year = selectedYear.value;
      state.page = 1;
    }
    
    if (selectedMonth && selectedMonth.value !== state.month) {
      state.month = selectedMonth.value;
      state.page = 1;
    }
    
    if (selectedCat && selectedCat.value !== state.subCategory) {
      state.subCategory = selectedCat.value;
      state.page = 1;
    }
    
    if (selectedTag && selectedTag.value !== state.tag) {
      state.tag = selectedTag.value;
      state.page = 1;
    }
    
    closeMobileModal();
    updateHeader();
    updateMobileFilterButtons();
    renderCards();
  }

  /* ================= Event Listeners ================= */

  // Desktop Filter Toggles
  block.querySelectorAll('.filter-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = toggle.getAttribute('data-target');
      const options = block.querySelector(`#${targetId}`);
      toggle.classList.toggle('active');
      options.classList.toggle('hidden');
    });
  });

  // Desktop Radio Filters
  const setupRadioFilters = (name, property) => {
    block.querySelectorAll(`input[name="${name}"]`).forEach(r => {
      r.addEventListener("change", () => {
        state[property] = r.value;
        state.page = 1;
        
        // Update active state
        const container = r.closest('.filter-options');
        if (container) {
          container.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
          r.closest('.filter-option').classList.add('active');
        }
        
        if (property === 'year') {
          selectedYearText.textContent = r.value || "All";
        }
        
        updateHeader();
        renderCards();
      });
    });
  };

  setupRadioFilters('desktop-year', 'year');
  setupRadioFilters('desktop-month', 'month');
  setupRadioFilters('desktop-subcat', 'subCategory');
  setupRadioFilters('desktop-tag', 'tag');

  // Sort Toggle
  sortToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sortOptions.classList.toggle("show");
    sortToggle.classList.toggle('active');
  });

  // Sort Options
  block.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener("change", () => {
      state.sort = radio.value;
      state.page = 1;
      renderCards();
      sortOptions.classList.remove("show");
      sortToggle.classList.remove('active');
    });
  });

  // Close sort menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!sortToggle.contains(e.target) && !sortOptions.contains(e.target)) {
      sortOptions.classList.remove("show");
      sortToggle.classList.remove('active');
    }
  });

  // Close filter options when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-group-collapsible')) {
      block.querySelectorAll('.filter-options').forEach(options => {
        if (!options.classList.contains('hidden')) {
          options.classList.add('hidden');
          const toggle = block.querySelector(`[data-target="${options.id}"]`);
          if (toggle) toggle.classList.remove('active');
        }
      });
    }
  });

  function scrollWithOffset(element, offset = 150) {
  if (!element) return;

  const top = element.offsetTop - offset;

  window.scrollTo({
    top: top > 0 ? top : 0,
    behavior: "smooth"
  });
}

  // Pagination clicks
  desktopPagination.addEventListener("click", async (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn || btn.classList.contains("disabled") || btn.disabled) return;

  state.page = parseInt(btn.dataset.page, 10);

  await renderCards();
  scrollWithOffset(desktopList, 300);
});

mobilePagination.addEventListener("click", async (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn || btn.classList.contains("disabled") || btn.disabled) return;

  state.page = parseInt(btn.dataset.page, 10);

  await renderCards();
  scrollWithOffset(mobileList, 300);
});


  // Mobile Filter Buttons
  mobileFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openMobileModal(btn.dataset.type);
    });
  });

  // Mobile Modal Events
  modalOverlay.addEventListener('click', closeMobileModal);
  closeModalBtn.addEventListener('click', closeMobileModal);
  applyBtn.addEventListener('click', applyMobileFilters);

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeMobileModal();
    }
  });

  /* ================= Initial Render ================= */
  renderCards();
}

/* ================= API Functions ================= */

async function fetchApiData(limit = 10, offset = 0, subCategory = "", publishyear = "", publishmonth = "", tag = "", orderby = "desc") {
  const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/success-stories` +
    `?lang=${getLangFromURL()}` +
    `&limit=${encodeURIComponent(limit)}` +
    `&offset=${encodeURIComponent(offset)}` +
    `&subcategory=${encodeURIComponent(subCategory)}` +
    `&publishyear=${encodeURIComponent(publishyear)}` +
    `&publishmonth=${encodeURIComponent(publishmonth.toLowerCase())}` +
    `&tag=${encodeURIComponent(tag.toLowerCase())}` +
    `&orderby=${encodeURIComponent(orderby)}`;
      
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  
  const json = await res.json();
  const items = json?.data?.data?.successStoryList?.items || [];
    
  return items;
}

async function fetchApiCount(category = "", subCategory = "", publishyear = "", tag = "") {
  const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/story-count` +
    `?lang=${getLangFromURL()}` +
    `&category=${encodeURIComponent(category)}` +
    `&subcategory=${encodeURIComponent(subCategory)}` +
    `&publishyear=${encodeURIComponent(publishyear)}` +
    `&tag=${encodeURIComponent(tag.toLowerCase())}`;
      
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  
  const json = await res.json();
  const items = json?.data?.data?.successStoryList?.items || [];
    
  return items.length;
}