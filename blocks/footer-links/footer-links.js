export default function decorate(block) {
  /* =====================================================
     1️⃣  Capture authored rows — DO NOT MODIFY THEM
     ===================================================== */
  const authoredRows = [...block.children];

  // Main runtime wrapper — where real UI will render
  const ui = document.createElement("div");
  ui.className = "footer-ui";

  block.appendChild(ui);

  /* =====================================================
     2️⃣ Build visual structure WITHOUT touching authored content
     ===================================================== */
  const container = document.createElement("div");
  container.className = "container";

  const rowWrapper = document.createElement("div");
  rowWrapper.className = "row";

  container.appendChild(rowWrapper);
  ui.appendChild(container);

  /* =====================================================
     3️⃣ Render each authored row into UI (clone only)
     ===================================================== */
  authoredRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const titleCell = cells[0].cloneNode(true);
    const listCell = cells[1].cloneNode(true);

    const col = document.createElement("div");
    col.className = "w-20";

    const nav = document.createElement("div");
    nav.className = "footer-nav";

    nav.appendChild(titleCell);
    nav.appendChild(listCell);
    col.appendChild(nav);
    rowWrapper.appendChild(col);
  });

  /* =====================================================
     4️⃣  Accordion Behavior (safe UI-only logic)
     ===================================================== */
  const titles = ui.querySelectorAll(".footer-nav h4");

  titles.forEach((title) => {
    const list = title.nextElementSibling;

    if (!list || list.tagName !== "UL") return;

    list.style.overflow = "hidden";

    // collapsed by default
    if (!list.classList.contains("active")) {
      list.style.maxHeight = "0px";
    }

    title.addEventListener("click", () => {
      const isOpen = list.classList.contains("active");

      // Close all lists & remove active class
      ui.querySelectorAll(".footer-nav ul").forEach((ul) => {
        ul.classList.remove("active");
        ul.style.maxHeight = "0px";
      });
      ui.querySelectorAll(".footer-nav h4").forEach((h) => {
        h.classList.remove("active");
      });

      // Open clicked item
      if (!isOpen) {
        list.classList.add("active");
        list.style.maxHeight = `${list.scrollHeight}px`;
        title.classList.add("active");
      }
    });

    title.style.cursor = "pointer";
  });

  /* =====================================================
     5️⃣  Hide original authored HTML (AEM UI-safe mode)
     ===================================================== */
  block.querySelectorAll(":scope > *:not(.footer-ui)").forEach((el) => {
    el.style.display = "none";
  });
}
