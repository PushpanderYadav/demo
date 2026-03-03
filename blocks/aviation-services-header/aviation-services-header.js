export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const headerTitleRow = rows[0];
  const dropdownLabelRow = rows[1];
  const itemRows = rows.slice(2); // aviation-service-item

  /* ================================
     2️⃣ Hide authored rows (DO NOT REMOVE)
     ================================ */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     3️⃣ Runtime wrapper (OUTSIDE UE structure)
     ================================ */
  const runtime = document.createElement("div");
  runtime.className = "aviation-tabs-runtime";

  runtime.innerHTML = `
    <section class="aviation-tabs-section">
      <div class="container">
        <ul class="aviation-tabs-list"></ul>
      </div>
    </section>
  `;

  block.after(runtime);

  const ul = runtime.querySelector(".aviation-tabs-list");

  /* ================================
     4️⃣ Build tabs (TEXT ONLY)
     ================================ */
  itemRows.forEach((row) => {
    const cells = [...row.children];

    const label = cells[0]?.textContent?.trim(); // Airport Name
    const link = cells[1]?.textContent?.trim();  // URL
    const isActive = cells[2]?.textContent?.trim() === "true";

    if (!label || !link) return;

    const li = document.createElement("li");
    if (isActive) li.classList.add("active");

    const a = document.createElement("a");
    a.href = link;
    a.textContent = label;

    li.appendChild(a);
    ul.appendChild(li);
  });
}
