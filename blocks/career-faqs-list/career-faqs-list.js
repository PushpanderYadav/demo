import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');


  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
   5️⃣ External Links → Open in New Tab
================================ */

const links = block.querySelectorAll('a[href]');

links.forEach((link) => {
  const href = link.getAttribute('href');

  if (!href) return;

  // If link starts with http or https → external
  if (href.startsWith('http://') || href.startsWith('https://')) {
    
    // Optional: skip same domain links
    const currentHost = window.location.hostname;
    const linkHost = new URL(href).hostname;

    if (linkHost !== currentHost) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

  /* ===============================
     1️⃣ Section Title + Description
  =============================== */

  const sectionTitle =
    rows[0]?.querySelector('h1,h2,h3,h4,h5,h6,p')?.textContent?.trim() || '';

  const sectionDescription =
    rows[1]?.querySelector('p, div')?.innerHTML || '';

  /* ===============================
     2️⃣ FAQ Items (Rest of rows)
  =============================== */

  const faqItems = rows.slice(2).map((row) => {
    const question =
      row.querySelector('div:first-child')?.textContent?.trim() || '';

    const answer =
      row.querySelector('div:last-child')?.innerHTML || '';

    return { question, answer, row };
  });



/* ===============================
   3️⃣ Generate html
================================ */

const container = document.createElement('div');
container.className = 'career-faqs__container';

/* LEFT SIDE WRAPPER */
const leftWrapper = document.createElement('div');
leftWrapper.className = 'career-faqs__left';

/* RIGHT SIDE WRAPPER */
const rightWrapper = document.createElement('div');
rightWrapper.className = 'career-faqs__right';

/* ---- Title ---- */
if (sectionTitle) {
  const h2 = document.createElement('h2');
  h2.className = 'career-faqs__title';
  h2.textContent = sectionTitle;
  if (rows[0]) moveInstrumentation(rows[0], h2);
  leftWrapper.append(h2);
}

/* ---- Description ---- */
if (sectionDescription) {
  const desc = document.createElement('div');
  desc.className = 'career-faqs__desc';
  desc.innerHTML = sectionDescription;
  if (rows[1]) moveInstrumentation(rows[1], desc);
  leftWrapper.append(desc);
}

/* ---- Accordion ---- */
const accordion = document.createElement('div');
accordion.className = 'career-faqs__accordion';

faqItems.forEach((item) => {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'career-faqs__item';
  if (item.row) moveInstrumentation(item.row, itemDiv);

  itemDiv.innerHTML = `
    <button class="career-faqs__question" aria-expanded="false">
      <span>${item.question}</span>
      <span class="career-faqs__icon">+</span>
    </button>
    <div class="career-faqs__answer">
      ${item.answer}
    </div>
  `;

  accordion.append(itemDiv);
});

rightWrapper.append(accordion);

/* Append both sides */
container.append(leftWrapper);
container.append(rightWrapper);

block.innerHTML = '';
const section = document.createElement('section');
section.className = 'career-faqs';
section.append(container);
block.append(section);





/* ===============================
   4️⃣ Accordion Functionality
================================ */

const items = block.querySelectorAll('.career-faqs__item');

items.forEach((item) => {
  const button = item.querySelector('.career-faqs__question');
  const answer = item.querySelector('.career-faqs__answer');
  const icon = item.querySelector('.career-faqs__icon');

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');

    // Close all
    items.forEach((el) => {
      el.classList.remove('active');
      el.querySelector('.career-faqs__question')
        .setAttribute('aria-expanded', 'false');
      el.querySelector('.career-faqs__icon').textContent = '+';
    });

    // Open current
    if (!isOpen) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      icon.textContent = '–';
    }
  });
});


}
