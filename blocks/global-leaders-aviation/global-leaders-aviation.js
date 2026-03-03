export default function decorate(block) {
  const rows = [...block.children];

  // Check minimum rows (title + description + footer)
  if (rows.length < 3) return;

  block.classList.add("global-leaders-aviation");

  /* ================================
     1️⃣ Read authored content
     ================================ */
  // First, check if first row contains a logo
  const hasLogo = rows[0].querySelector('img, picture, svg') ||
    rows[0].innerHTML.trim().includes('<img') ||
    rows[0].innerHTML.trim().includes('svg');

  let logoEl, titleEl, descEl, footerEl, itemRows;

  if (hasLogo) {
    // Structure with logo: logo, title, description, footer, stats
    if (rows.length < 4) return; // Need at least logo + title + desc + footer

    logoEl = rows[0];
    titleEl = rows[1];
    descEl = rows[2];
    footerEl = rows[3];
    itemRows = rows.slice(4);
  } else {
    // Structure without logo: title, description, footer, stats
    titleEl = rows[0];
    descEl = rows[1];
    footerEl = rows[2];
    itemRows = rows.slice(3);
    logoEl = null;
  }

  const logoHTML = logoEl ? logoEl.innerHTML.trim() : '';
  const titleHTML = titleEl.innerHTML.trim();
  const hasTitle = titleHTML.length > 0;
  const descHTML = descEl.innerHTML;
  const footerHTML = footerEl.innerHTML;
  const footerText = footerEl.textContent.trim();

  /* ================================
     2️⃣ Create wrapper
     ================================ */
  const wrapper = document.createElement("div");
  wrapper.className = "gla-wrapper spacer";

  /* ================================
   3️⃣ Add main content section (UE SAFE)
   ================================ */
  const mainContent = document.createElement("div");
  mainContent.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const leftCol = document.createElement("div");
  leftCol.className = "col-lg-4 col-md-5";

  if (logoEl) {
    logoEl.remove();
    logoEl.classList.add("service-logo", "mb-4");
    logoEl.removeAttribute("data-aue-label");
    //logoEl.setAttribute("data-aue-prop", "image");
    leftCol.appendChild(logoEl);
  }

  if (hasTitle) {
    titleEl.remove();
    titleEl.classList.add("sec-title");
    titleEl.removeAttribute("data-aue-label");
    //titleEl.setAttribute("data-aue-prop", "content");
    leftCol.appendChild(titleEl);
  }

  const rightCol = document.createElement("div");
  rightCol.className = "col-md-7 col-lg-8 fs-md";

  descEl.remove();
  descEl.removeAttribute("data-aue-label");
  //descEl.setAttribute("data-aue-prop", "description");
  rightCol.appendChild(descEl);

  row.appendChild(leftCol);
  row.appendChild(rightCol);
  mainContent.appendChild(row);
  wrapper.appendChild(mainContent);


  /* ================================
   4️⃣ Process stat items (UE FINAL FIX)
   ================================ */
  if (itemRows.length > 0) {
    const statsContainer = document.createElement("ul");
    statsContainer.className = "gla-stats pt-5 pb-4";
    statsContainer.setAttribute("data-aue-label", "Global Items");

    itemRows.forEach((itemRow) => {
      if (!itemRow || itemRow.children.length < 2) return;

      const [numberEl, textEl] = [...itemRow.children];

      // ✅ Remove from original position
      itemRow.remove();

      // ✅ Component wrapper ONLY (no label / prop)
      itemRow.className = "gla-stat";
      itemRow.setAttribute("data-aue-behavior", "component");

      // ✅ Leaf field: Stat Number
      numberEl.classList.add("gla-stat-number");
      numberEl.removeAttribute("data-aue-label");
      //numberEl.setAttribute("data-aue-prop", "title");

      // ✅ Leaf field: Stat Subtext
      textEl.classList.add("gla-stat-text");
      textEl.removeAttribute("data-aue-label");
      //textEl.setAttribute("data-aue-prop", "description");

      statsContainer.appendChild(itemRow);
    });

    wrapper.appendChild(statsContainer);
  }





  /* ================================
     5️⃣ Add footer if exists
     ================================ */
  if (footerText.length > 0) {
    const footerDiv = document.createElement("div");
    footerDiv.className = "gla-footer";
    footerDiv.innerHTML = footerHTML;
    footerDiv.removeAttribute("data-aue-label");
    //footerDiv.setAttribute("data-aue-prop", "footerTag");
    wrapper.appendChild(footerDiv);
  }

  /* ================================
     6️⃣ Replace block content (EXACTLY LIKE SAMPLE)
     ================================ */
  block.innerHTML = "";
  block.appendChild(wrapper);
}