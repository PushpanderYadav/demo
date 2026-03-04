export default function decorate(block) {
  if (block.classList.contains("factsheet-initialized")) return;

  const rows = [...block.children];

  const titleRow = rows.shift();
  const sectionTitle = titleRow?.textContent?.trim() || "";

  /* ===============================
     1️⃣ Build card data
  ================================ */
  const cards = rows.map((row) => {
    const [iconEl, titleEl, descEl, categoryEl] = [...row.children];

    const value = categoryEl?.textContent?.trim().toLowerCase() || "";

    return {
      icon: iconEl?.querySelector("img")?.src || "",
      title: titleEl?.textContent?.trim() || "",
      description: descEl?.innerHTML?.trim() || "",
      categoryValue: value
    };
  });

  /* ===============================
     2️⃣ Get unique category values
  ================================ */
  const categoryValues = [...new Set(cards.map(c => c.categoryValue))];

  /* ===============================
     3️⃣ Helper: Convert value → Label
  ================================ */
  function formatLabel(value) {
    return value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /* ===============================
     4️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "factsheet-runtime";

  runtime.innerHTML = `
    <div class="factsheet-header">
      <h2>${sectionTitle}</h2>
      <div class="factsheet-tabs"></div>
    </div>
    <div class="factsheet-grid"></div>
  `;

  block.append(runtime);
  block.classList.add("factsheet-initialized");

  const tabsContainer = runtime.querySelector(".factsheet-tabs");
  const grid = runtime.querySelector(".factsheet-grid");

  /* ===============================
     5️⃣ Create tabs
  ================================ */
  categoryValues.forEach(value => {
    const button = document.createElement("button");
    button.className = "factsheet-tab";
    button.dataset.category = value;
    button.textContent = formatLabel(value); // 👈 FIX HERE
    tabsContainer.append(button);
  });

  const tabs = [...runtime.querySelectorAll(".factsheet-tab")];

  /* ===============================
     6️⃣ Render cards
  ================================ */
  function render(category) {
    grid.innerHTML = "";

    cards
      .filter(card => card.categoryValue === category)
      .forEach(cardData => {
        const card = document.createElement("div");
        card.className = "factsheet-card";

        card.innerHTML = `
          ${cardData.icon ? `
            <div class="factsheet-icon">
              <img src="${cardData.icon}" alt="">
            </div>
          ` : ""}
          <h4>${cardData.title}</h4>
          <p>${cardData.description}</p>
        `;

        grid.append(card);
      });
  }

  /* ===============================
     7️⃣ Tab click
  ================================ */
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.category);
    });
  });

  /* ===============================
     8️⃣ Default active
  ================================ */
  if (tabs.length) {
    tabs[0].classList.add("active");
    render(tabs[0].dataset.category);
  }
}