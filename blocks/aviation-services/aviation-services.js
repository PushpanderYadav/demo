export default async function decorate(block) {
  const fragmentRow = block.querySelector(':scope > div > div');
  const fragmentPath = fragmentRow?.textContent.trim();

  if (fragmentPath && fragmentPath.startsWith('/content/dam')) {
    // Fetch the Content Fragment data
    const response = await fetch(`${fragmentPath}.model.json`);

    if (response.ok) {
      const data = await response.json();
      block.innerHTML = '';

      const grid = document.createElement('div');
      grid.className = 'aviation-services-grid';

      // Map the items from your CF Model
      // Replace item.title, item.image, etc., with your actual CF field names
      data.items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
          <div class="card-image">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="card-content">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <a href="${item.link}" class="read-more">READ MORE ❯</a>
          </div>
        `;
        grid.append(card);
      });
      block.append(grid);
    }
  }
}