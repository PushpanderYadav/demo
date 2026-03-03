export default function decorate(block) {
  // Destructure first two children as header content
  const [titleEl, descEl, ...items] = [...block.children];

  block.classList.add("key-highlights");

  /* ---------- Wrapper ---------- */
  const section = document.createElement("div");
  section.className = "sec-key spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "key-highlights-wrapper container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const header = document.createElement("div");
  header.className = "col-md-7 text-center mx-auto mb-5";

  const title = titleEl ? titleEl.textContent.trim() : "";
  const description = descEl ? descEl.innerHTML.trim() : "";

  if (title || description) {
    header.innerHTML = `
      ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
      ${description ? `<div class="sec-desc">${description}</div>` : ""}
    `;
  }

  headerRow.append(header);
  wrapper.append(headerRow);

  /* ---------- Grid ---------- */
  const grid = document.createElement("div");
  grid.className = "key-row row g-4 justify-content-center";

  items.forEach((item) => {
    if (!item || !item.children.length) return;

    const [imgEl, titleEl, descEl] = [...item.children];

    const imgContent = imgEl ? imgEl.innerHTML.trim() : "";
    const cardTitle = titleEl ? titleEl.textContent.trim() : "";
    const cardDesc = descEl ? descEl.innerHTML.trim() : "";

    // IMPORTANT: class applied on grid child itself
    item.className = "key-col col-md-4";

    item.innerHTML = `
    <div class="card card-ui-three">
      ${imgContent ? `<div class="card-img">${imgContent}</div>` : ""}
      <div class="card-body">
      ${cardTitle ? `<h3>${cardTitle}</h3>` : ""}
      ${cardDesc || ""}
      </div>
    </div>`;
  });

  grid.append(...items);
  wrapper.append(grid);

  /* ---------- Replace block content ---------- */
  block.innerHTML = "";
  section.append(wrapper);
  block.append(section);
}
