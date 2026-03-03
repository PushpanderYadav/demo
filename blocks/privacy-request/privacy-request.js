export default function decorate(block) {
  // 1. EXTRACT CONFIG
  const conf = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim();
    if (key === 'description') conf[key] = row.children[1]?.innerHTML;
    else conf[key] = row.children[1]?.textContent?.trim();
  });

  // 2. BUILD UI
  block.innerHTML = `
    <div class="privacy-form-container">
      <h2>${conf.title || 'Request Data Deletion'}</h2>
      <div class="desc">${conf.description || 'Enter Record ID to erase data.'}</div>
      <div class="form-group">
        <input type="text" id="record-id" placeholder="Record ID (e.g. consent-123)" />
        <button id="erase-btn" class="button primary">${conf.btnLabel || 'Erase Data'}</button>
      </div>
      <div id="auto-fill-note" style="display:none; color:green; margin-bottom:10px;">
        <strong>✅ Auto-Detected:</strong> Found your ID from this session.
      </div>
      <div id="form-status"></div>
    </div>
  `;

  const btn = block.querySelector('#erase-btn');
  const input = block.querySelector('#record-id');
  const statusMsg = block.querySelector('#form-status');
  const note = block.querySelector('#auto-fill-note');

  // 3. AUTO-FILL LOGIC
  const savedId = localStorage.getItem('gmr-privacy-id');
  if (savedId) {
    input.value = savedId;
    note.style.display = 'block';
  }

  // 4. ERASE EVENT
  btn.addEventListener('click', async () => {
    const idToDelete = input.value.trim();
    if (!idToDelete) return;

    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
      const ERASE_API = 'https://3842504-gmr-stage.adobeioruntime.net/api/v1/web/GMR-0.0.1/erase';

      const response = await fetch(ERASE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idToDelete })
      });

      const result = await response.json();

      if (response.ok) {
        statusMsg.innerHTML = `<span style="color:green">✅ ${result.message || 'Deleted.'}</span>`;
        localStorage.removeItem('gmr-privacy-id');
        localStorage.removeItem('gmr-cookie-consent');
        input.value = '';
        note.style.display = 'none';
      } else {
        statusMsg.innerHTML = `<span style="color:red">❌ Error: ${result.error}</span>`;
      }
    } catch (e) {
      statusMsg.innerHTML = `<span style="color:red">❌ Network Error</span>`;
    } finally {
      btn.textContent = conf.btnLabel || 'Erase Data';
      btn.disabled = false;
    }
  });
}