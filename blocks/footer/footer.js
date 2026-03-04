import { getMetadata } from "../../scripts/aem.js";
import { localizeNavLinks } from "../../scripts/scripts.js";
import { loadFragment } from "../fragment/fragment.js";

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Detect current language from URL path
  const pathSegments = window.location.pathname.split("/");
  let currentLang = "en"; // Default
  for (const segment of pathSegments) {
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(segment)) {
      currentLang = segment;
      break;
    }
  }

  const footerMeta = getMetadata("footer");
  const footerPathMain = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : `/${currentLang}/footer`;

  const isAero = window.location.pathname.startsWith("/aero-gmr/");
  const footerPath = isAero ? "/aero-gmr/footer" : footerPathMain;

  let fragment = await loadFragment(footerPath);

  // FALLBACK: If current language footer fails, try the absolute English one
  if (!fragment && currentLang !== "en") {
    fragment = await loadFragment("/en/footer");
  }

  if (fragment) {
    // ✅ Localize all links in the footer fragment
    localizeNavLinks(fragment, currentLang);
  }

  // decorate footer DOM
  block.textContent = "";
  if (fragment) {
    const footer = document.createElement("div");
    footer.className = "page-footer";
    while (fragment.firstElementChild)
      footer.append(fragment.firstElementChild);
    block.append(footer);
  }
}
