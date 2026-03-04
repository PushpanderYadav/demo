import { getMetadata } from "../../scripts/aem.js";

/* =========================================================
   HELPER: String Formatting (URL to Title)
   ========================================================= */
function formatSegment(segment) {
    const ACRONYMS = ['GM', 'GMR', 'CSR', 'AI', 'GAL', 'IGI', 'CEO', 'CVS', 'ESG', 'MRO', 'FAQs', 'SGCSR', 'CARE', 'MW'];
    let text = segment.replace(/-/g, " ");

    // Check for exact acronyms or case-insensitive matches
    const words = text.split(' ');
    const formattedWords = words.map(word => {
        const upperWord = word.toUpperCase();
        const found = ACRONYMS.find(a => a.toUpperCase() === upperWord);
        if (found) {
            return found;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formattedWords.join(' ');
}

/* =========================================================
   HELPER: Normalize URL (Fixes AEM .html/slash issues)
   ========================================================= */
function normalizePath(url) {
    try {
        const path = new URL(url, window.location.origin).pathname;
        return path.replace(/\.html$/, "").replace(/\/$/, "");
    } catch (e) {
        return url;
    }
}

/* =========================================================
   CORE: Wait for Nav Block to Load
   ========================================================= */
function waitForNav(timeout = 3000) {
    const start = Date.now();
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            const nav =
                document.querySelector(".nav-sections") ||
                document.querySelector("nav[aria-expanded]");
            if (nav) {
                clearInterval(timer);
                resolve(nav);
            }
            if (Date.now() - start > timeout) {
                clearInterval(timer);
                resolve(null);
            }
        }, 100);
    });
}

/* =========================================================
   STRATEGY 1: Build from Navigation Menu (Primary)
   ========================================================= */
/* =========================================================
   STRATEGY 1: Build from Navigation Menu (Primary)
   ========================================================= */
async function buildFromNav(nav, currentUrl) {
    const crumbs = [];
    const normalizedCurrent = normalizePath(currentUrl);

    if (!nav) return crumbs;

    const navLinks = Array.from(nav.querySelectorAll("a"));
    const activeLink = navLinks.find(
        (a) => normalizePath(a.href) === normalizedCurrent,
    );

    if (activeLink) {
        let li = activeLink.closest("li");
        while (li) {
            // Find the link that represents this menu item (could be direct or in a para)
            const link = li.querySelector(":scope > a, :scope > p > a");
            const text =
                link?.textContent?.trim() || li.firstChild?.textContent?.trim();

            if (text && text.length > 0) {
                crumbs.unshift({
                    title: text,
                    url: link ? link.href : null,
                });
            }
            li = li.closest("ul")?.closest("li");
        }
    }
    return crumbs;
}

/* =========================================================
   STRATEGY 2: Build from URL Structure (Backup)
   ========================================================= */
function buildFromUrl(currentUrl) {
    const crumbs = [];
    const urlObj = new URL(currentUrl);
    const path = urlObj.pathname.replace(/\/$/, "");
    const segments = path.replace(".html", "").split("/").filter(Boolean);

    // Hide language codes and system segments from breadcrumbs
    const HIDDEN_SEGMENTS = [
        "en",
        "hi",
        "ja",
        "id",
        "fr",
        "es",
        "el",
        "zh-cn",
        "zh-sg",
        "content",
        "gmr"
    ];
    let accumPath = "";

    segments.forEach((segment, index) => {
        accumPath += `/${segment}`;

        if (HIDDEN_SEGMENTS.includes(segment.toLowerCase())) {
            return;
        }

        const isLast = index === segments.length - 1;

        crumbs.push({
            title: formatSegment(segment),
            url: isLast ? null : `${urlObj.origin}${accumPath}`,
        });
    });

    return crumbs;
}

/* =========================================================
   MAIN DECORATE FUNCTION
   ========================================================= */
export default async function decorate(block) {
    /* -----------------------------------------
       1. HOME PAGE CHECK
       ----------------------------------------- */
    const path = window.location.pathname.replace(/\/$/, "");

    // Detect current language from path
    const langMatch = path.match(/^\/([a-z]{2}(-[a-z]{2})?)/);
    const currentLang = langMatch ? langMatch[1] : null;

    // Check if current page is homepage
    const isHome =
        path === "" || path === "/" || (currentLang && path === `/${currentLang}`);

    if (isHome) {
        block.innerHTML = "";
        return;
    }

    const navPromise = waitForNav();
    const currentUrl = window.location.href;
    const homeUrl = currentLang ? `${window.location.origin}/${currentLang}/` : `${window.location.origin}/`;

    /* -----------------------------------------
       2. BUILD CRUMBS
       ----------------------------------------- */
    const nav = await navPromise;
    let crumbs = await buildFromNav(nav, currentUrl);

    if (crumbs.length < 1) {
        crumbs = buildFromUrl(currentUrl);
    }

    // Add Home crumb if not already present
    if (crumbs.length === 0 || (crumbs[0].title.toLowerCase() !== "home" && crumbs[0].url !== homeUrl)) {
        crumbs.unshift({ title: "Home", url: homeUrl });
    }

    if (crumbs.length > 0) {
        // Special case: Last crumb represents current page
        // Try to get breadcrumb-title metadata override
        const metaTitle = getMetadata('breadcrumb-title') || getMetadata('og:title');
        if (metaTitle) {
            crumbs[crumbs.length - 1].title = metaTitle;
        }

        crumbs[crumbs.length - 1].url = null;
        crumbs[crumbs.length - 1]["aria-current"] = "page";
    }

    /* -----------------------------------------
       3. UE-SAFE RENDERING
       ----------------------------------------- */
    const navEl = document.createElement('nav');
    navEl.className = 'breadcrumbs container';
    navEl.setAttribute('aria-label', 'Breadcrumb');

    const ol = document.createElement('ol');
    ol.className = 'breadcrumb';

    crumbs.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        if (item["aria-current"]) li.setAttribute('aria-current', 'page');

        if (item.url) {
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            li.appendChild(a);
        } else {
            li.textContent = item.title;
        }
        ol.appendChild(li);
    });

    navEl.appendChild(ol);
    block.innerHTML = '';
    block.appendChild(navEl);
}
