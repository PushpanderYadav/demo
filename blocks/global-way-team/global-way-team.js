export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add("global-way-team");

  let titleRow;
  let descRow;
  let ctaLabelRow;
  let ctaLinkRow;
  let footerRow;

  const iconPairs = [];
  const statRows = [];

  /* ================================
     1️⃣ Identify fields safely
  ================================= */

  let pendingIcon = null;

  rows.forEach((row) => {
    const text = row.textContent.trim();
    const hasImage = row.querySelector("img, picture, svg");
    const hasHeading = row.querySelector("h1,h2,h3");
    const hasLink = row.querySelector("a");

    // ignore empty rows
    if (!text && !hasImage) return;

    // TITLE
    if (!titleRow && hasHeading) {
      titleRow = row;
      return;
    }

    // DESCRIPTION
    if (!descRow && row.querySelector("p") && !hasLink && !hasImage) {
      descRow = row;
      return;
    }

    // CTA LABEL
    if (!ctaLabelRow && row.querySelector("p") && !hasLink && !hasImage) {
      ctaLabelRow = row;
      return;
    }

    // CTA LINK
    if (!ctaLinkRow && hasLink) {
      ctaLinkRow = row;
      return;
    }

    // FOOTER TAG (FY text)
    if (!footerRow && text.match(/FY/i)) {
      footerRow = row;
      return;
    }

    // ICON IMAGE
    if (hasImage) {
      pendingIcon = row;
      return;
    }

    // ICON LABEL (comes right after image)
    if (pendingIcon && row.querySelector("p")) {
      iconPairs.push({
        image: pendingIcon,
        label: row,
      });
      pendingIcon = null;
      return;
    }

    // STATS (2 column rows)
    if (row.children.length === 2) {
      statRows.push(row);
    }
  });

  /* ================================
     2️⃣ Build layout
  ================================= */

  const wrapper = document.createElement("div");
  wrapper.className = " spacer";

  const container = document.createElement("div");
  container.className = "container";

  /* ===== TOP SECTION ===== */

  const top = document.createElement("div");
  top.className = "gwt-top";

  /* ===== LEFT CONTENT ===== */

  const content = document.createElement("div");
  content.className = "gwt-content";

  if (titleRow) {
    titleRow.remove();
    titleRow.className = "sec-title";
    content.appendChild(titleRow);
  }

  if (descRow) {
    descRow.remove();
    descRow.className = "gwt-description fs-md";
    content.appendChild(descRow);
  }

  /* ===== CTA BUTTON ===== */

  if (ctaLabelRow && ctaLinkRow) {
    const label = ctaLabelRow.textContent.trim();
    const link = ctaLinkRow.querySelector("a")?.getAttribute("href") || "#";

    const btn = document.createElement("a");
    btn.className = "btn btn-primary";
    btn.href = link;
    btn.textContent = label;

    content.appendChild(btn);

    ctaLabelRow.remove();
    ctaLinkRow.remove();
  }

  top.appendChild(content);

  /* ===== ICON GRID ===== */

  if (iconPairs.length) {
    const iconGrid = document.createElement("div");
    iconGrid.className = "gwt-icons";

    iconPairs.forEach(({ image, label }) => {
      const item = document.createElement("div");
      item.className = "gwt-icon-item";

      image.remove();
      label.remove();

      image.className = "gwt-icon-img";
      label.className = "gwt-icon-title";

      /* ✅ set image alt from icon title */
      const iconTitleText = label.textContent.trim();

      image.querySelectorAll("img").forEach((img) => {
        if (!img.hasAttribute("alt") || img.alt.trim() === "") {
          img.alt = iconTitleText;
        }
      });

      item.append(image, label);
      iconGrid.appendChild(item);
    });

    top.appendChild(iconGrid);
  }

  container.appendChild(top);

  /* ===== STATS ===== */

  if (statRows.length) {
    const stats = document.createElement("ul");
    stats.className = "gwt-stats";

    statRows.forEach((row) => {
      const [num, txt] = row.children;

      row.remove();
      row.className = "gwt-stat";

      num.className = "gwt-stat-number";
      txt.className = "gwt-stat-text";

      stats.appendChild(row);
    });

    container.appendChild(stats);
  }

  /* ===== FOOTER ===== */

  if (footerRow) {
    const footer = document.createElement("div");
    footer.className = "gwt-footer";
    footer.textContent = footerRow.textContent.trim();

    footerRow.remove();
    container.appendChild(footer);
  }

  wrapper.appendChild(container);

  block.innerHTML = "";
  block.appendChild(wrapper);
}