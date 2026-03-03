export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  block.classList.add("global-airport-network");

  /* ================================
     1️⃣ Read authored content
     ================================ */

  let titleEl = rows[0];
  let descEl = rows[1];
  const itemRows = rows.slice(2);

  const titleText = titleEl.textContent.trim();
  const hasTitle = titleText.length > 0;

  /* ================================
     2️⃣ Create wrapper
     ================================ */

  const wrapper = document.createElement("div");
  wrapper.className = "gan-wrapper spacer";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row align-items-center";

  const leftCol = document.createElement("div");
  leftCol.className = "col-lg-4 col-md-5";

  // Section Title (H2 only)
  if (hasTitle) {
    titleEl.remove();
    const h2 = document.createElement("h2");
    h2.className = "sec-title mb-4";
    h2.textContent = titleText;
    leftCol.appendChild(h2);
  }

  // Description
  descEl.remove();
  descEl.classList.add("sec-desc");
  descEl.removeAttribute("data-aue-label");
  leftCol.appendChild(descEl);

  const rightCol = document.createElement("div");
  rightCol.className = "col-lg-8 col-md-7";

  const mapWrap = document.createElement("div");
  mapWrap.className = "gan-map-wrap";

  // ✅ Lottie Animation (desktop) - working JSON
  const lottieWrap = document.createElement("div");
  lottieWrap.className = "gan-lottie";
  lottieWrap.dataset.lottie =
    "https://cdn.prod.website-files.com/6853ad13a6c94e060a70ac45/6953c9f3aafa31dfbbb24b96_mapanimation5.json"; // public working JSON

  // Locations (mobile)
  const locationsWrap = document.createElement("div");
  locationsWrap.className = "gan-locations";
  locationsWrap.setAttribute("data-aue-label", "Airport Locations");

  mapWrap.appendChild(lottieWrap);
  mapWrap.appendChild(locationsWrap);
  rightCol.appendChild(mapWrap);

  row.appendChild(leftCol);
  row.appendChild(rightCol);
  container.appendChild(row);
  wrapper.appendChild(container);

  /* ================================
     4️⃣ Process location items
     ================================ */

  itemRows.forEach((itemRow) => {
    if (!itemRow || itemRow.children.length !== 3) return;

    const [airportEl, countryEl, flagEl] = [...itemRow.children];

    itemRow.remove();
    itemRow.className = "gan-location";
    itemRow.setAttribute("data-aue-behavior", "component");

    airportEl.classList.add("gan-airport");
    airportEl.removeAttribute("data-aue-label");

    countryEl.classList.add("gan-country");
    countryEl.removeAttribute("data-aue-label");

    flagEl.classList.add("gan-flag");
    flagEl.removeAttribute("data-aue-label");

    locationsWrap.appendChild(itemRow);
  });

  /* ================================
     5️⃣ Replace block content
     ================================ */

  block.innerHTML = "";
  block.appendChild(wrapper);

  /* ================================
     6️⃣ Initialize Lottie
     ================================ */

  if (window.lottie && window.innerWidth >= 768) {
    lottie.loadAnimation({
      container: lottieWrap,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: lottieWrap.dataset.lottie,
    });
  }
};
