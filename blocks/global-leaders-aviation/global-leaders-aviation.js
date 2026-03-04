export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  block.classList.add("global-leaders-aviation");

  /* ================================
     1️⃣ Identify fields safely
     ================================ */
  let imageRow = null;
  let imageAltRow = null;
  let titleEl = null;
  let descEl = null;
  let footerEl = null;
  const itemRows = [];

  rows.forEach((row) => {
    if (!imageRow && row.querySelector("img, picture, svg")) {
      imageRow = row;
      return;
    }

    if (!imageAltRow && row.dataset?.aueLabel === "Alt Text") {
      imageAltRow = row;
      return;
    }

    if (!titleEl && row.querySelector("h1, h2, h3")) {
      titleEl = row;
      return;
    }

    if (!descEl && row.querySelector("p")) {
      descEl = row;
      return;
    }

    if (!footerEl && row.textContent.trim()) {
      footerEl = row;
      return;
    }

    itemRows.push(row);
  });

  const sectionTitle =
    titleEl?.textContent?.trim() || "Global Leaders in Aviation Infrastructure";

  const imageAlt = imageAltRow?.textContent?.trim() || sectionTitle;

  /* ================================
     2️⃣ Wrapper
     ================================ */
  const wrapper = document.createElement("div");
  wrapper.className = "gla-wrapper spacer";

  /* ================================
     3️⃣ Main content layout
     ================================ */
  if (imageRow || titleEl || descEl) {
    const container = document.createElement("div");
    container.className = "container";

    const row = document.createElement("div");
    row.className = "row align-items-center";

    /* LEFT COLUMN → IMAGE + TITLE */
    if (imageRow || titleEl) {
      const leftCol = document.createElement("div");
      leftCol.className = "col-md-5";

      if (imageRow) {
        imageRow.remove();
        imageRow.classList.add("service-logo", "mb-4");
        imageRow.removeAttribute("data-aue-label");

        applyAltText(imageRow, imageAlt);
        leftCol.appendChild(imageRow);
      }

      if (titleEl) {
        titleEl.remove();
        titleEl.classList.add("sec-title");
        titleEl.removeAttribute("data-aue-label");
        leftCol.appendChild(titleEl);
      }

      row.appendChild(leftCol);
    }

    /* RIGHT COLUMN → DESCRIPTION */
    if (descEl) {
      const rightCol = document.createElement("div");
      rightCol.className = "col-md-7 fs-md";

      descEl.remove();
      descEl.removeAttribute("data-aue-label");
      rightCol.appendChild(descEl);

      row.appendChild(rightCol);
    }

    container.appendChild(row);
    wrapper.appendChild(container);
  }

  /* ================================
     4️⃣ Stats (STRICT FILTER)
     ================================ */
  const validStats = itemRows.filter((row) => {
    if (!row || row.children.length < 2) return false;
    const [num, txt] = row.children;
    return num.textContent.trim() && txt.textContent.trim();
  });

  if (validStats.length) {
    const statsContainer = document.createElement("ul");
    statsContainer.className = "gla-stats pt-5 pb-4";
    statsContainer.setAttribute("data-aue-label", "Global Items");

    validStats.forEach((row) => {
      const [num, txt] = row.children;

      row.remove();
      row.className = "gla-stat";
      row.setAttribute("data-aue-behavior", "component");

      num.classList.add("gla-stat-number");
      num.removeAttribute("data-aue-label");

      txt.classList.add("gla-stat-text");
      txt.removeAttribute("data-aue-label");

      statsContainer.appendChild(row);
    });

    wrapper.appendChild(statsContainer);
  }

  /* ================================
     5️⃣ Footer
     ================================ */
  if (footerEl?.textContent?.trim()) {
    const footerDiv = document.createElement("div");
    footerDiv.className = "gla-footer";
    footerDiv.innerHTML = footerEl.innerHTML;
    footerDiv.removeAttribute("data-aue-label");
    wrapper.appendChild(footerDiv);
  }

  /* ================================
     6️⃣ Replace block
     ================================ */
  block.innerHTML = "";
  block.appendChild(wrapper);

  /* ================================
     7️⃣ Alt helper (condition-based)
     ================================ */
  function applyAltText(containerEl, altText) {
    if (!containerEl) return;

    containerEl.querySelectorAll("img").forEach((img) => {
      // ✅ Do NOT overwrite DAM-authored alt
      if (!img.hasAttribute("alt") || img.alt.trim() === "") {
        img.alt = altText;
      }
    });
  }
}
