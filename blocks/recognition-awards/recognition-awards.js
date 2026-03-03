export default function decorate(block) {
  const rows = [...block.children];

  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.innerHTML || "";

  const items = rows.slice(2).map(row => {
    const child = [...row.children];

    return {
      image: child[0]?.querySelector("img")?.src || "",
      desc: child[1]?.innerHTML || ""
    };
  });

  block.innerHTML = `
    <div class="awards-container">
      <div class="awards-header">
        <h2>${title}</h2>
        <div class="awards-description">${description}</div>
      </div>

      <div class="awards-list">
        ${items
          .map(
            item => `
          <div class="award-card">
            <div class="award-image">
              <img src="${item.image}" alt="" />
            </div>
            <div class="award-text">${item.desc}</div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}
