// import { getFetchUrl } from '../lottie-animation/dam-json-helper.js';

// export default function decorate(block) {
//     const rows = [...block.children];
//     if (rows.length < 7) return;

//     block.classList.add("global-airport-network");

//     /* ================================
//        1. Read authored content
//     ================================ */

//     const titleEl = rows[0];
//     const descEl = rows[1];
//     const indiaTabRow = rows[2];   // India tab label
//     const intlTabRow = rows[3];   // International tab label
//     const mapImageRow = rows[4];
//     const imageAltRow = rows[5];
//     const lottiePathRow = rows[6];

//     const itemRows = rows.slice(7);

//     const titleText = titleEl?.textContent?.trim() || "";
//     const indiaTabLabel = indiaTabRow?.textContent?.trim() || "India Presence";
//     const intlTabLabel = intlTabRow?.textContent?.trim() || "International Presence";
//     const imageAltText = imageAltRow?.textContent?.trim() || "";
//     const mapImage = mapImageRow?.querySelector("img");

//     /* ================================
//        2. Resolve Lottie JSON path
//     ================================ */

//     let finalLottiePath = "";
//     const lottieLink = lottiePathRow?.querySelector("a");
//     const lottieText = lottiePathRow?.textContent?.trim();

//     if (lottieLink) {
//         finalLottiePath = getFetchUrl(lottieLink.getAttribute("href") || "");
//     } else if (lottieText) {
//         finalLottiePath = getFetchUrl(lottieText);
//     }

//     /* ================================
//        3. Process items — split by presenceType
//     ================================ */

//     const INDIA_KEYS = ["india-airports", "india-corporate-office", "india-energy", "india-highways", "india-sir"];
//     const INTL_KEYS = ["international-airport", "international-office"];

//     const groups = {};
//     [...INDIA_KEYS, ...INTL_KEYS].forEach(k => { groups[k] = []; });

//     // Map presenceCategory values to the combined key suffix
//     const CATEGORY_MAP = {
//         "airports": "airports",
//         "corporate-office": "corporate-office",
//         "energy": "energy",
//         "highways": "highways",
//         "sir": "sir",
//         "office": "office",
//     };

//     itemRows.forEach((itemRow) => {
//         if (!itemRow || itemRow.children.length < 5) return;

//         const cells = [...itemRow.children];

//         // Cell order: presenceGroup | presenceCategory | airportName | countryName | flagIcon | imageAlt
//         const groupCell = cells[0];
//         const categoryCell = cells[1];
//         const airportEl = cells[2];
//         const countryEl = cells[3];
//         const flagEl = cells[4];
//         const altCell = cells[5];

//         const group = groupCell?.textContent?.trim().toLowerCase() || "india";
//         const category = CATEGORY_MAP[categoryCell?.textContent?.trim().toLowerCase()] || "airports";
//         const key = `${group}-${category}`;

//         const authoredAlt = altCell?.textContent?.trim() || "";
//         const countryName = countryEl?.textContent?.trim() || "";
//         const img = flagEl?.querySelector("img");
//         if (img) img.setAttribute("alt", authoredAlt || countryName);

//         groupCell?.remove();
//         categoryCell?.remove();
//         altCell?.remove();
//         itemRow.remove();

//         itemRow.className = "gan-location";
//         airportEl.classList.add("gan-airport");
//         countryEl.classList.add("gan-country");
//         flagEl.classList.add("gan-flag");

//         const target = groups[key] !== undefined ? key : (group === "international" ? "international-airport" : "india-airports");
//         groups[target].push(itemRow);
//     });

//     /* ================================
//        4. Build layout
//     ================================ */

//     const wrapper = document.createElement("div");
//     wrapper.className = "gan-wrapper spacer";

//     const container = document.createElement("div");
//     container.className = "container";

//     const row = document.createElement("div");
//     row.className = "row align-items-center";

//     /* ── Left column ── */
   

//     /* ── Left column ── */
// const leftCol = document.createElement("div");
// leftCol.className = "col-lg-4 col-md-5";

// if (titleText) {
//     const h2 = document.createElement("h2");
//     h2.className = "sec-title mb-4";
//     h2.textContent = titleText;
//     leftCol.appendChild(h2);
// }

// /* ================================
//    Dropdown Structure (Accordion)
// ================================ */

// const dropdownWrap = document.createElement("div");
// dropdownWrap.className = "gan-dropdown";

// /* ---- Helper to build dropdown section ---- */
// function buildDropdownSection(label, keyPrefix, isOpen = false) {
//     const section = document.createElement("div");
//     section.className = "gan-dd-section" + (isOpen ? " open" : "");

//     const header = document.createElement("div");
//     header.className = "gan-dd-header";
//     header.innerHTML = `
//         <span>${label}</span>
//         <span class="gan-dd-icon">${isOpen ? "−" : "+"}</span>
//     `;

//     const body = document.createElement("div");
//     body.className = "gan-dd-body";
//     body.style.display = isOpen ? "block" : "none";

//     // find matching categories from groups
//     Object.keys(groups).forEach(groupKey => {
//         if (groupKey.startsWith(keyPrefix)) {
//             const categoryName = groupKey.replace(keyPrefix + "-", "");
//             const btn = document.createElement("div");
//             btn.className = "gan-dd-item";
//             btn.textContent = categoryName
//                 .replace("-", " ")
//                 .replace(/\b\w/g, l => l.toUpperCase());

//             btn.dataset.target = groupKey;
//             body.appendChild(btn);
//         }
//     });

//     header.addEventListener("click", () => {
//         const isActive = section.classList.contains("open");
//         document.querySelectorAll(".gan-dd-section").forEach(sec => {
//             sec.classList.remove("open");
//             sec.querySelector(".gan-dd-body").style.display = "none";
//             sec.querySelector(".gan-dd-icon").textContent = "+";
//         });

//         if (!isActive) {
//             section.classList.add("open");
//             body.style.display = "block";
//             header.querySelector(".gan-dd-icon").textContent = "−";
//         }
//     });

//     section.appendChild(header);
//     section.appendChild(body);

//     return section;
// }

// /* India Dropdown (open by default) */
// dropdownWrap.appendChild(
//     buildDropdownSection(indiaTabLabel, "india", true)
// );

// /* International Dropdown */
// dropdownWrap.appendChild(
//     buildDropdownSection(intlTabLabel, "international", false)
// );

// leftCol.appendChild(dropdownWrap);


    

//     /* ── Tab buttons ── */
//     const tabsWrap = document.createElement("div");
//     tabsWrap.className = "gan-tabs";

//     const tabs = [
//         { key: "india", label: indiaTabLabel },
//         { key: "international", label: intlTabLabel },
//     ];

//     tabs.forEach(({ key, label }, i) => {
//         const btn = document.createElement("button");
//         btn.type = "button";
//         btn.className = "gan-tab-btn" + (i === 0 ? " active" : "");
//         btn.dataset.tab = key;
//         btn.textContent = label;
//         tabsWrap.appendChild(btn);
//     });

//     leftCol.appendChild(tabsWrap);

//     /* ── Right column ── */
//     const rightCol = document.createElement("div");
//     rightCol.className = "col-lg-8 col-md-7";

//     const mapWrap = document.createElement("div");
//     mapWrap.className = "gan-map-wrap";

//     if (mapImage) {
//         mapImage.removeAttribute("width");
//         mapImage.removeAttribute("height");
//         mapImage.setAttribute("alt", imageAltText);
//         mapImage.classList.add("gan-map-image");
//         mapWrap.appendChild(mapImage);
//     }

//     const lottieWrap = document.createElement("div");
//     lottieWrap.className = "gan-lottie";
//     mapWrap.appendChild(lottieWrap);

//     /* ── Helper: build sub-section ── */
//     function buildSubSection(key, heading, placeholders) {
//         const items = groups[key] || [];

//         const subWrap = document.createElement("div");
//         subWrap.className = "gan-sub-section";

//         const subHeading = document.createElement("p");
//         subHeading.className = "gan-sub-heading";
//         subHeading.textContent = heading;
//         subWrap.appendChild(subHeading);

//         const cardsWrap = document.createElement("div");
//         cardsWrap.className = "gan-sub-cards";

//         if (items.length > 0) {
//             items.forEach(item => cardsWrap.appendChild(item));
//         } else {
//             placeholders.forEach(ph => {
//                 const [name, country] = ph.split("|");
//                 const card = document.createElement("div");
//                 card.className = "gan-location";
//                 const ap = document.createElement("p"); ap.className = "gan-airport"; ap.textContent = name;
//                 const co = document.createElement("p"); co.className = "gan-country"; co.textContent = country;
//                 card.appendChild(ap); card.appendChild(co);
//                 cardsWrap.appendChild(card);
//             });
//         }

//         subWrap.appendChild(cardsWrap);
//         return subWrap;
//     }

//     /* ── Location panels (one per tab) ── */
//     const panels = {};

//     // ---- India panel ----
//     const indiaPanel = document.createElement("div");
//     indiaPanel.className = "gan-locations gan-panel gan-intl-panel";
//     indiaPanel.dataset.panel = "india";

//     [
//         { key: "india-airports", heading: "Airports", placeholders: ["Delhi International Airport|New Delhi", "Hyderabad International Airport|Telangana"] },
//         { key: "india-corporate-office", heading: "Corporate Office", placeholders: ["GMR Corporate HQ|New Delhi"] },
//         { key: "india-energy", heading: "Energy", placeholders: ["GMR Energy Plant|India"] },
//         { key: "india-highways", heading: "Highways", placeholders: ["Eastern Peripheral Highway|India"] },
//         { key: "india-sir", heading: "Special Investment Region", placeholders: ["GMR Aerospace Park|Hyderabad"] },
//     ].forEach(({ key, heading, placeholders }) => {
//         indiaPanel.appendChild(buildSubSection(key, heading, placeholders));
//     });

//     mapWrap.appendChild(indiaPanel);
//     panels.india = indiaPanel;

//     // ---- International panel ----
//     const intlPanel = document.createElement("div");
//     intlPanel.className = "gan-locations gan-panel gan-intl-panel";
//     intlPanel.dataset.panel = "international";
//     intlPanel.style.display = "none";

//     [
//         { key: "international-airport", heading: "Airports", placeholders: ["Dubai International Airport|UAE", "Singapore Changi Airport|Singapore"] },
//         { key: "international-office", heading: "Office", placeholders: ["GMR Dubai Office|UAE", "GMR Singapore Office|Singapore"] },
//     ].forEach(({ key, heading, placeholders }) => {
//         intlPanel.appendChild(buildSubSection(key, heading, placeholders));
//     });

//     mapWrap.appendChild(intlPanel);
//     panels.international = intlPanel;

//     rightCol.appendChild(mapWrap);

//     row.appendChild(leftCol);
//     row.appendChild(rightCol);
//     container.appendChild(row);
//     wrapper.appendChild(container);

//     /* ================================
//        5. Tab click logic
//     ================================ */

//     tabsWrap.addEventListener("click", (e) => {
//         const btn = e.target.closest(".gan-tab-btn");
//         if (!btn) return;

//         const activeKey = btn.dataset.tab;

//         tabsWrap.querySelectorAll(".gan-tab-btn").forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");

//         Object.keys(panels).forEach(key => {
//             panels[key].style.display = key === activeKey ? "" : "none";
//         });
//     });

//     /* ================================
//        6. Cleanup authored rows & render
//     ================================ */

//     [mapImageRow, imageAltRow, lottiePathRow, indiaTabRow, intlTabRow].forEach(r => r?.remove());

//     block.innerHTML = "";
//     block.appendChild(wrapper);

//     /* ================================
//        7. Initialize Lottie
//     ================================ */

//     if (finalLottiePath && window.innerWidth >= 768) {
//         const lottieObserver = new IntersectionObserver((entries) => {
//             if (entries.some(e => e.isIntersecting)) {
//                 lottieObserver.disconnect();
//                 if (window.bodymovin) {
//                     window.bodymovin.loadAnimation({
//                         container: lottieWrap,
//                         renderer: "svg",
//                         loop: true,
//                         autoplay: true,
//                         path: finalLottiePath,
//                     });
//                 } else {
//                     console.warn("❌ bodymovin library not loaded");
//                 }
//             }
//         }, { threshold: 0, rootMargin: '200px' });

//         lottieObserver.observe(block);
//     }
// }







import { getFetchUrl } from '../lottie-animation/dam-json-helper.js';

export default function decorate(block) {
    const rows = [...block.children];
    if (rows.length < 7) return;

    block.classList.add("global-airport-network");

    /* ================================
       1. Read authored content
    ================================ */

    const titleEl = rows[0];
    const descEl = rows[1];
    const indiaTabRow = rows[2];
    const intlTabRow = rows[3];
    const mapImageRow = rows[4];
    const imageAltRow = rows[5];
    const lottiePathRow = rows[6];

    const itemRows = rows.slice(7);

    const titleText = titleEl?.textContent?.trim() || "";
    const indiaTabLabel = indiaTabRow?.textContent?.trim() || "India Presence";
    const intlTabLabel = intlTabRow?.textContent?.trim() || "International Presence";
    const imageAltText = imageAltRow?.textContent?.trim() || "";
    const mapImage = mapImageRow?.querySelector("img");

    /* ================================
       2. Resolve Lottie JSON path
    ================================ */

    let finalLottiePath = "";
    const lottieLink = lottiePathRow?.querySelector("a");
    const lottieText = lottiePathRow?.textContent?.trim();

    if (lottieLink) {
        finalLottiePath = getFetchUrl(lottieLink.getAttribute("href") || "");
    } else if (lottieText) {
        finalLottiePath = getFetchUrl(lottieText);
    }

    /* ================================
       3. Process items
    ================================ */

    const INDIA_KEYS = ["india-airports", "india-corporate-office", "india-energy", "india-highways", "india-special-investment region"];
    const INTL_KEYS = ["international-airport", "international-office"];

    const groups = {};
    [...INDIA_KEYS, ...INTL_KEYS].forEach(k => { groups[k] = []; });

    const CATEGORY_MAP = {
        "airports": "airports",
        "corporate-office": "corporate-office",
        "energy": "energy",
        "highways": "highways",
        "sir": "special-investment-region",
        "office": "office",
    };

    itemRows.forEach((itemRow) => {
        if (!itemRow || itemRow.children.length < 5) return;

        const cells = [...itemRow.children];

        const groupCell = cells[0];
        const categoryCell = cells[1];
        const airportEl = cells[2];
        const countryEl = cells[3];
        const flagEl = cells[4];
        const altCell = cells[5];

        const group = groupCell?.textContent?.trim().toLowerCase() || "india";
        const category = CATEGORY_MAP[categoryCell?.textContent?.trim().toLowerCase()] || "airports";
        const key = `${group}-${category}`;

        const authoredAlt = altCell?.textContent?.trim() || "";
        const countryName = countryEl?.textContent?.trim() || "";
        const img = flagEl?.querySelector("img");
        if (img) img.setAttribute("alt", authoredAlt || countryName);

        groupCell?.remove();
        categoryCell?.remove();
        altCell?.remove();
        itemRow.remove();

        itemRow.className = "gan-location";
        airportEl.classList.add("gan-airport");
        countryEl.classList.add("gan-country");
        flagEl.classList.add("gan-flag");

        const target = groups[key] !== undefined
            ? key
            : (group === "international" ? "international-airport" : "india-airports");

        groups[target].push(itemRow);
    });

    /* ================================
       4. Build Layout
    ================================ */

    const wrapper = document.createElement("div");
    wrapper.className = "gan-wrapper spacer";

    const container = document.createElement("div");
    container.className = "container";

    const row = document.createElement("div");
    row.className = "row align-items-center";

    /* ── Left Column ── */

    const leftCol = document.createElement("div");
    leftCol.className = "col-lg-4 col-md-5";

    if (titleText) {
        const h2 = document.createElement("h2");
        h2.className = "sec-titles mb-4 ";
        h2.textContent = titleText;
        leftCol.appendChild(h2);
    }

    const dropdownWrap = document.createElement("div");
    dropdownWrap.className = "gan-dropdown";

    function buildDropdownSection(label, keyPrefix, isOpen = false) {
        const section = document.createElement("div");
        section.className = "gan-dd-section" + (isOpen ? " open" : "");

        const header = document.createElement("div");
        header.className = "gan-dd-header";
        header.innerHTML = `
            <span>${label}</span>
            <span class="gan-dd-icon">${isOpen ? "−" : "+"}</span>
        `;

        const body = document.createElement("div");
        body.className = "gan-dd-body";
        body.style.display = isOpen ? "block" : "none";

        Object.keys(groups).forEach(groupKey => {
            if (groupKey.startsWith(keyPrefix)) {
                const categoryName = groupKey.replace(keyPrefix + "-", "");
                const btn = document.createElement("div");
                btn.className = "gan-dd-item";
                btn.textContent = categoryName
                    .replace("-", " ")
                    .replace(/\b\w/g, l => l.toUpperCase());

                    btn.addEventListener("click", () => {
    // Remove active from all items
    document.querySelectorAll(".gan-dd-item").forEach(item => {
        item.classList.remove("active");
    });

    // Add active to clicked item
    btn.classList.add("active");
});


                body.appendChild(btn);
            }
        });

        header.addEventListener("click", () => {
            const isActive = section.classList.contains("open");

            document.querySelectorAll(".gan-dd-section").forEach(sec => {
                sec.classList.remove("open");
                sec.querySelector(".gan-dd-body").style.display = "none";
                sec.querySelector(".gan-dd-icon").textContent = "+";
            });

            if (!isActive) {
                section.classList.add("open");
                body.style.display = "block";
                header.querySelector(".gan-dd-icon").textContent = "−";
            }
        });

        section.appendChild(header);
        section.appendChild(body);
        return section;
    }

    dropdownWrap.appendChild(buildDropdownSection(indiaTabLabel, "india", true));
    dropdownWrap.appendChild(buildDropdownSection(intlTabLabel, "international", false));

    leftCol.appendChild(dropdownWrap);

    /* ── Right Column ── */

    const rightCol = document.createElement("div");
    rightCol.className = "col-lg-8 col-md-7";

    const mapWrap = document.createElement("div");
    mapWrap.className = "gan-map-wrap";

    if (mapImage) {
        mapImage.removeAttribute("width");
        mapImage.removeAttribute("height");
        mapImage.setAttribute("alt", imageAltText);
        mapImage.classList.add("gan-map-image");
        mapWrap.appendChild(mapImage);
    }

    const lottieWrap = document.createElement("div");
    lottieWrap.className = "gan-lottie";
    mapWrap.appendChild(lottieWrap);

    function buildSubSection(key, heading, placeholders) {
        const items = groups[key] || [];

        const subWrap = document.createElement("div");
        subWrap.className = "gan-sub-section";

        const subHeading = document.createElement("p");
        subHeading.className = "gan-sub-heading";
        subHeading.textContent = heading;
        subWrap.appendChild(subHeading);

        const cardsWrap = document.createElement("div");
        cardsWrap.className = "gan-sub-cards";

        if (items.length > 0) {
            items.forEach(item => cardsWrap.appendChild(item));
        } else {
            placeholders.forEach(ph => {
                const [name, country] = ph.split("|");
                const card = document.createElement("div");
                card.className = "gan-location";
                const ap = document.createElement("p");
                ap.className = "gan-airport";
                ap.textContent = name;
                const co = document.createElement("p");
                co.className = "gan-country";
                co.textContent = country;
                card.appendChild(ap);
                card.appendChild(co);
                cardsWrap.appendChild(card);
            });
        }

        subWrap.appendChild(cardsWrap);
        return subWrap;
    }

    const indiaPanel = document.createElement("div");
    indiaPanel.className = "gan-locations";
    [
        { key: "india-airports", heading: "Airports", placeholders: [] },
        { key: "india-corporate-office", heading: "Corporate Office", placeholders: [] },
        { key: "india-energy", heading: "Energy", placeholders: [] },
        { key: "india-highways", heading: "Highways", placeholders: [] },
        { key: "india-specia-investigation", heading: "Special Investment Region", placeholders: [] },
    ].forEach(({ key, heading, placeholders }) => {
        indiaPanel.appendChild(buildSubSection(key, heading, placeholders));
    });

    const intlPanel = document.createElement("div");
    intlPanel.className = "gan-locations";
    [
        { key: "international-airport", heading: "Airports", placeholders: [] },
        { key: "international-office", heading: "Office", placeholders: [] },
    ].forEach(({ key, heading, placeholders }) => {
        intlPanel.appendChild(buildSubSection(key, heading, placeholders));
    });

    mapWrap.appendChild(indiaPanel);
    mapWrap.appendChild(intlPanel);

    rightCol.appendChild(mapWrap);

    row.appendChild(leftCol);
    row.appendChild(rightCol);
    container.appendChild(row);
    wrapper.appendChild(container);

    [mapImageRow, imageAltRow, lottiePathRow, indiaTabRow, intlTabRow, descEl].forEach(r => r?.remove());

    block.innerHTML = "";
    block.appendChild(wrapper);

    /* ================================
       5. Initialize Lottie
    ================================ */

    if (finalLottiePath && window.innerWidth >= 768) {
        const lottieObserver = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                lottieObserver.disconnect();
                if (window.bodymovin) {
                    window.bodymovin.loadAnimation({
                        container: lottieWrap,
                        renderer: "svg",
                        loop: true,
                        autoplay: true,
                        path: finalLottiePath,
                    });
                }
            }
        }, { threshold: 0, rootMargin: '200px' });

        lottieObserver.observe(block);
    }
}
