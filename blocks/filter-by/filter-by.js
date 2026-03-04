import { setSharedData } from '../../scripts/shared-filter.js';

export default function decorate(block) {
  const readMulti = (index) => {
    const col = block.children[index];
    if (!col) return [];

    return [...col.children]
      .flatMap(el =>
        el.textContent
          .split(',')
          .map(v => v.trim())
      )
      .filter(Boolean);
  };

  const data = {
    years: readMulti(0),
    months: readMulti(1),
    tags: readMulti(2),
    subCategories: readMulti(3),
  };

  block.innerHTML = '';

  setSharedData('pressFilters', data);

  window.dispatchEvent(
    new CustomEvent('press-filters-ready', { detail: data })
  );
}

