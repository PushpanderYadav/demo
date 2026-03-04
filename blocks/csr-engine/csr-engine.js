export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 6) return;

  /*
  Expected structure (based on your HTML):
  0 → logo image
  1 → title
  2 → subtitle (optional / duplicate title)
  3 → description
  4 → main image
  5 → right description
  6+ → items (csr-engine-item components)
  */

  const logo = rows[0]?.querySelector('picture');
  const title = rows[1]?.textContent?.trim();
  const subtitle = rows[2]?.textContent?.trim();
  const description = rows[3]?.innerHTML;
  const mainImage = rows[4]?.querySelector('picture');
  const rightDescription = rows[5]?.innerHTML;

  const itemRows = rows.slice(6);

  /* ================= Create a hidden editor structure ================= */
  // This will hold the component structure for the Universal Editor
  const editorStructure = document.createElement('div');
  editorStructure.className = 'csr-editor-structure';
  editorStructure.setAttribute('aria-hidden', 'true');
  editorStructure.style.display = 'none';
  
  // Move original rows to editor structure
  rows.forEach((row) => {
    editorStructure.appendChild(row.cloneNode(true));
  });
  
  block.appendChild(editorStructure);

  /* ================= Clear block for rendering ================= */
  // Remove all original children except our editor structure
  while (block.children.length > 1) {
    block.removeChild(block.firstChild);
  }

  /* ================= Create wrapper structure ================= */
  // First wrapper: csr_engine + container
  const engineWrapper = document.createElement('div');
  engineWrapper.className = 'csr_engine spacer';
  
  // Second wrapper: spacer
  const spacerWrapper = document.createElement('div');
  spacerWrapper.className = 'container';
  
  // Add spacer to engine wrapper
  engineWrapper.appendChild(spacerWrapper);

  /* ================= Header ================= */
  const header = document.createElement('div');
  header.className = 'csr-header';

  if (logo) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'csr-logo';
    logoWrap.append(logo);
    header.append(logoWrap);
  }

  if (title) {
    const h2 = document.createElement('h2');
    h2.className = 'csr-title';
    h2.textContent = title;
    header.append(h2);
  }

  if (description) {
    const desc = document.createElement('div');
    desc.className = 'csr-description';
    desc.innerHTML = description;
    header.append(desc);
  }

  /* ================= Layout ================= */
  const content = document.createElement('div');
  content.className = 'csr-content';

  /* ---- Left Image ---- */
  const left = document.createElement('div');
  left.className = 'csr-left';
  if (mainImage) left.append(mainImage);

  /* ---- Right Side ---- */
  const right = document.createElement('div');
  right.className = 'csr-right';

  if (rightDescription) {
    const rdesc = document.createElement('div');
    rdesc.className = 'csr-main-description';
    rdesc.innerHTML = rightDescription;
    right.append(rdesc);
  }

  /* ================= Items ================= */
  if (itemRows.length) {
    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'csr-items';

    itemRows.forEach((row) => {
      const cols = [...row.children];

      const icon = cols[0]?.querySelector('picture');
      const itemTitle = cols[1]?.textContent?.trim();
      const itemDesc = cols[2]?.innerHTML;

      const item = document.createElement('div');
      item.className = 'csr-item';
      
      // Add class for styling but NOT for component identification
      // This prevents the editor from seeing it as a separate component

      if (icon) {
        const iconWrap = document.createElement('div');
        iconWrap.className = 'csr-icon mb-3';
        iconWrap.append(icon);
        item.append(iconWrap);
      }

      const textWrap = document.createElement('div');

      if (itemTitle) {
        const h3 = document.createElement('h3');
        h3.className = 'mb-3';
        h3.textContent = itemTitle;
        textWrap.append(h3);
      }

      if (itemDesc) {
        const d = document.createElement('div');
        d.className = 'csr-item-desc';
        d.innerHTML = itemDesc;
        textWrap.append(d);
      }

      item.append(textWrap);
      itemsWrap.append(item);
    });

    right.append(itemsWrap);
  }

  content.append(left, right);
  
  // Add header and content to spacer wrapper
  spacerWrapper.append(header, content);
  
  // Add the engine wrapper (with spacer inside) to the block
  block.append(engineWrapper);
}