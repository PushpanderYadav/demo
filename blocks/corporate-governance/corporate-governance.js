export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add("corporate-governance");

  /* ===============================
     Outer structure
  =============================== */
  const outer = document.createElement("div");
  outer.className = "sec-corporate-governance spacer";

  const container = document.createElement("div");
  container.className = "container";

  /* ===============================
     Header Section
  =============================== */
  const header = document.createElement("div");
  header.className = "cg-header";

  const introRow = rows.shift();
  if (introRow) {
    introRow.classList.add("cg-intro");
    header.append(introRow);
  }

  const subtitleRow = rows.shift();
  let headerTitleText = "";
  if (subtitleRow) {
    const p = subtitleRow.querySelector("p");
    if (p) {
      headerTitleText = p.textContent.trim();
      const h3 = document.createElement("h3");
      h3.className = "cg-subtitle";
      h3.innerHTML = p.innerHTML;
      p.replaceWith(h3);
    }
    header.append(subtitleRow);
  }

  const imageRow = rows.shift();
  const headerAltRow = rows.shift(); // Alt Text field (optional)

  if (imageRow && imageRow.querySelector("img")) {
    const img = imageRow.querySelector("img");

    const explicitAlt = headerAltRow?.textContent?.trim();
    const finalAlt = explicitAlt || headerTitleText;

    if (finalAlt) {
      img.alt = finalAlt;
    }

    imageRow.classList.add("cg-hero-image");
    header.append(imageRow);
  }

  headerAltRow?.remove();
  container.append(header);

  /* ===============================
     Governance Sections
  =============================== */
  const sectionsWrap = document.createElement("div");
  sectionsWrap.className = "cg-sections";

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    row.classList.add("cg-section");

    /* ---- Color Theme ---- */
    const themeCell = cells.shift();
    const theme = themeCell?.textContent?.trim().toLowerCase() || "red";
    row.classList.add(`theme-${theme}`);
    themeCell?.remove();

    /* ---- Image ---- */
    const imageCell = cells.shift();
    const imageAltCell = cells.shift(); // Alt Text field (optional)

    let sectionImage;
    if (imageCell && imageCell.querySelector("img")) {
      sectionImage = imageCell.querySelector("img");
      imageCell.classList.add("cg-cube");
      row.append(imageCell);
    }

    /* ---- Content ---- */
    const content = document.createElement("div");
    content.className = "cg-content";

    /* ---- Title ---- */
    let sectionTitleText = "";
    const titleCell = cells.shift();
    if (titleCell) {
      const p = titleCell.querySelector("p");
      if (p) {
        sectionTitleText = p.textContent.trim();
        const h4 = document.createElement("h4");
        h4.className = "cg-title";
        h4.innerHTML = p.innerHTML;
        p.replaceWith(h4);
      }
      content.append(titleCell);
    }

    /* ---- Apply image alt (NO hierarchy change) ---- */
    if (sectionImage) {
      const explicitAlt = imageAltCell?.textContent?.trim();
      const finalAlt = explicitAlt || sectionTitleText;

      if (finalAlt) {
        sectionImage.alt = finalAlt;
      }
    }

    imageAltCell?.remove();

    /* ---- Bullet Points ---- */
    const list = document.createElement("ul");
    list.className = "cg-points";

    cells.forEach((cell) => {
      const text = cell.textContent?.trim();
      if (text) {
        const li = document.createElement("li");
        li.textContent = text;
        list.append(li);
      }
      cell.remove();
    });

    if (list.children.length) content.append(list);

    row.append(content);
    sectionsWrap.append(row);
  });

  container.append(sectionsWrap);
  outer.append(container);
  block.append(outer);
}
