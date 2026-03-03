export default function decorate(block) {
  const rows = [...block.children];

  // Wrapper for rendered UI
  const navWrapper = document.createElement('div');
  navWrapper.className = 'page-tabs-wrapper';

  const ul = document.createElement('ul');
  ul.className = 'page-tabs';

  rows.forEach((row) => {
    const [titleEl, routeEl] = row.children;
    if (!titleEl || !routeEl) return;

    const title = titleEl.textContent.trim();
    const route = routeEl.textContent.trim();

    const li = document.createElement('li');
    li.className = 'page-tab';

    const a = document.createElement('a');
    a.textContent = title;
    a.href = route;

    // REQUIRED for Universal Editor navigation
    a.setAttribute('data-aue-link', 'true');

    li.appendChild(a);
    ul.appendChild(li);
  });

  navWrapper.appendChild(ul);

  // IMPORTANT: Do NOT remove rows
  rows.forEach((row) => {
    row.style.display = 'none'; // hide authoring rows
  });

  // Insert rendered UI ABOVE authoring rows
  block.prepend(navWrapper);

  // Active tab logic (UE-safe)
  requestAnimationFrame(() => {
    const currentPath = window.location.pathname.replace(/\/$/, '');    

    ul.querySelectorAll('a').forEach((link) => {
      const linkPath = link.getAttribute('href')?.replace(/\/$/, '');
      if (linkPath && currentPath.endsWith(linkPath)) {
        link.parentElement.classList.add('active');
      }
    });
  });
}
