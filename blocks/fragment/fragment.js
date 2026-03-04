/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (!path) return null;

  let normalizedPath = path;
  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      const host = url.hostname;
      const isInternal = host === window.location.hostname ||
        host.endsWith('.aem.page') ||
        host.endsWith('.aem.live') ||
        host.endsWith('.hlx.page') ||
        host.endsWith('.hlx.live');

      if (!isInternal) return null; // Skip external
      normalizedPath = url.pathname;
    } catch (e) {
      return null;
    }
  }

  if (normalizedPath.startsWith('/')) {
    const rawPath = normalizedPath.replace(/(\.plain)?\.html/, '');

    // 1. Standard normalization (Strip JCR)
    const noJcr = rawPath.replace(/^\/content\/gmr(-prod)?/, '');

    // 2. Identify language context
    const lang = document.documentElement.lang || 'en';
    const langPrefix = `/${lang}`;

    // 3. Build variations to try
    const variations = [
      noJcr,                      // Try as-is
      normalizedPath,             // Try original relative/normalized path
    ];

    // If it doesn't have the language prefix, try adding it
    if (!noJcr.startsWith(langPrefix + '/') && noJcr !== langPrefix) {
      variations.push(`${langPrefix}${noJcr}`);
    }

    // If it DOES have it, try stripping it (in case of total root mapping)
    if (noJcr.startsWith(langPrefix + '/')) {
      const stripped = noJcr.slice(langPrefix.length);
      if (stripped) variations.push(stripped);
    }

    // Remove duplicates and filter empty
    const uniqueVariations = [...new Set(variations)].filter(v => v && v !== '/');

    for (const v of uniqueVariations) {
      const fetchUrl = `${v.replace(/\/+/g, '/')}.plain.html`;
      console.info(`[Fragment] Fetching: ${fetchUrl}`);
      try {
        const resp = await fetch(fetchUrl);
        if (resp.ok) {
          const main = document.createElement('main');
          main.innerHTML = await resp.text();

          // reset base path for media to fragment base
          const resetAttributeBase = (tag, attr) => {
            main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
              elem[attr] = new URL(elem.getAttribute(attr), new URL(v, window.location)).href;
            });
          };
          resetAttributeBase('img', 'src');
          resetAttributeBase('source', 'srcset');

          decorateMain(main);
          await loadSections(main);
          return main;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.classList.add(...fragmentSection.classList);
      block.classList.remove('section');
      block.replaceChildren(...fragmentSection.childNodes);
    }
  }
}
