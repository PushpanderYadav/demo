export default function decorate(block) {
  if (block.classList.contains("media-contact-header-initialized")) return;
  block.classList.add("media-contact-header-initialized");
 
  const children = [...block.children];
 
  if (children.length < 2) return;
 
  const headingRow = children[0];
  const descRow = children[1];
 
  const heading =
    headingRow?.querySelector('[data-aue-prop="heading"]')?.textContent?.trim() ||
    headingRow?.textContent?.trim() ||
    "";
 
  const description =
    descRow?.querySelector('[data-aue-prop="description"]')?.innerHTML ||
    descRow?.innerHTML ||
    "";
 

  const items = children.slice(2); // after heading + description
 
  const runtime = document.createElement("div");
  runtime.className = "media-contact-runtime";
 
  runtime.innerHTML = `
    <div class="media-contact-container">
      <div class="media-contact-box">
        <div class="media-contact-top">
          <h2 class="media-contact-title">${heading}</h2>
          <div class="media-contact-desc">${description}</div>
        </div>
 
        <div class="media-contact-cards"></div>
      </div>
    </div>
  `;
 
  const cardsContainer = runtime.querySelector(".media-contact-cards");
 

  items.forEach((item) => {
    const itemHeading =
      item.querySelector('[data-aue-prop="heading"]')?.textContent?.trim() ||
      item.children?.[0]?.textContent?.trim() ||
      "";
 
    const itemContent =
      item.querySelector('[data-aue-prop="content"]')?.innerHTML ||
      item.children?.[1]?.innerHTML ||
      "";
 
    if (!itemHeading && !itemContent) return;
 
    const card = document.createElement("div");
    card.className = "media-contact-card";
 
    card.innerHTML = `
      <h3>${itemHeading}</h3>
      <div class="media-contact-card-content">
        ${itemContent}
      </div>
    `;
 
    cardsContainer.appendChild(card);
  });
 
  block.append(runtime);
}