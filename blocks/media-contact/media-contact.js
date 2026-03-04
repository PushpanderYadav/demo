export default function decorate(block) {
  const items = [...block.children];

  const cards = items.map((item) => {
    const cols = [...item.children];
    const heading = cols[0]?.textContent.trim();
    const content = cols[1]?.innerHTML.trim();

    return `
      <div class="media-card">
        <h3>${heading || ""}</h3>
        <div class="media-card-content">
          ${content || ""}
        </div>
      </div>
    `;
  }).join("");

  block.innerHTML = `
    <div class="media-contact-wrapper">
      <div class="media-contact-cards">
        ${cards}
      </div>
    </div>
  `;
}
