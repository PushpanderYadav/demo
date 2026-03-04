import { moveInstrumentation } from "../../scripts/scripts.js";

/**
 * Business Tabs Decorator
 * Captures subsequent blocks in the same section and places them into tabs.
 */
export default async function decorate(block) {
    const rows = [...block.children];

    // Metadata (Title, Description, Tab1, Tab2, Tab3)
    const [titleRow, descriptionRow, t1Row, t2Row, t3Row] = rows;

    const titleText = titleRow?.textContent?.trim() || "";
    const descriptionHTML = descriptionRow?.children[0]?.innerHTML || descriptionRow?.innerHTML || "";
    const tabBtnLabels = [
        t1Row?.textContent?.trim(),
        t2Row?.textContent?.trim(),
        t3Row?.textContent?.trim(),
    ].filter(Boolean);

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "business-tabs-container container";

    // 1. Intro Section
    const intro = document.createElement("div");
    intro.className = "business-tabs-intro text-center mb-5";

    if (titleText && titleText !== "Select an option...") {
        const h2 = document.createElement("h2");
        h2.className = "business-tabs-title";
        h2.textContent = titleText;
        moveInstrumentation(titleRow, h2);
        intro.append(h2);
    }

    if (descriptionHTML && descriptionHTML !== "<div></div>") {
        const desc = document.createElement("div");
        desc.className = "business-tabs-description";
        desc.innerHTML = descriptionHTML;
        moveInstrumentation(descriptionRow, desc);
        intro.append(desc);
    }
    container.append(intro);

    // 2. Tabs Navigation
    const tabsNav = document.createElement("div");
    tabsNav.className = "business-tabs-nav d-flex justify-content-center mb-5 gap-3 tab-buttons-wrap";

    tabBtnLabels.forEach((label, i) => {
        const btn = document.createElement("button");
        btn.className = `btn business-tabs-btn ${i === 0 ? "active" : ""}`;
        btn.textContent = label;
        btn.dataset.tabId = i;

        const labelMetadataRow = [t1Row, t2Row, t3Row][i];
        if (labelMetadataRow) moveInstrumentation(labelMetadataRow, btn);

        tabsNav.append(btn);
    });
    container.append(tabsNav);

    // 3. Panels Container
    const panelsContainer = document.createElement("div");
    panelsContainer.className = "business-tabs-panels";
    container.append(panelsContainer);

    block.append(container);

    // 4. Capture Siblings
    setTimeout(() => {
        const wrapper = block.parentElement;
        if (!wrapper || !wrapper.classList.contains('business-tabs-wrapper')) return;

        const section = wrapper.parentElement;
        if (!section) return;

        const sectionSiblings = [...section.children];
        const startIndex = sectionSiblings.indexOf(wrapper);
        const followingSiblings = sectionSiblings.slice(startIndex + 1);

        tabBtnLabels.forEach((label, i) => {
            const panel = document.createElement("div");
            panel.className = `business-tabs-panel ${i === 0 ? "active" : ""}`;
            panel.id = `business-tab-panel-${i}`;

            const sibling = followingSiblings[i];
            if (sibling) {
                panel.append(sibling);
            } else {
                panel.innerHTML = `<div class="placeholder-content">Please add a block as component ${i + 1} after this Business Tabs block.</div>`;
            }
            panelsContainer.append(panel);
        });
    }, 0);

    // 5. Tab Mechanics
    tabsNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".business-tabs-btn");
        if (!btn) return;

        const targetId = btn.dataset.tabId;
        const btns = tabsNav.querySelectorAll(".business-tabs-btn");
        const panels = panelsContainer.querySelectorAll(".business-tabs-panel");

        btns.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        const targetPanel = panelsContainer.querySelector(`#business-tab-panel-${targetId}`);
        if (targetPanel) targetPanel.classList.add("active");
    });
}
