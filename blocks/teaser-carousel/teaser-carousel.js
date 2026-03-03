import { teaserSearch } from "../../scripts/common/searchFunctionality.js";
const blockName = "teaser-Carousel";

function createElement(tag, { classes = "", attrs = {}, props = {} } = {}) {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  Object.entries(props).forEach(([k, v]) => (el[k] = v));
  return el;
}

// only load Swiper when needed
const loadSwiper = () =>
  new Promise((resolve) => {
    if (window.Swiper) {
      resolve(window.Swiper);
      return;
    }
    const link = createElement("link", {
      attrs: {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css",
      },
    });
    document.head.appendChild(link);
    const script = createElement("script", {
      attrs: {
        src: "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js",
      },
    });
    script.onload = () => resolve(window.Swiper);
    document.head.appendChild(script);
  });

async function loadBadWords(badWordApi) {
  const response = await fetch(badWordApi);
  const data = await response.json();
  return data.data[0].value.split(",").map((word) => word.trim().toLowerCase());
}

async function handleSearchStructure(block, inputField) {
    const datasetObj = block.parentElement.parentElement.dataset;
 const{serviceCardApi,rootIndexApi,badWordApi}=datasetObj;
  let badWords = [];
  const overlayContainer = block.querySelector(
    `.${blockName}__top-overlay-wrapper`
  );
  const searchListContainer = document.createElement("div");
  searchListContainer.className = `${blockName}__search-list-container`;

  const childContainer = document.createElement("div");
  childContainer.className = `${blockName}__child-list-container`;

  const overlayContainerInner = block.querySelectorAll(
    `.${blockName}__top-overlay-wrapper > div`
  );

  const api1 = serviceCardApi;
  const api2 = rootIndexApi;

  async function fetchAndFilter(apiUrl, query) {
    try {
      const response = await fetch(apiUrl);
      const json = await response.json();
      const data = json.data || [];
      return data.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error(`Error fetching from ${apiUrl}:`, error);
      return [];
    }
  }

  loadBadWords(badWordApi).then((list) => (badWords = list));

  inputField.addEventListener("input", async (e) => {
    childContainer.innerHTML = "";
    let query = e.target.value.toLowerCase();
    if (badWords.length > 0) {
      badWords.forEach((word) => {
        const regex = new RegExp("\\b" + word + "\\b", "gi");
        query = query.replace(regex, "");
      });
      query = query.replace(/\s{2,}/g, " ");
      if (query !== e.target.value) {
        e.target.value = query;
      }
    }

    if (query.length >= 3) {
      overlayContainerInner.forEach((elem) => {
        elem.classList.add("hide-default-list");
        elem.parentElement.classList.add("is-open-secondary");
      });

      // Clear previous results
      searchListContainer.innerHTML = "";

      // First try API 1
      let results = await fetchAndFilter(api1, query);

      // If no match in API 1, fallback to API 2
      if (results.length === 0) {
        results = await fetchAndFilter(api2, query);
      }

      // Render results
      if (results.length > 0) {
        results.forEach((item) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = `${blockName}__search-item`;
          const titleContainer = createElement("div", {
            classes: `${blockName}__title-container`,
          });
          const title = createElement("a", { classes: `${blockName}__title` });
          title.href = item.path;
          title.textContent = item.title;
          titleContainer.append(title);

          const redirectContainer = createElement("div", {
            classes: `${blockName}__redirect-container`,
          });

          const link = createElement("a", {
            classes: `${blockName}__redirect`,
          });
          link.href = item.path;
          link.textContent = item.redirectLabel;
          link.target = "_blank";
          if (item.redirectLabel && item.path) {
            redirectContainer.append(link);
          }
          itemDiv.append(titleContainer, redirectContainer);
          itemDiv.addEventListener("click", () => {
            window.location.href = item.path;
          });
          childContainer.append(itemDiv);
          searchListContainer.appendChild(childContainer);
        });
      } else {
        const noMatch = document.createElement("p");
        noMatch.classList.add("no-match");
        noMatch.textContent = "No matching services found.";
        searchListContainer.appendChild(noMatch);
      }
      if (!overlayContainer.contains(searchListContainer)) {
        overlayContainer.appendChild(searchListContainer);
      }
    } else {
      overlayContainerInner.forEach((elem) => {
        elem.classList.remove("hide-default-list");
        elem.parentElement.classList.remove("is-open-secondary");
      });
      searchListContainer.remove();
    }
  });

  inputField.addEventListener("blur", (e) => {
    setTimeout(() => {
      overlayContainerInner.forEach((elem) => {
        elem.classList.remove("hide-default-list");
        elem.parentElement.classList.remove("is-open-secondary");
      });
      if (overlayContainer.contains(searchListContainer)) {
        searchListContainer.remove();
      }
    }, 200);
  });
}

export default async function decorate(block) {
  const data = block.parentElement.parentElement.dataset;
  const {
    inputplaceholderlabel,
    inputplaceholderlabelhighlighted,
    suggestiontext,
    buttonlabel,
    imagesource,
    suggestionlinks,
  } = data;

  const slidingTimerSecond = Number(data.slidingTimerSecond) || 5;
  const sliderInterval = slidingTimerSecond * 1000;

  // 1) Collect raw slides from authoring
  const items = Array.from(block.querySelectorAll(":scope > div"));
  const slideData = items
    .map((raw) => {
      const cols = Array.from(raw.querySelectorAll(":scope > div"));
      if (cols.length < 4) return null;
      const [mob, tab, desk, contentEl] = cols;
      const mobileSrc = mob.querySelector("img")?.src || "";
      const tabSrc = tab.querySelector("img")?.src || mobileSrc;
      const deskSrc = desk.querySelector("img")?.src || tabSrc;
      cols.slice(0, 3).forEach((c) => c.remove());
      raw.remove();
      return { mobileSrc, tabSrc, deskSrc, contentEl };
    })
    .filter(Boolean);
  if (!slideData.length) return;

  // 2) Build Swiper container
  block.innerHTML = "";
  const swiperContainer = createElement("div", {
    classes: `swiper-container ${blockName}__container`,
  });
  const swiperWrapper = createElement("div", {
    classes: `swiper-wrapper ${blockName}__slides-container`,
  });

  // Slides
  slideData.forEach(({ mobileSrc, tabSrc, deskSrc, contentEl }) => {
    const slideEl = createElement("div", {
      classes: `swiper-slide ${blockName}__slide`,
    });

    const bg = createElement("div", { classes: `${blockName}__background` });
    const overlay = createElement("div", { classes: `${blockName}__overlay` });
    overlay.appendChild(contentEl);
    bg.appendChild(overlay);
    slideEl.appendChild(bg);
    swiperWrapper.appendChild(slideEl);

    // responsive background (no fixed width/height)
    const updateBg = () => {
      const w = window.innerWidth;
      const url = w < 768 ? mobileSrc : w < 1024 ? tabSrc : deskSrc;
      bg.style.backgroundImage = `url(${url})`;
    };
    updateBg();
    window.addEventListener("resize", updateBg, { passive: true });
  });

  // 3) Pagination
  const paginationEl = createElement("div", {
    classes: `swiper-pagination ${blockName}__pagination`,
  });

  // 4) Top wrapper: form + suggestions + overlay dropdown
  const topWrapper = createElement("div", {
    classes: `${blockName}__top-wrapper`,
  });

  // Form
  const formWrapper = createElement("div", {
    classes: `${blockName}__form-wrapper`,
  });

  const iconEl = createElement("img", {
    attrs: { src: imagesource || "", alt: "searchIcon" },
    classes: `${blockName}__icon`,
  });

  // Input + custom placeholder
  const inputWrapper = createElement("div", {
    classes: `${blockName}__input-wrapper`,
  });

  const inputField = createElement("input", {
    attrs: { type: "text" },
    classes: `${blockName}__input`,
  });

  const placeholderOverlay = createElement("div", {
    classes: `${blockName}__custom-placeholder`,
  });

  // Normal (non-highlighted) part
  const normalSpan = createElement("span", {
    props: { textContent: inputplaceholderlabel || "" },
    classes: `${blockName}__placeholder-normal`,
  });

  // Highlighted vertical ticker (top -> down)
  // Highlighted vertical ticker (NO DUPLICATE)
  const rawHighlighted = (inputplaceholderlabelhighlighted || "").trim();
  const words = rawHighlighted
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const highlightedSpan = createElement("span", {
    classes: `${blockName}__placeholder-highlighted`,
  });
  const clip = createElement("span", { classes: `${blockName}__ticker-clip` });
  const track = createElement("span", {
    classes: `${blockName}__ticker-track ${blockName}__ticker-track--down`,
    attrs: { "aria-hidden": "true" },
  });

  // populate items (no clone)
  words.forEach((w) => {
    track.appendChild(
      createElement("span", {
        classes: `${blockName}__ticker-item`,
        props: { textContent: w },
      })
    );
  });

  clip.appendChild(track);
  highlightedSpan.appendChild(clip);

  // Assemble placeholder
  placeholderOverlay.appendChild(normalSpan);
  if (inputplaceholderlabel && rawHighlighted) {
    placeholderOverlay.appendChild(document.createTextNode(" "));
  }
  placeholderOverlay.appendChild(highlightedSpan);

  inputWrapper.appendChild(inputField);
  inputWrapper.appendChild(placeholderOverlay);

  // Placeholder show/hide behavior
  const hidePlaceholder = () => {
    placeholderOverlay.style.display = "none";
  };
  const showPlaceholderIfEmpty = () => {
    placeholderOverlay.style.display = inputField.value ? "none" : "flex";
  };

  // Optionally pause ticker instead of hard-hiding
  const pauseTicker = () => {
    track.style.animationPlayState = "paused";
  };
  const playTicker = () => {
    track.style.animationPlayState = "running";
  };

  inputField.addEventListener("focus", () => {
    pauseTicker();
    hidePlaceholder();
  });
  // CTA button
  const buttonEl = createElement("button", {
    classes: `${blockName}__button`,
    props: { textContent: buttonlabel || "" },
  });

  formWrapper.append(iconEl, inputWrapper, buttonEl);

  // Suggestions
  const suggestionWrapper = createElement("div", {
    classes: `${blockName}__suggestions-wrapper`,
  });
  const suggestionSpan = createElement("div", {
    classes: `${blockName}__suggestion-links`,
  });
  const suggestionsArr = suggestiontext ? suggestiontext.split(",") : [];
  const linksArr = suggestionlinks ? suggestionlinks.split(",") : [];
  suggestionsArr.forEach((text, idx) => {
    const cleanText = text.trim();
    const url = linksArr[idx] && linksArr[idx].trim();
    if (cleanText) {
      const anchor = createElement("a", {
        attrs: { href: url || "#" },
        props: { textContent: cleanText },
        classes: `${blockName}__suggestion-link`,
      });
      suggestionSpan.appendChild(anchor);
    }
  });
  suggestionWrapper.appendChild(suggestionSpan);

  topWrapper.appendChild(formWrapper);
  topWrapper.appendChild(suggestionWrapper);

  // Dropdown overlay from teaserSearch
  const overlayWrapper = teaserSearch?.(data, blockName);
  if (overlayWrapper) {
    topWrapper.appendChild(overlayWrapper);

    const dropdown = overlayWrapper;
    const openClass = "is-open";
    const show = () => dropdown.classList.add(openClass);
    const hide = () => dropdown.classList.remove(openClass);
    const isInside = (e) =>
      dropdown.contains(e.target) || inputField.contains(e.target);

    inputField.addEventListener("focus", show);
    inputField.addEventListener("input", show);
    block.addEventListener("pointerdown", (e) => {
      if (!isInside(e)) hide();
    });
  }

  // Mount into DOM
  swiperContainer.appendChild(swiperWrapper);
  swiperContainer.appendChild(topWrapper);
  swiperContainer.appendChild(paginationEl);
  block.appendChild(swiperContainer);

  // Pagination bullet progress animation helper
  const updateActiveBullet = () => {
    paginationEl
      .querySelectorAll(".swiper-pagination-bullet")
      .forEach((el) => el.style.removeProperty("--animation-duration"));
    const active = paginationEl.querySelector(
      ".swiper-pagination-bullet-active"
    );
    if (active) {
      active.style.setProperty(
        "--animation-duration",
        `${slidingTimerSecond}s`
      );
    }
  };

  // 5) Load Swiper and initialize
  const SwiperClass = await loadSwiper();
  if (!SwiperClass) return;

  /* eslint-disable no-new */
  const swiper = new SwiperClass(swiperContainer, {
    loop: true,
    slidesPerView: 1,
    autoplay: {
      delay: sliderInterval,
      disableOnInteraction: false,
    },
    pagination: {
      el: paginationEl,
      type: "bullets",
      clickable: true,
      bulletClass: "swiper-pagination-bullet",
    },
    on: {
      init() {
        setTimeout(() => {
          swiper.autoplay.start();
          updateActiveBullet();
        }, 50);
      },
      slideChange() {
        updateActiveBullet();
      },
      autoplay() {
        updateActiveBullet();
      },
    },
  });
  inputField.addEventListener("input", (e) => {
    pauseTicker();
    hidePlaceholder();
  });
  inputField.addEventListener("blur", (e) => {
    e.target.value = "";
    if (!inputField.value) {
      playTicker();
      showPlaceholderIfEmpty();
    }
  });
  handleSearchStructure(block, inputField);

  swiper.on("slideChangeTransitionStart", updateActiveBullet);
}
