// export default function decorate(block) {
//   const rows = [...block.children];
//   if (rows.length < 2) return;

//   /* ===============================
//      1️⃣ Section Title
//   =============================== */
//   const sectionTitle = rows[0]
//     ?.querySelector('p')
//     ?.textContent?.trim();

//   const itemRows = rows.slice(1);

//   /* ===============================
//      2️⃣ Parse authored rows
//   =============================== */
//   const tabs = itemRows.map((row, i) => {
//     const cells = [...row.children];

//     return {
//       title: cells[0]?.textContent?.trim(),
//       id: cells[1]?.textContent?.trim() || `tab-${i}`,
//       desc: cells[2]?.innerHTML || '',
//     };
//   }).filter((t) => t.title);

//   if (!tabs.length) return;

//   /* ===============================
//      3️⃣ Hide authored HTML
//   =============================== */
//   rows.forEach((row) => (row.style.display = 'none'));

//   /* ===============================
//      4️⃣ Runtime Markup
//   =============================== */
//   const runtime = document.createElement('div');
//   runtime.className = 'fraud-tabs-runtime';

//   runtime.innerHTML = `
//     <div class="container">

//       ${
//         sectionTitle
//           ? `<h2 class="sec-title mb-4">${sectionTitle}</h2>`
//           : ''
//       }

//       <div class="fraud-tabs-nav mb-3">
//         ${tabs
//           .map(
//             (tab, i) => `
//             <button 
//               class="fraud-tab-btn ${i === 0 ? 'active' : ''}" 
//               data-index="${i}">
//               ${tab.title}
//             </button>`
//           )
//           .join('')}
//       </div>

//       <div class="fraud-tabs-content"></div>
//     </div>
//   `;

//   block.after(runtime);

//   const navBtns = runtime.querySelectorAll('.fraud-tab-btn');
//   const content = runtime.querySelector('.fraud-tabs-content');

//   /* ===============================
//      5️⃣ Render Tab Content
//   =============================== */
//   function renderTab(index) {
//     content.innerHTML = `
//       <div class="fraud-tab-pane">
//         ${tabs[index].desc}
//       </div>
//     `;
//   }

//   /* ===============================
//      6️⃣ Click Handling
//   =============================== */
//   navBtns.forEach((btn) => {
//     btn.addEventListener('click', () => {
//       navBtns.forEach((b) => b.classList.remove('active'));
//       btn.classList.add('active');
//       renderTab(btn.dataset.index);
//     });
//   });

//   /* ===============================
//      7️⃣ Init
//   =============================== */
//   renderTab(0);
// }


export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ===============================
     1️⃣ Section Title
  =============================== */
  const sectionTitle = rows[0]
    ?.querySelector('p')
    ?.textContent?.trim();

  const itemRows = rows.slice(1);

  /* ===============================
     2️⃣ Parse authored rows (FIXED)
  =============================== */
  const tabs = itemRows
    .map((row, i) => {
      const cells = [...row.children];

      return {
        title: cells[0]?.textContent?.trim(),          // tabTitle
        insideTitle: cells[1]?.textContent?.trim(),   // tabinsideTitle
        id:
          cells[2]?.textContent?.trim() || `tab-${i}`, // tabId
        desc: cells[3]?.innerHTML || '',               // tabDesc
      };
    })
    .filter((t) => t.title);

  if (!tabs.length) return;

  /* ===============================
     3️⃣ Hide authored HTML
  =============================== */
  rows.forEach((row) => (row.style.display = 'none'));

  /* ===============================
     4️⃣ Runtime Markup
  =============================== */
  const runtime = document.createElement('div');
  runtime.className = 'fraud-tabs-runtime';

  runtime.innerHTML = `
    <div class="container">
      ${
        sectionTitle
          ? `<h2 class="sec-title mb-4">${sectionTitle}</h2>`
          : ''
      }

      <div class="fraud-tabs-nav mb-3">
        ${tabs
          .map(
            (tab, i) => `
            <button
              class="fraud-tab-btn ${i === 0 ? 'active' : ''}"
              data-index="${i}"
              data-id="${tab.id}">
              ${tab.title}
            </button>
          `
          )
          .join('')}
      </div>

      <div class="fraud-tabs-content"></div>
    </div>
  `;

  block.after(runtime);

  const navBtns = runtime.querySelectorAll('.fraud-tab-btn');
  const content = runtime.querySelector('.fraud-tabs-content');

  /* ===============================
     5️⃣ Render Tab Content (FIXED)
  =============================== */
  function renderTab(index) {
    const tab = tabs[index];

    content.innerHTML = `
      <div class="fraud-tab-pane" id="${tab.id}">
        ${
          tab.insideTitle
            ? `<h3 class="fraud-tab-inside-title">${tab.insideTitle}</h3>`
            : ''
        }
        ${tab.desc}
      </div>
    `;
  }

  /* ===============================
     6️⃣ Click Handling
  =============================== */
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);

      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      renderTab(index);
    });
  });

  /* ===============================
     7️⃣ Init (Tab 1 visible by default)
  =============================== */
  renderTab(0);
}
