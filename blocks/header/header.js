import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia("(min-width: 900px)");

function closeOnEscape(e) {
  if (e.code !== "Escape") return;

  const nav = document.getElementById("nav");
  if (!nav) return;

  const navSections = nav.querySelector(".nav-sections");
  if (!navSections) return;

  const navSectionExpanded = navSections.querySelector(
    '[aria-expanded="true"]'
  );

  if (navSectionExpanded && isDesktop.matches) {
    // collapse only the open dropdown on desktop
    toggleAllNavSections(navSections);
    navSectionExpanded.focus();
  } else if (!isDesktop.matches) {
    // close full menu on mobile
    toggleMenu(nav, navSections);
    const btn = nav.querySelector("button");
    if (btn) btn.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav) return;

  // focus moved completely outside of nav
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector(".nav-sections");
    if (!navSections) return;

    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]'
    );
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
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

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|String} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  const value = expanded === true || expanded === "true" ? "true" : "false";

  sections
    .querySelectorAll(":scope .default-content-wrapper > ul > li")
    .forEach((section) => {
      section.setAttribute("aria-expanded", value);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) return;

  const currentlyExpanded = nav.getAttribute("aria-expanded") === "true";
  // if forceExpanded is not null, we want nav to be exactly that, not inverted
  const willBeExpanded =
    forceExpanded !== null ? !!forceExpanded : !currentlyExpanded;

  const button = nav.querySelector(".nav-hamburger button");

  // lock scroll on mobile when menu open
  document.body.style.overflowY =
    willBeExpanded || isDesktop.matches ? "" : "hidden";

  nav.setAttribute("aria-expanded", willBeExpanded ? "true" : "false");

  // collapse or expand dropdowns according to new state / breakpoint
  const dropdownExpanded =
    willBeExpanded && !isDesktop.matches ? "true" : "false";
  toggleAllNavSections(navSections, dropdownExpanded);

  if (button) {
    button.setAttribute(
      "aria-label",
      willBeExpanded ? "Close navigation" : "Open navigation"
    );
  }

  // enable nav dropdown keyboard accessibility
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

  // escape / focus-out handling
  if (willBeExpanded || isDesktop.matches) {
    window.addEventListener("keydown", closeOnEscape);
    nav.addEventListener("focusout", closeOnFocusLost);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
    nav.removeEventListener("focusout", closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // 🔹 imageMap available everywhere inside decorate
  const imageMap = new Map();

  // load nav as fragment
  const navMeta = getMetadata("nav");
  const navPathMain = navMeta
    ? new URL(navMeta, window.location).pathname
    : "/en/nav";
  const isAero = window.location.pathname.startsWith("/aero-gmr/");
  const navPath = isAero ? "/aero-gmr/nav" : navPathMain;
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = "";
  const nav = document.createElement("nav");
  nav.id = "nav";
  nav.setAttribute("aria-expanded", "false");

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = ["brand", "sections", "tools"];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector(".nav-brand");
  if (navBrand) {
    const brandLink = navBrand.querySelector(".button");
    if (brandLink) {
      brandLink.className = "";
      const btnContainer = brandLink.closest(".button-container");
      if (btnContainer) btnContainer.className = "";
    }

    // 🔹 Build imageMap from header-image block
    // Structure expected:
    // <div>
    //   <div> <picture><img …></picture> </div>
    //   <div><p>about</p></div>
    // </div>
    const menuImgWrapper = navBrand.querySelector(":scope > div > div");
    if (menuImgWrapper) {
      [...menuImgWrapper.children].forEach((div) => {
        const first = div.children[0];
        const second = div.children[1];

        const labelEl = second?.querySelector("p");
        const imgEl = first?.querySelector("img");

        if (!labelEl || !imgEl) return;

        const key = labelEl.textContent
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        imageMap.set(key, imgEl.src);
      });
    }

    const mainUl = navBrand.querySelector(":scope > div > ul");
    if (!mainUl) return;

    [...mainUl.children].forEach((li) => {
      if (li.tagName !== "LI") return;

      const ps = li.querySelectorAll(":scope > p");
      const titleEl = li.querySelector(":scope > h4");
      const descP = ps.length > 1 ? ps[1] : null;
      const innerList = li.querySelector(":scope > ul");

      // 🔹 main menu label: used as fallback for images
      const mainLabelEl = li.querySelector(
        ":scope > p, :scope > a, :scope > span, :scope > h4"
      );
      const mainKey = mainLabelEl
        ? mainLabelEl.textContent.trim().toLowerCase().replace(/\s+/g, "-")
        : null;

      // only ABOUT / BUSINESS / INVESTORS have extra content
      const hasMega = titleEl || descP || innerList;
      if (!hasMega || !innerList) return;

      li.classList.add("has-mega");

      // wrapper
      const mega = document.createElement("div");
      mega.className = "mega-wrapper";

      // left column
      const colLeft = document.createElement("div");
      colLeft.className = "mega-left";

      if (titleEl) colLeft.append(titleEl);
      if (descP) colLeft.append(descP);

      // middle column
      const colMid = document.createElement("div");
      colMid.className = "mega-mid";

      // right column
      const colRight = document.createElement("div");
      colRight.className = "mega-right";

      // CASE 1: simple mega → put innerList in middle
      if (innerList && descP) {
        colMid.append(innerList);

        // default image for this mega = main menu image if available
        if (mainKey) {
          const imgUrl = imageMap.get(mainKey);
          if (imgUrl) {
            const img = document.createElement("img");
            img.src = imgUrl;
            colRight.append(img);
          }
        }
      } else {
        // CASE 2: 3-level mega: level1 → level2 → level3 (UL)
        // move big UL to left
        colLeft.append(innerList);

        let counter = 0;

        [...innerList.children].forEach((level1) => {
          const level2Ul = level1.querySelector(":scope > ul"); // level 2 UL
          if (!level2Ul) return;

          // level2Li = li that contains level3 <ul>
          level2Ul.querySelectorAll(":scope > li > ul").forEach((level3Ul) => {
            counter++;
            const id = `thirdMenu-${counter}`;

            const level2Li = level3Ul.closest("li");

            const el2 = level2Li.querySelector(
              ":scope > p, :scope > a, :scope > span"
            );
            let level2Text = "";

            if (el2) {
              // first check if <a> exists inside el
              const link2 = el2.querySelector("a");

              if (link2) {
                level2Text = link2.outerHTML;
              } else {
                level2Text = el2.textContent.trim();
              }
            }

            const el = level1.querySelector(
              ":scope > p, :scope > a, :scope > span"
            );
            let level1Text = "";

            if (el) {
              // first check if <a> exists inside el
              const link = el.querySelector("a");

              if (link) {
                level1Text = link.outerHTML;
              } else {
                level1Text = el.textContent.trim();
              }
            }

            const thirdMenu = document.createElement("div");
            thirdMenu.classList.add("thirdMenu");
            thirdMenu.id = id;

            const headingWrapper = document.createElement("div");
            headingWrapper.classList.add("thirdMenu-headings");

            if (level1Text) {
              const l1 = document.createElement("div");
              l1.classList.add("thirdMenu-level1");
              l1.innerHTML = level1Text;
              headingWrapper.append(l1);
            }

            if (level2Text) {
              const l2 = document.createElement("div");
              l2.classList.add("thirdMenu-level2");
              l2.innerHTML = level2Text;
              headingWrapper.append(l2);
            }

            thirdMenu.append(headingWrapper);
            thirdMenu.append(level3Ul.cloneNode(true));
            colMid.append(thirdMenu);

            // link level2 <li> → this panel
            if (level2Li) {
              level2Li.dataset.target = id;
            }
          });
        });

        // hide all panels by default
        colMid.querySelectorAll(".thirdMenu").forEach((div) => {
          div.style.display = "none";
        });

        // default image = main menu image if available
        if (mainKey) {
          const defaultImg = imageMap.get(mainKey);
          if (defaultImg) {
            const img = document.createElement("img");
            img.src = defaultImg;
            colRight.append(img);
          }
        }

        // hover on innerList <li> (2nd-level + possible 3rd-level)
        innerList.querySelectorAll("li").forEach((levelLi) => {
          levelLi.addEventListener("mouseenter", () => {
            const target = levelLi.dataset.target;

            // 🔹 panels: only if there is a target
            colMid.querySelectorAll(".thirdMenu").forEach((div) => {
              div.style.display = "none";
            });

            if (target) {
              const panel = document.getElementById(target);
              if (panel) panel.style.display = "block";
            }

            // 🔹 image logic ALWAYS runs (even when there's no panel)
            const labelEl = levelLi.querySelector(
              ":scope > p, :scope > a, :scope > span"
            );

            let imgUrl = null;

            // try submenu-specific image
            if (labelEl) {
              const key = labelEl.textContent
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");
              imgUrl = imageMap.get(key) || null;
            }

            // fallback to main menu image
            if (!imgUrl && mainKey) {
              imgUrl = imageMap.get(mainKey) || null;
            }

            // update colRight
            colRight.innerHTML = "";

            if (imgUrl) {
              const img = document.createElement("img");
              img.src = imgUrl;
              colRight.append(img);
            }
            // else: nothing → colRight stays empty; or you could re-apply main image here
          });
        });
      }

      mega.append(colLeft, colMid, colRight);
      li.append(mega);
    });
  }

  const navSections = nav.querySelector(".nav-sections");
  if (navSections) {
    navSections
      .querySelectorAll(":scope .default-content-wrapper > ul > li")
      .forEach((navSection) => {
        if (navSection.querySelector("ul")) {
          navSection.classList.add("nav-drop");
        }
        navSection.addEventListener("click", () => {
          if (isDesktop.matches) {
            const expanded =
              navSection.getAttribute("aria-expanded") === "true";
            toggleAllNavSections(navSections);
            navSection.setAttribute(
              "aria-expanded",
              expanded ? "false" : "true"
            );
          }
        });
      });
  }

  // hamburger for mobile
  const hamburger = document.createElement("div");
  hamburger.classList.add("nav-hamburger");
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute("aria-expanded", "false");

  // initialize state based on current breakpoint
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener("change", () =>
    toggleMenu(nav, navSections, isDesktop.matches)
  );

  // Create wrapper that will hold nav
  const navWrapper = document.createElement("div");
  navWrapper.className = "primary-header";

  // Create container and move nav content inside it
  const container = document.createElement("div");
  container.className = "container";

  // Move all nav children into container
  while (nav.firstChild) {
    container.append(nav.firstChild);
  }

  // Append container back into nav
  nav.append(container);

  // Append nav to wrapper
  navWrapper.append(nav);

  // Replace block content
  block.innerHTML = "";
  block.append(navWrapper);
}
