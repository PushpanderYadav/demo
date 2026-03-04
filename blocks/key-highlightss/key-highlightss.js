export default function decorate(block) {
  const [titleEl, descEl, ...items] = [...block.children];

  block.classList.add("key-highlights");

  /* ================================
     Section Wrapper
  ================================ */
  const section = document.createElement("div");
  section.className = "sec-key spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "key-highlights-wrapper container";

  /* ================================
     Header Section
  ================================ */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const header = document.createElement("div");
  header.className = "col-md-7 text-center mx-auto mb-5";

  const sectionTitle = titleEl?.textContent?.trim() || "";
  const sectionDesc = descEl?.innerHTML?.trim() || "";

  if (sectionTitle || sectionDesc) {
    header.innerHTML = `
      ${sectionTitle ? `<h2 class="sec-title">${sectionTitle}</h2>` : ""}
      ${sectionDesc ? `<div class="sec-desc">${sectionDesc}</div>` : ""}
    `;
  }

  headerRow.append(header);
  wrapper.append(headerRow);

  /* ================================
     Cards Grid
  ================================ */
  const grid = document.createElement("div");
  grid.className = "key-row row g-4 justify-content-center";

  items.forEach((item) => {
    if (!item || !item.children.length) return;

    /*
      Expected AEM field order:
      0 → image
      1 → alt text (optional)
      2 → title
      3 → description
      4 → button label (NEW)
      5 → button url (NEW)
    */
    const [
      imgCell,
      altCell,
      titleCell,
      descCell,
      labelCell,
      urlCell,
    ] = [...item.children];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const cardTitle = titleCell?.textContent?.trim() || "";
    const cardDesc = descCell?.innerHTML?.trim() || "";

    /* ================================
       NEW BUTTON FIELDS
    ================================ */
    const btnLabel = labelCell?.textContent?.trim() || "";
    const btnUrl = urlCell?.textContent?.trim() || "";

    /* ================================
       Image Alt Fallback
    ================================ */
    const finalAlt = authoredAlt || cardTitle || "";

    item.className = "key-col col-md-6 col-lg-4 mt-4";

    /* ================================
       Image Processing (accessibility safe)
    ================================ */
    let imgHtml = imgCell?.innerHTML?.trim() || "";

    if (imgHtml) {
      const temp = document.createElement("div");
      temp.innerHTML = imgHtml;

      const img = temp.querySelector("img");

      if (img) {
        img.setAttribute("alt", finalAlt);
        imgHtml = temp.innerHTML;
      }
    }

    /* ================================
       Card Markup
    ================================ */
    item.innerHTML = `
      <div class="card card-ui-three h-100">

        ${imgHtml ? `<div class="card-img">${imgHtml}</div>` : ""}

        <div class="card-body d-flex flex-column">

          ${cardTitle ? `<h3>${cardTitle}</h3>` : ""}

          ${cardDesc || ""}

          ${
            btnLabel && btnUrl
              ? `
                <div class="pt-3">
                  <a href="${btnUrl}"
                     class="btn-link"
                     aria-label="${btnLabel}">
                    ${btnLabel}
                  </a>
                </div>
              `
              : ""
          }

        </div>
      </div>
    `;
  });

  grid.append(...items);
  wrapper.append(grid);

  block.innerHTML = "";
  section.append(wrapper);
  block.append(section);
}