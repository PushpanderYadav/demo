export default async function decorate(block) {
  const title = block.dataset.sectiontitle || 'News';
  const limit = block.dataset.itemstoshow || 5;

  block.innerHTML = `<h2>${title}</h2><p>Loading...</p>`;

  try {
    const res = await fetch(`/functions/news`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      block.innerHTML = `<h2>${title}</h2><p>No news available</p>`;
      return;
    }

    const container = document.createElement('div');
    container.className = 'news-container';

    data.items.slice(0, limit).forEach((item) => {
      const article = document.createElement('article');
      article.className = 'news-card';

      article.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <span>${item.category}</span>
      `;

      container.appendChild(article);
    });

    block.innerHTML = `<h2>${title}</h2>`;
    block.appendChild(container);
  } catch (e) {
    block.innerHTML = `<h2>${title}</h2><p>Error loading news</p>`;
  }
}
