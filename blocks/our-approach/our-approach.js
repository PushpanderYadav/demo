export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 4) return;

  const [
    headingRow,
    titleRow,
    descRow,
    imageRow,
  ] = rows;

  const wrapper = document.createElement('div');
  wrapper.className = 'our-approach-wrapper';

  /* =========================
     TOP CONTENT (2 COLUMNS)
  ========================= */
  const content = document.createElement('div');
  content.className = 'our-approach-content';

  const left = document.createElement('div');
  left.className = 'our-approach-left';
  left.append(headingRow, titleRow);

  const right = document.createElement('div');
  right.className = 'our-approach-right';
  right.append(descRow);

  content.append(left, right);

  /* =========================
     IMAGE BELOW
  ========================= */
  const imageWrap = document.createElement('div');
  imageWrap.className = 'our-approach-image';

  const img = imageRow.querySelector('img');
  if (img) imageWrap.appendChild(img);

  wrapper.append(content, imageWrap);
  block.prepend(wrapper);

  /* =========================
     HIDE AUTHORING ROWS
  ========================= */
//   rows.forEach((row) => {
//     row.style.display = 'none';
//   });
}
