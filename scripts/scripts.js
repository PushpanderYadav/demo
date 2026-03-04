import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from "./aem.js";
import { buildVisitHistory, getCachedVisitedPages } from "./target.js";

// --- EARLY LANGUAGE REDIRECT & BHASHINI JUMPSTART (Anti-Flash) ---
(function handleLanguageInitialization() {
  // 1. AGGRESSIVE HIDE: Prevent ANY flash of content
  // We use opacity 0 and pointer-events none to make it invisible but still allow layout
  const style = document.createElement("style");
  style.id = "anti-flash-style";
  style.innerHTML =
    "body { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; transition: none !important; }";
  document.head.appendChild(style);

  const savedLang = localStorage.getItem("selected-language");
  const path = window.location.pathname;
  const segments = path.split("/");

  // Find current language in URL
  // Support both 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
  let langIndex = -1;
  let detectedLang = "en"; // Default
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(segment)) {
      langIndex = i;
      detectedLang = segment;
      break;
    }
  }

  // 2. REDIRECT CHECK: If saved preference differs from URL
  // OR if English user is on a subpage path (redirect to /en/ for data loading, home "/" is exempt)
  const isRoot = path === "/" || path === "";
  // Redirection is needed for subpages OR if the root result in a 404 (isErrorPage)
  const isEnOnRootPath =
    detectedLang === "en" &&
    !segments.includes("en") &&
    (!isRoot || window.isErrorPage) &&
    !window.location.search.includes("adobe_ue");

  if (
    (savedLang &&
      savedLang !== detectedLang &&
      !window.location.search.includes("adobe_ue")) ||
    isEnOnRootPath
  ) {
    let newPath;
    if (isEnOnRootPath) {
      // Subpages MUST go to /en/ to avoid 404 if server mapping isn't recursive
      newPath = "/en" + path;
    } else if (langIndex !== -1) {
      segments[langIndex] = savedLang;
      newPath = segments.join("/");
    } else {
      newPath = "/" + savedLang + (isRoot ? "" : path);
    }

    const finalUrl =
      window.location.origin +
      newPath.replace(/\/+/g, "/") +
      window.location.search +
      window.location.hash;

    if (finalUrl !== window.location.href) {
      window.location.replace(finalUrl);
      return;
    }
  }

  // 4. BHASHINI JUMPSTART: If we are on a non-English path
  if (detectedLang !== "en" || (savedLang && savedLang !== "en")) {
    const activeLang = detectedLang !== "en" ? detectedLang : savedLang || "en";
    document.documentElement.lang = activeLang;

    if (!document.getElementById("bhashini-script")) {
      const script = document.createElement("script");
      script.id = "bhashini-script";
      script.src =
        "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  // Reveal function to be called when ready (usually by header.js)
  window.revealPage = () => {
    const af = document.getElementById("anti-flash-style");
    if (af) {
      af.remove();
      console.log("Anti-flash guard removed (revealPage called)");
    }
  };

  // Failsafe reveal: If everything else fails, show the page after 2 seconds
  setTimeout(() => {
    if (document.getElementById("anti-flash-style")) {
      console.warn(
        "Failsafe reveal triggered - revealPage was not called in time.",
      );
      window.revealPage();
    }
  }, 2000);
})();

const getMetadata = (name) => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.content : null;
};

function addPageSlugClass() {
  const path = window.location.pathname
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean);

  const slug = path.length ? path[path.length - 1] : "home";
  document.body.classList.add(`page-${slug.toLowerCase()}`);

  // ⭐ Language-only homepage check
  // Matches /en/, /jp/, /eu/, /fr/, /de/, etc.
  const langOnlyHome =
    path.length === 1 &&
    (/^[a-zA-Z]{2,3}$/.test(path[0]) || ["zh-sg", "zh-cn"].includes(path[0]));

  if (langOnlyHome) {
    document.body.classList.add("page-home");
  }
}

export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter(
        (attr) =>
          attr.startsWith("data-aue-") || attr.startsWith("data-richtext-"),
      ),
  );
}

export function localizeNavLinks(container, currentLang) {
  if (!container || !currentLang) return;
  const links = container.querySelectorAll("a");
  links.forEach((a) => {
    const href = a.getAttribute("href");
    // Link must be internal (start with /), not absolute (starting with //),
    // and not a DAM link (/content/dam/)
    if (
      href &&
      href.startsWith("/") &&
      !href.startsWith("//") &&
      !href.startsWith("/content/dam/")
    ) {
      const segments = href.split("/");
      let hasLang = false;
      let langIndex = -1;
      for (let i = 0; i < segments.length; i++) {
        // Match 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
        if (/^[a-z]{2}(-[a-z]{2})?$/.test(segments[i])) {
          hasLang = true;
          langIndex = i;
          break;
        }
      }

      if (hasLang) {
        // 1. If link has a language segment (like /en/)
        if (currentLang !== "en" && segments[langIndex] !== currentLang) {
          // In other languages, replace existing language segment with current
          segments[langIndex] = currentLang;
          a.setAttribute("href", segments.join("/").replace(/\/+/g, "/"));
        }
      } else if (currentLang !== "en") {
        // 2. If link has NO language segment and we are NOT in English mode, prepend language
        a.setAttribute("href", `/${currentLang}${href}`.replace(/\/+/g, "/"));
      }
    }
  });
}

async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes("localhost")) {
      sessionStorage.setItem("fonts-loaded", "true");
    }
  } catch (e) {
    // ignore
  }
}

async function buildBreadcrumbs(main) {
  // 1. Skip on Homepage or 404
  if (window.location.pathname === "/" || window.location.pathname === "/404") {
    return;
  }

  // 2. Prevent Duplicates
  if (main.querySelector(".breadcrumbs")) {
    return;
  }

  // 3. Create the Block Wrapper & Block
  const wrapper = document.createElement("div");
  wrapper.classList.add("breadcrumbs-wrapper");

  const block = document.createElement("div");
  block.classList.add("breadcrumbs", "block");
  block.dataset.blockName = "breadcrumbs";
  block.dataset.blockStatus = "loading";

  wrapper.append(block);

  // 4. INJECT INTO FIRST SECTION
  const firstSection = main.querySelector(".section");

  if (firstSection) {
    // Inject at the top of the existing first section
    firstSection.prepend(wrapper);
  } else {
    // Fallback: If page is empty, create a new section
    const section = document.createElement("div");
    section.classList.add("section", "breadcrumbs-container");
    section.append(wrapper);
    main.prepend(section);
  }

  // 5. MANUALLY LOAD THE BLOCK LOGIC
  try {
    const cssLoaded = loadCSS(
      `${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.css`,
    );
    const modLoaded = import(
      `${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.js`
    );

    const [_, mod] = await Promise.all([cssLoaded, modLoaded]);

    if (mod.default) {
      await mod.default(block);
    }
    block.dataset.blockStatus = "loaded";
  } catch (error) {
    console.error("Failed to load breadcrumbs:", error);
    block.dataset.blockStatus = "failed";
  }
}

function buildAutoBlocks(main) {
  try {
    // Breadcrumbs are NOT called here to avoid deadlock.
    // They are called in loadLazy below.
  } catch (error) {
    console.error("Auto Blocking failed", error);
  }
}

export function decorateMain(main) {
  const pathParts = window.location.pathname.split("/");
  let currentLang = "en";
  for (const part of pathParts) {
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(part)) {
      currentLang = part;
      break;
    }
  }

  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);

  // Initial localization for links authored in blocks
  localizeNavLinks(main, currentLang);

  // Dynamic localization for links added by blocks later (e.g. news lists, business section)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          localizeNavLinks(node, currentLang);
        }
      });
    });
  });
  observer.observe(main, { childList: true, subtree: true });
}

async function loadEager(doc) {
  // Dynamically set lang attribute based on URL path instead of hardcoding "en"
  // Support both 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
  const pathParts = window.location.pathname.split("/");
  let currentLang = "en";
  for (const part of pathParts) {
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(part)) {
      currentLang = part;
      break;
    }
  }
  document.documentElement.lang = currentLang;

  decorateTemplateAndTheme();

  const main = doc.querySelector("main");
  if (main) {
    decorateMain(main);
    addPageSlugClass();
    document.body.classList.add("appear");

    // Adobe Target wait
    if (getMetadata("target") === "true") {
      await new Promise((resolve) => {
        if (window.alloy) return resolve();
        const checkAlloy = () => {
          if (window.alloy) resolve();
          else setTimeout(checkAlloy, 50);
        };
        checkAlloy();
      });
    }

    await loadSection(main.querySelector(".section"), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem("fonts-loaded")) {
      loadFonts();
    }
  } catch (e) {
    // ignore
  }
}

async function loadLazy(doc) {
  const main = doc.querySelector("main");
  await loadSections(main);
  buildVisitHistory();

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector("header"));
  loadFooter(doc.querySelector("footer"));

  // Mega Menu
  document.addEventListener("click", function (e) {
    const allMegaItems = document.querySelectorAll(".has-mega");
    const trigger = e.target.closest(".has-mega > p > a");
    if (trigger) {
      e.preventDefault();
      const li = trigger.closest(".has-mega");
      const isActive = li.classList.contains("active");
      allMegaItems.forEach((item) => item.classList.remove("active"));
      if (!isActive) {
        li.classList.add("active");
      }
      return;
    }
    const clickedInsideMega = e.target.closest(".has-mega");
    if (!clickedInsideMega) {
      allMegaItems.forEach((item) => item.classList.remove("active"));
    }
  });
  // Mega Menu End

  /* ✅ Manual Load Call for Breadcrumbs */
  buildBreadcrumbs(main);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

function loadDelayed() {
  import("./delayed.js");
}

const onDecoratedElement = (fn) => {
  if (
    document.querySelector(
      '[data-block-status="loaded"],[data-section-status="loaded"]',
    )
  ) {
    fn();
    return;
  }

  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (m) =>
          m.target.tagName === "BODY" ||
          m.target.dataset?.sectionStatus === "loaded" ||
          m.target.dataset?.blockStatus === "loaded",
      )
    ) {
      fn();
      observer.disconnect();
    }
  });

  observer.observe(document.querySelector("main"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-block-status", "data-section-status"],
  });
  observer.observe(document.body, { childList: true });
};

const KEY = "returning-user";
if (!localStorage.getItem(KEY)) {
  localStorage.setItem(KEY, "true");
} else {
  window.isReturningUser = true;
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
