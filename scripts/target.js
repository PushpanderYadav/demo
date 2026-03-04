const MAX_HISTORY = 5;
const STORAGE_KEY = "gmr_visited_pages";
const PROFILE_ATTR = "lastVisitedPages";

function getAlloy() {
  if (typeof window.alloy !== "function") {
    throw new Error("[Target] alloy.js not available.");
  }
  return window.alloy;
}

function readVisitedPages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeVisitedPages(pages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch { /* silently skip */ }
}

function getCurrentPageLabel() {
  if (window.location.search) {
    const title = document.title?.trim();
    if (title) return title;
  }
  const parts = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
  const meaningful = parts.filter((p) => !/^[a-z]{2}(-[a-z]{2})?$/.test(p));
  const last = meaningful[meaningful.length - 1] || "";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCurrentPageUrl() {
  return window.location.pathname + window.location.search;
}

/**
 * Records the current page into localStorage and returns the
 * pipe-delimited profile string ready to send to Target.
 *
 * scripts.js calls this and passes the value into its existing
 * alloy sendEvent — so only ONE event fires per page load.
 *
 * @returns {string}  e.g. "Home::/en|About::/en/about"
 */
export function buildVisitHistory() {
  const currentPage = {
    label: getCurrentPageLabel(),
    url: getCurrentPageUrl(), // includes ?query for article pages
  };

  // Don't save 404 pages
  const is404 = currentPage.label.toLowerCase().includes("page not found")
    || currentPage.label.toLowerCase().includes("not found")
    || currentPage.label.toLowerCase().includes("404");

  // Don't save the homepage
  const isHomepage = /^\/[a-z]{2}(\/)?$/.test(currentPage.url) || currentPage.url === "/";

  const history = readVisitedPages().filter((p) => p.url !== currentPage.url);

  if (!is404 && !isHomepage) {
    history.unshift(currentPage);
  }

  const trimmed = history.slice(0, MAX_HISTORY);
  writeVisitedPages(trimmed);

  return trimmed.map((p) => `${p.label}::${p.url}`).join("|");
}

/**
 * Returns the locally cached visited pages array.
 * @returns {{ label: string, url: string }[]}
 */
export function getCachedVisitedPages() {
  return readVisitedPages();
}

/**
 * Fetches a JSON offer from Adobe Target for the given decision scope.
 * Returns parsed JSON content, or null if no offer found.
 *
 * @param {string} scope - The mbox / decision scope name in Target
 * @returns {Promise<any|null>}
 */
export async function getTargetOffer(scope) {
  let alloy;
  try {
    alloy = getAlloy();
  } catch (err) {
    console.warn(err.message);
    return null;
  }

  let response;
  try {
    response = await alloy("sendEvent", {
      decisionScopes: [scope],
      xdm: {
        eventType: "decisioning.propositionFetch",
      },
    });
  } catch (err) {
    console.warn(`[Target] sendEvent for scope "${scope}" failed:`, err);
    return null;
  }

  const propositions = response?.propositions ?? [];
  for (const prop of propositions) {
    if (prop.scope !== scope) continue;
    for (const item of prop.items ?? []) {
      const content = item?.data?.content;
      if (!content) continue;
      try {
        return typeof content === "string" ? JSON.parse(content) : content;
      } catch {
        console.warn("[Target] Could not parse offer content:", content);
      }
    }
  }

  return null;
}