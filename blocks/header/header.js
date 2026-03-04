import { getMetadata } from "../../scripts/aem.js";
import { localizeNavLinks } from "../../scripts/scripts.js";
import { loadFragment } from "../fragment/fragment.js";

const isDesktop = window.matchMedia("(min-width: 1199px)");

// --- Helper Functions ---
function closeOnEscape(e) {
  if (e.code !== "Escape") return;
  const nav = document.getElementById("nav");
  if (!nav) return;
  const navSections = nav.querySelector(".nav-sections");
  if (!navSections) return;
  const navSectionExpanded = navSections.querySelector(
    '[aria-expanded="true"]',
  );
  if (navSectionExpanded && isDesktop.matches) {
    toggleAllNavSections(navSections);
    navSectionExpanded.focus();
  } else if (!isDesktop.matches) {
    toggleMenu(nav, navSections);
    const btn = nav.querySelector("button");
    if (btn) btn.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = document.getElementById("nav");
  if (!nav || !nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector(".nav-sections");
    toggleMenu(nav, navSections, false);
  }
}

let megaMenuTimer;
function debounceMegaMenu(fn, delay = 100) {
  clearTimeout(megaMenuTimer);
  megaMenuTimer = setTimeout(() => {
    try {
      fn();
    } catch (e) {
      console.error("MegaMenu Debounce Error:", e);
    }
  }, delay);
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (!focused) return;
  const isNavDrop = focused.classList.contains("nav-drop");
  if (!isNavDrop) return;
  if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    const navSections = focused.closest(".nav-sections");
    if (!navSections) return;
    const dropExpanded = focused.getAttribute("aria-expanded") === "true";
    toggleAllNavSections(navSections);
    focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
  }
}

function focusNavSection() {
  document.activeElement?.addEventListener("keydown", openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  const value = expanded ? "true" : "false";
  sections
    .querySelectorAll(":scope .default-content-wrapper > ul > li")
    .forEach((section) => section.setAttribute("aria-expanded", value));
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) return;
  const currentlyExpanded = nav.getAttribute("aria-expanded") === "true";
  const willBeExpanded =
    forceExpanded !== null ? !!forceExpanded : !currentlyExpanded;

  const hamburgerBtn = document.querySelector(".nav-hamburger button");

  document.body.style.overflowY =
    willBeExpanded && !isDesktop.matches ? "hidden" : "";
  nav.setAttribute("aria-expanded", willBeExpanded ? "true" : "false");
  toggleAllNavSections(navSections, willBeExpanded && !isDesktop.matches);

  if (hamburgerBtn) {
    hamburgerBtn.setAttribute(
      "aria-label",
      willBeExpanded ? "Close navigation" : "Open navigation",
    );
  }

  const navDrops = navSections.querySelectorAll(".nav-drop");
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute("tabindex")) {
        drop.setAttribute("tabindex", 0);
        drop.addEventListener("focus", focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute("tabindex");
      drop.removeEventListener("focus", focusNavSection);
    });
  }

  if (willBeExpanded || isDesktop.matches) {
    window.addEventListener("keydown", closeOnEscape);
    nav.addEventListener("focusout", closeOnFocusLost);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
    nav.removeEventListener("focusout", closeOnFocusLost);
  }

  // Reset mobile panels when closing menu
  if (!willBeExpanded && !isDesktop.matches) {
    const mobileNav = document.querySelector(".mobile-nav-container");
    if (mobileNav) {
      mobileNav.querySelectorAll(".mobile-nav-panel").forEach((panel) => {
        panel.classList.remove("active");
      });
      const mainPanel = mobileNav.querySelector(".mobile-nav-panel.main");
      if (mainPanel) mainPanel.classList.add("active");
    }
  }
}

// Mobile Drilling Navigation - Build from cloned menu structure
function buildMobileNav(originalMenu) {
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "mobile-nav-container";

  // Create main panel
  const mainPanel = document.createElement("div");
  mainPanel.className = "mobile-nav-panel main active";

  const mainList = document.createElement("ul");
  mainList.className = "mobile-nav-list";

  // Create a function to recursively traverse and build menu items
  function buildMenuItems(ulElement, targetList, level = 0) {
    const items = Array.from(ulElement.children).filter(
      (child) => child.tagName === "LI",
    );

    items.forEach((li) => {
      // Get the link - could be direct child or in a <p>
      const link = li.querySelector("a");
      if (!link) return;

      const text = link.textContent.trim();
      const href = link.href;

      // Check if this LI has any UL children
      const submenu = li.querySelector("ul");

      const mobileItem = document.createElement("li");
      mobileItem.className = "mobile-nav-item";

      const mobileLink = document.createElement("a");
      mobileLink.href = submenu ? "#" : href;
      mobileLink.className = "mobile-nav-link";
      mobileLink.innerHTML = `<span>${text}</span>`;

      if (submenu) {
        const arrow = document.createElement("span");
        arrow.className = "mobile-nav-arrow";
        arrow.innerHTML = "›";
        mobileLink.appendChild(arrow);

        mobileLink.addEventListener("click", (e) => {
          e.preventDefault();
          showSubmenuPanel(text, href, li, mobileContainer, level + 1);
        });
      } else {
        // Add direct link behavior
        mobileLink.addEventListener("click", (e) => {
          if (href && href !== "#") {
            window.location.href = href;
          }
        });
      }

      mobileItem.appendChild(mobileLink);
      targetList.appendChild(mobileItem);
    });
  }

  // Start building from the main menu
  buildMenuItems(originalMenu, mainList);

  mainPanel.appendChild(mainList);
  mobileContainer.appendChild(mainPanel);

  return mobileContainer;
}

function showSubmenuPanel(title, titleHref, menuItem, container, level) {
  // Check if panel already exists
  let panel = container.querySelector(
    `.mobile-nav-panel[data-title="${CSS.escape(title)}"]`,
  );

  if (panel) {
    panel.classList.add("active");
    return;
  }

  // Create new panel
  panel = document.createElement("div");
  panel.className = "mobile-nav-panel";
  panel.setAttribute("data-title", title);
  panel.setAttribute("data-level", level);

  // Header with back button AND clickable title
  const header = document.createElement("div");
  header.className = "mobile-nav-header";

  const backBtn = document.createElement("button");
  backBtn.className = "mobile-nav-back";
  backBtn.innerHTML = "‹";
  backBtn.setAttribute("aria-label", "Go back");
  backBtn.addEventListener("click", () => {
    panel.classList.remove("active");
  });

  const headerTitle = document.createElement("h3");

  // Make the title clickable if it has a valid href
  if (titleHref && titleHref !== "#" && titleHref !== window.location.href) {
    const titleLink = document.createElement("a");
    titleLink.href = titleHref;
    titleLink.textContent = title;
    titleLink.style.cssText =
      "color: inherit; text-decoration: none; display: block;";
    titleLink.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = titleHref;
    });
    headerTitle.appendChild(titleLink);
  } else {
    headerTitle.textContent = title;
  }

  header.appendChild(backBtn);
  header.appendChild(headerTitle);
  panel.appendChild(header);

  // Content list - FIRST ITEM: Link to the category page itself
  const list = document.createElement("ul");
  list.className = "mobile-nav-list";

  // Add the main category page link as first item (for all levels except too deep)
  if (
    titleHref &&
    titleHref !== "#" &&
    titleHref !== window.location.href &&
    level <= 3
  ) {
    const mainCategoryItem = document.createElement("li");
    mainCategoryItem.className = "mobile-nav-item main-category-link";

    const mainCategoryLink = document.createElement("a");
    mainCategoryLink.href = titleHref;
    mainCategoryLink.className = "mobile-nav-link";
    mainCategoryLink.innerHTML = `<span style="font-weight: bold; color: #0066cc;">Go to ${title} Page</span>`;

    mainCategoryItem.appendChild(mainCategoryLink);
    list.appendChild(mainCategoryItem);

    // Add separator
    const separator = document.createElement("li");
    separator.className = "mobile-nav-separator";
    separator.innerHTML =
      '<hr style="margin: 10px 20px; border: none; border-top: 1px solid #ddd;">';
    list.appendChild(separator);
  }

  // Find ALL direct UL children in the menuItem
  const submenus = menuItem.querySelectorAll(":scope > ul");

  // Process each direct UL
  submenus.forEach((submenu) => {
    // Get all direct LI children of this submenu
    const items = Array.from(submenu.children).filter(
      (child) => child.tagName === "LI",
    );

    items.forEach((li) => {
      const link = li.querySelector("a");
      if (!link) {
        // Check if this LI has other content
        const textContent = li.textContent.trim();
        if (textContent) {
          const mobileItem = document.createElement("li");
          mobileItem.className = "mobile-nav-item";

          const contentSpan = document.createElement("span");
          contentSpan.className = "mobile-nav-content";
          contentSpan.textContent = textContent;
          contentSpan.style.cssText =
            "display: block; padding: 1rem 1.25rem; color: #333;";

          mobileItem.appendChild(contentSpan);
          list.appendChild(mobileItem);
        }
        return;
      }

      const text = link.textContent.trim();
      const href = link.href;

      // Check if this LI has any UL children
      const hasNestedUl = li.querySelector(":scope > ul");

      const mobileItem = document.createElement("li");
      mobileItem.className = "mobile-nav-item";

      const mobileLink = document.createElement("a");
      mobileLink.href = hasNestedUl ? "#" : href;
      mobileLink.className = "mobile-nav-link";
      mobileLink.innerHTML = `<span>${text}</span>`;

      if (hasNestedUl) {
        const arrow = document.createElement("span");
        arrow.className = "mobile-nav-arrow";
        arrow.innerHTML = "›";
        mobileLink.appendChild(arrow);

        mobileLink.addEventListener("click", (e) => {
          e.preventDefault();
          // Pass the entire LI to preserve deeper nested structure
          showSubmenuPanel(text, href, li, container, level + 1);
        });
      } else {
        // Add direct link behavior
        mobileLink.addEventListener("click", (e) => {
          if (href && href !== "#") {
            window.location.href = href;
          }
        });
      }

      mobileItem.appendChild(mobileLink);
      list.appendChild(mobileItem);
    });
  });

  panel.appendChild(list);
  container.appendChild(panel);

  // Trigger animation
  setTimeout(() => panel.classList.add("active"), 10);
}

// --- Main Decorate Function ---

export default async function decorate(block) {
  try {
    console.log("Starting main navigation decoration...");

    const imageMap = new Map();
    // Detect current language from URL path
    // Support both 2-char codes (en, ja) and hyphenated codes (zh-cn, zh-sg)
    const pathSegments = window.location.pathname.split("/");
    let currentLang = "en"; // Default
    for (const segment of pathSegments) {
      if (/^[a-z]{2}(-[a-z]{2})?$/.test(segment)) {
        currentLang = segment;
        break;
      }
    }

    const navMeta = getMetadata("nav");
    const englishNavPath = "/en/nav"; // Absolute fallback
    const navPathMain = navMeta
      ? new URL(navMeta, window.location).pathname
      : `/${currentLang}/nav`;
    const isAero = window.location.pathname.startsWith("/aero-gmr/");
    const navPath = isAero ? "/aero-gmr/nav" : navPathMain;

    console.log("Loading navigation fragment from:", navPath);

    let fragment;
    try {
      fragment = await loadFragment(navPath);
      console.log("Navigation fragment loaded:", fragment ? "Yes" : "No");

      // FALLBACK: If current language fragment fails, try the absolute English one
      if (!fragment && currentLang !== "en") {
        console.log(
          "Language-specific nav failed, falling back to English nav:",
          englishNavPath,
        );
        fragment = await loadFragment(englishNavPath);
      }
    } catch (error) {
      console.log("Navigation fragment loading failed:", error);

      // Secondary fallback to English on error
      if (currentLang !== "en") {
        try {
          fragment = await loadFragment(englishNavPath);
        } catch (e) {
          fragment = null;
        }
      } else {
        fragment = null;
      }
    }

    // Clear the block first
    block.textContent = "";

    const navWrapper = document.createElement("div");
    navWrapper.className = "primary-header header-wrapper";

    const hamburger = document.createElement("div");
    hamburger.classList.add("nav-hamburger");
    hamburger.innerHTML = `<button type="button" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>`;

    const nav = document.createElement("nav");
    nav.id = "nav";
    nav.setAttribute("aria-expanded", "false");

    if (fragment) {
      // ✅ CRITICAL: Localize all links in the fragment BEFORE processing mega-menu or cloning for mobile
      localizeNavLinks(fragment, currentLang);

      while (fragment.firstElementChild) {
        nav.append(fragment.firstElementChild);
      }
    }

    // First, let's see what structure we have
    console.log("Nav children:", nav.children);
    console.log("Nav innerHTML:", nav.innerHTML);

    // Check if we have a proper UL structure or just text
    const hasProperStructure =
      nav.querySelector("ul") || nav.querySelector(".default-content-wrapper");

    if (!hasProperStructure) {
      // We need to create the structure from the text content
      console.log("Creating structure from text content");
      createNavStructureFromText(nav, currentLang);
    }

    const classes = ["brand", "sections", "tools"];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) {
        section.classList.add(`nav-${c}`);

        // Ensure each section has proper structure
        if (!section.querySelector(".default-content-wrapper")) {
          const wrapper = document.createElement("div");
          wrapper.className = "default-content-wrapper";
          while (section.firstChild) {
            wrapper.appendChild(section.firstChild);
          }
          section.appendChild(wrapper);
        }
      }
    });

    const navBrand = nav.querySelector(".nav-brand");
    let clonedMenu = null; // Declare clonedMenu variable here so it's accessible in media query listener

    if (navBrand) {
      const brandLink = navBrand.querySelector(".button");
      if (brandLink) {
        brandLink.className = "";
        const btnContainer = brandLink.closest(".button-container");
        if (btnContainer) btnContainer.className = "";
      }

      // FIXED: Create a logo link for each picture (not just the first one)
      const logoPictures = navBrand.querySelectorAll("picture");
      logoPictures.forEach((picture) => {
        const logoLink = document.createElement("a");
        // Use absolute URL to prevent duplicate language codes in path
        logoLink.href = currentLang === 'en' ? '/' : `/${currentLang}/`;
        logoLink.setAttribute("aria-label", "GMR Home");
        logoLink.className = "navbar-logo";

        if (picture.parentNode) {
          picture.parentNode.insertBefore(logoLink, picture);
          logoLink.appendChild(picture);
        }

        let current = logoLink.parentElement;
        while (current && current !== navBrand) {
          if (
            (current.tagName === "P" || current.tagName === "DIV") &&
            current.children.length <= 1 &&
            !current.textContent.trim()
          ) {
            const next = current.parentNode;
            next.insertBefore(logoLink, current);
            current.remove();
            current = next;
          } else {
            break;
          }
        }
      });

      // Clean up nav-brand content
      const brandWrapper = navBrand.querySelector(".default-content-wrapper");
      if (brandWrapper) {
        // Remove any stray paragraphs that are just URLs
        brandWrapper.querySelectorAll("p").forEach((p) => {
          const text = p.textContent.trim();
          if (
            text.startsWith("http") ||
            text.startsWith("/") ||
            text === "#" ||
            text.includes("gmrcorp") ||
            text.includes("CONTACT") ||
            text.includes("ENG") ||
            text.includes("ABOUT US") ||
            text.includes("BUSINESSES") ||
            text.includes("INVESTORS") ||
            text.includes("NEWS & INSIGHTS") ||
            text.includes("CAREERS") ||
            text.includes("SUSTAINABILITY") ||
            text.includes("FOUNDATION")
          ) {
            p.remove();
          }
        });

        // Ensure we have a proper UL structure
        let mainUl = brandWrapper.querySelector("ul");
        if (!mainUl) {
          // Create UL from the remaining content
          mainUl = document.createElement("ul");

          // Check if there are any remaining links or content
          const links = brandWrapper.querySelectorAll("a");
          if (links.length > 0) {
            links.forEach((link) => {
              const li = document.createElement("li");
              li.appendChild(link.cloneNode(true));
              mainUl.appendChild(li);
              link.remove();
            });
          } else {
            // Create navigation items based on typical GMR structure
            const navItems = [
              { text: "ABOUT US", href: `/${currentLang}/about-us` },
              { text: "BUSINESSES", href: `/${currentLang}/businesses` },
              { text: "INVESTORS", href: `/${currentLang}/investors` },
              { text: "NEWS & INSIGHTS", href: `/${currentLang}/news` },
              { text: "CAREERS", href: `/${currentLang}/careers` },
              {
                text: "SUSTAINABILITY",
                href: `/${currentLang}/sustainability`,
              },
              { text: "FOUNDATION", href: `/${currentLang}/foundation` },
            ];

            navItems.forEach((item) => {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.href = item.href;
              a.textContent = item.text;
              li.appendChild(a);
              mainUl.appendChild(li);
            });
          }

          brandWrapper.appendChild(mainUl);
        }

        // Process menu images
        // Look for the header-image block anywhere in navBrand
        const headerImageBlock = navBrand.querySelector(".header-image");
        const menuImgItems = headerImageBlock ? headerImageBlock.querySelectorAll(":scope > div") : navBrand.querySelectorAll(":scope > div > div");

        if (menuImgItems && menuImgItems.length > 0) {
          menuImgItems.forEach((div) => {
            const first = div.children[0];
            const second = div.children[1];
            const labelEl = second?.querySelector("p") || second;
            const imgEl = first?.querySelector("img");
            if (!labelEl || !imgEl) return;

            const originalImg = imgEl.src.split("?")[0]; // ✅ remove Franklin renditions

            const key = labelEl.textContent
              .trim()
              .toLowerCase()
              .replace(/\u00A0/g, " ")
              .replace(/\s+/g, "-");

            console.log(`Setting imageMap key: ${key}`);
            imageMap.set(key, originalImg);
          });

          // Clean up the block/wrapper if it exists
          if (headerImageBlock) {
            headerImageBlock.closest('.header-image-wrapper')?.remove() || headerImageBlock.remove();
          } else {
            // Fallback cleanup for legacy structure
            navBrand.querySelector(":scope > div > div")?.remove();
          }
        }

        // Get the main UL for navigation
        mainUl = brandWrapper.querySelector("ul");

        // IMPORTANT: Clone the menu BEFORE building mobile nav
        if (mainUl) {
          clonedMenu = mainUl.cloneNode(true);
        }

        if (mainUl) {
          // Add desktop/mobile mode classes
          if (isDesktop.matches) {
            document.body.classList.add("desktop-mode");
            document.body.classList.remove("mobile-mode");

            // Ensure desktop nav is visible
            mainUl.style.display = "flex";
            mainUl.style.visibility = "visible";
            mainUl.style.opacity = "1";
          } else {
            document.body.classList.add("mobile-mode");
            document.body.classList.remove("desktop-mode");
          }

          // Process each LI for mega menu if it has submenus
          [...mainUl.children].forEach((li) => {
            if (li.tagName !== "LI") return;
            const innerList = li.querySelector("ul");
            if (!innerList) return;

            const mainLinkEl = li.querySelector("a");
            let menuTitleText = mainLinkEl ? mainLinkEl.textContent.trim() : "";
            const customTitleEl = li.querySelector("h4");
            if (customTitleEl) {
              const newDiv = document.createElement("div");
              newDiv.className = "menu-title";
              newDiv.textContent = customTitleEl.textContent.trim();

              customTitleEl.replaceWith(newDiv); // Replace h4 with new div
            }
            let descriptionText = "";
            const allPs = li.querySelectorAll(":scope > p");
            allPs.forEach((p) => {
              if (!p.contains(mainLinkEl) && p.textContent.trim().length > 10) {
                descriptionText = p.textContent.trim();
              }
            });

            if (customTitleEl) menuTitleText = customTitleEl.textContent.trim();
            const getImageUrl = (title, link) => {
              const keys = [];
              if (title) keys.push(title.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-"));
              if (link) {
                const linkText = link.textContent.trim();
                if (linkText) keys.push(linkText.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-"));

                try {
                  const url = new URL(link.href, window.location.origin);
                  const slug = url.pathname.split('/').filter(Boolean).pop();
                  if (slug) keys.push(slug.toLowerCase().replace(/\s+/g, "-"));
                } catch (e) {
                  // ignore invalid URLs
                }
              }

              for (const k of keys) {
                if (imageMap.has(k)) return imageMap.get(k);
              }
              return null;
            };

            li.classList.add("has-mega");

            const mainImgSrc = getImageUrl(menuTitleText, mainLinkEl);

            const mega = document.createElement("div");
            mega.className = "mega-wrapper";

            const colLeft = document.createElement("div");
            colLeft.className = "mega-col mega-left";

            const sectionTitle = document.createElement("div");
            sectionTitle.className = "menu-title";
            sectionTitle.textContent = menuTitleText;
            colLeft.append(sectionTitle);

            const horizontalContainer = document.createElement("div");
            horizontalContainer.className = "main-category-list";
            colLeft.append(horizontalContainer);

            const colMid = document.createElement("div");
            colMid.className = "mega-col mega-mid";
            colMid.style.display = "none";

            const colRightList = document.createElement("div");
            colRightList.className = "mega-col mega-list-container";
            colRightList.style.display = "none";

            const colDetails = document.createElement("div");
            colDetails.className = "mega-details-panel";

            if (mainImgSrc) {
              colDetails.style.backgroundImage = `url(${mainImgSrc})`;
              colDetails.style.backgroundSize = "cover";
              colDetails.style.backgroundPosition = "center";
            }

            const updateDetailsPanel = (
              primaryLi,
              parentLi1 = null,
              parentLi2 = null,
              subListNode = null,
            ) => {
              colDetails
                .querySelectorAll(".nested-list")
                .forEach((el) => el.remove());

              const getImgForLi = (li) => {
                if (!li) return null;
                const title = li.querySelector('h4, .menu-title')?.textContent.trim() || li.firstChild?.textContent.trim();
                const link = li.querySelector('a');
                return getImageUrl(title, link);
              };

              let imgSrc = getImgForLi(primaryLi);
              if (!imgSrc && parentLi1) imgSrc = getImgForLi(parentLi1);
              if (!imgSrc && parentLi2) imgSrc = getImgForLi(parentLi2);
              if (!imgSrc) imgSrc = mainImgSrc;

              if (imgSrc) {
                colDetails.style.backgroundImage = `url(${imgSrc})`;
                colDetails.style.backgroundSize = "cover";
                colDetails.style.backgroundPosition = "center";
              }

              if (subListNode) {
                colDetails.append(subListNode);
              }
            };

            mega.append(colLeft, colMid, colRightList, colDetails);

            const originalUl = li.querySelector("ul");
            if (originalUl) originalUl.remove();

            li.append(mega);

            [...innerList.children].forEach((level1Li) => {
              const l1LinkEl = level1Li.querySelector("a");
              const l1Text = l1LinkEl
                ? l1LinkEl.textContent.trim()
                : level1Li.firstChild.textContent.trim();
              const l1Href = l1LinkEl ? l1LinkEl.href : "#";

              const itemContainer = document.createElement("div");
              itemContainer.className = "cat-item";
              const l1A = document.createElement("a");
              l1A.href = l1Href;
              l1A.innerHTML = `${l1Text} <span class="arrow">></span>`;
              itemContainer.append(l1A);
              horizontalContainer.append(itemContainer);

              itemContainer.addEventListener("mouseenter", () => {
                console.log(`[MegaMenu] Hovered Level 1: ${l1Text}`);
                if (isDesktop.matches) {
                  // Immediate visual feedback
                  horizontalContainer
                    .querySelectorAll(".cat-item")
                    .forEach((el) => {
                      el.classList.remove("active");
                    });
                  itemContainer.classList.add("active");

                  debounceMegaMenu(() => {
                    console.log(`[MegaMenu] Loading content for: ${l1Text}`);

                    colMid.innerHTML = "";
                    colMid.style.display = "none";
                    colRightList.innerHTML = "";
                    colRightList.style.display = "none";

                    updateDetailsPanel(level1Li);

                    const level2Ul = level1Li.querySelector("ul");
                    if (level2Ul) {
                      colMid.style.display = "block";

                      const l2Ul = document.createElement("ul");
                      l2Ul.className = "vertical-nav-list";
                      colMid.append(l2Ul);

                      [...level2Ul.children].forEach((level2Li) => {
                        const l2LinkEl = level2Li.querySelector("a");
                        const l2Text = l2LinkEl
                          ? l2LinkEl.textContent.trim()
                          : level2Li.textContent.trim();
                        const l2Href = l2LinkEl ? l2LinkEl.href : "#";

                        const l2LiNode = document.createElement("li");
                        const l2A = document.createElement("a");
                        l2A.href = l2Href;
                        l2A.textContent = l2Text;
                        l2LiNode.append(l2A);
                        l2Ul.append(l2LiNode);

                        l2LiNode.addEventListener("mouseenter", () => {
                          if (isDesktop.matches) {
                            // Immediate visual feedback
                            l2Ul
                              .querySelectorAll("li")
                              .forEach((el) => {
                                el.classList.remove("active");
                              });
                            l2LiNode.classList.add("active");

                            debounceMegaMenu(() => {
                              colRightList.innerHTML = "";
                              colRightList.style.display = "none";
                              updateDetailsPanel(level2Li, level1Li);

                              const level3Ul = level2Li.querySelector("ul");
                              if (level3Ul) {
                                colRightList.style.display = "block";

                                const l3Ul = document.createElement("ul");
                                l3Ul.className = "vertical-nav-list";
                                colRightList.append(l3Ul);

                                [...level3Ul.children].forEach((level3Li) => {
                                  const l3LinkEl = level3Li.querySelector("a");
                                  const l3Text = l3LinkEl
                                    ? l3LinkEl.textContent.trim()
                                    : level3Li.firstChild.textContent.trim();
                                  const l3Href = l3LinkEl ? l3LinkEl.href : "#";

                                  const l3LiNode = document.createElement("li");
                                  const l3A = document.createElement("a");
                                  l3A.href = l3Href;

                                  const level4Ul = level3Li.querySelector("ul");
                                  if (level4Ul) {
                                    l3A.innerHTML = `${l3Text} <span class="right-arrow">›</span>`;
                                  } else {
                                    l3A.textContent = l3Text;
                                  }

                                  l3LiNode.append(l3A);
                                  l3Ul.append(l3LiNode);

                                  l3LiNode.addEventListener("mouseenter", () => {
                                    if (isDesktop.matches) {
                                      // Immediate visual feedback
                                      l3Ul
                                        .querySelectorAll("li")
                                        .forEach((el) => {
                                          el.classList.remove("active");
                                        });
                                      l3LiNode.classList.add("active");

                                      debounceMegaMenu(() => {
                                        let l4List = null;
                                        if (level4Ul) {
                                          l4List = level4Ul.cloneNode(true);
                                          l4List.className =
                                            "vertical-nav-list nested-list";
                                        }

                                        updateDetailsPanel(
                                          level3Li,
                                          level2Li,
                                          level1Li,
                                          l4List,
                                        );
                                      }, 50);
                                    }
                                  });
                                });
                              }
                            }, 80);
                          }
                        });
                      });
                    }
                  }, 100);
                }
              });
            });
          });
        }

        // Build mobile navigation ONLY on mobile
        if (!isDesktop.matches && clonedMenu) {
          const mobileNav = buildMobileNav(clonedMenu);
          navBrand.appendChild(mobileNav);
        }
      }
    }

    const navSections = nav.querySelector(".nav-sections");
    if (navSections) {
      navSections
        .querySelectorAll(":scope .default-content-wrapper > ul > li")
        .forEach((navSection) => {
          if (navSection.querySelector("ul"))
            navSection.classList.add("nav-drop");

          if (isDesktop.matches) {
            navSection.addEventListener("click", () => {
              const expanded =
                navSection.getAttribute("aria-expanded") === "true";
              toggleAllNavSections(navSections);
              navSection.setAttribute(
                "aria-expanded",
                expanded ? "false" : "true",
              );
            });
          }
        });
    }

    const container = document.createElement("div");
    container.className = "container position-relative";

    while (nav.firstChild) container.append(nav.firstChild);

    nav.append(container);

    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(nav, navSections);
    });

    navWrapper.appendChild(hamburger);
    navWrapper.appendChild(nav);

    function handleHeaderAffix() {
      if (window.scrollY > 10) navWrapper.classList.add("affix");
      else navWrapper.classList.remove("affix");
    }
    handleHeaderAffix();
    window.addEventListener("scroll", handleHeaderAffix, { passive: true });

    block.append(navWrapper);

    // FIX: Ensure desktop navigation is properly initialized
    if (isDesktop.matches) {
      // Force show desktop navigation
      const desktopNav = navBrand?.querySelector(
        ".default-content-wrapper > ul",
      );
      if (desktopNav) {
        desktopNav.style.display = "flex";
        desktopNav.style.visibility = "visible";
        desktopNav.style.opacity = "1";
      }
    }

    toggleMenu(nav, navSections, isDesktop.matches);

    // Update media query listener
    isDesktop.addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.add("desktop-mode");
        document.body.classList.remove("mobile-mode");

        // Remove mobile nav if it exists
        const mobileNav = navBrand?.querySelector(".mobile-nav-container");
        if (mobileNav) mobileNav.remove();

        // Show desktop nav
        const desktopNav = navBrand?.querySelector(
          ".default-content-wrapper > ul",
        );
        if (desktopNav) {
          desktopNav.style.display = "flex";
          desktopNav.style.visibility = "visible";
          desktopNav.style.opacity = "1";
        }
      } else {
        document.body.classList.add("mobile-mode");
        document.body.classList.remove("desktop-mode");

        // Hide desktop nav
        const desktopNav = navBrand?.querySelector(
          ".default-content-wrapper > ul",
        );
        if (desktopNav) {
          desktopNav.style.display = "none";
        }

        // Build mobile nav if needed
        if (
          clonedMenu &&
          navBrand &&
          !navBrand.querySelector(".mobile-nav-container")
        ) {
          const mobileNav = buildMobileNav(clonedMenu);
          navBrand.appendChild(mobileNav);
        }
      }

      toggleMenu(nav, navSections, e.matches);
    });

    // FINAL STEP: The redundant link rewrite logic has been removed as it's now handled early
    // and correctly in the decoration process.
  } catch (e) {
    console.error("Navigation Decorate Failed:", e);
  } finally {
    // REVEAL PAGE: The header is the most important element to avoid flashing.
    // By revealing here, we ensure the user sees a complete, localized header.
    if (window.revealPage) {
      console.log("Header decorated, triggering revealPage()");
      window.revealPage();
    }
  }
}

// Helper function to create navigation structure from text content
function createNavStructureFromText(nav, currentLang = "en") {
  const navText = nav.textContent;

  // Create the standard 3-section structure for proper styling
  const navBrand = document.createElement("div");
  navBrand.className = "nav-brand";
  const brandWrapper = document.createElement("div");
  brandWrapper.className = "default-content-wrapper";
  const ul = document.createElement("ul");

  // Language-aware links
  const navItems = [
    { text: "ABOUT US", href: `/${currentLang}/about-us` },
    { text: "BUSINESSES", href: `/${currentLang}/businesses` },
    { text: "INVESTORS", href: `/${currentLang}/investors` },
    { text: "NEWS & INSIGHTS", href: `/${currentLang}/news` },
    { text: "CAREERS", href: `/${currentLang}/careers` },
    { text: "SUSTAINABILITY", href: `/${currentLang}/sustainability` },
    { text: "FOUNDATION", href: `/${currentLang}/foundation` },
  ];

  navItems.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.text;
    li.appendChild(a);
    ul.appendChild(li);
  });

  brandWrapper.appendChild(ul);
  navBrand.appendChild(brandWrapper);

  const navSections = document.createElement("div");
  navSections.className = "nav-sections";
  const sectionsWrapper = document.createElement("div");
  sectionsWrapper.className = "default-content-wrapper";
  navSections.appendChild(sectionsWrapper);

  const navTools = document.createElement("div");
  navTools.className = "nav-tools";
  const toolsWrapper = document.createElement("div");
  toolsWrapper.className = "default-content-wrapper";
  navTools.appendChild(toolsWrapper);

  // Clear nav and add structured content (brand, sections, tools)
  nav.innerHTML = "";
  nav.appendChild(navBrand);
  nav.appendChild(navSections);
  nav.appendChild(navTools);
}
