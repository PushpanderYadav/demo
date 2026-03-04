const FILE_META = {
  ".pdf":  { icon: "📄", label: "PDF Document" },
  ".docx": { icon: "📝", label: "Word Document" },
  ".doc":  { icon: "📝", label: "Word Document" },
  ".xlsx": { icon: "📊", label: "Excel Spreadsheet" },
  ".xls":  { icon: "📊", label: "Excel Spreadsheet" },
};

function getExt(url) {
  try {
    const p = new URL(url).pathname;
    return p.substring(p.lastIndexOf(".")).toLowerCase();
  } catch {
    return "";
  }
}

function getFileName(url) {
  try {
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "Document");
  } catch {
    return "Document";
  }
}

export default function decorate(block) {
  // ── 1. Resolve URL ───────────────────────────────────────────────────────
  let documentUrl =
    block.dataset.documentUrl ||
    block.querySelector("a")?.href ||
    block.textContent?.trim();

  if (!documentUrl) {
    block.innerHTML = `<p class="doc-error">⚠️ No document URL provided.</p>`;
    return;
  }

  // Normalise relative DAM paths → absolute
  if (documentUrl.startsWith("/")) {
    documentUrl = `${window.location.origin}${documentUrl}`;
  }

  const ext = getExt(documentUrl);
  const meta = FILE_META[ext];

  if (!meta) {
    block.innerHTML = `<p class="doc-error">⚠️ Unsupported file type: ${ext || "unknown"}. Supported: PDF, DOCX, XLSX.</p>`;
    return;
  }

  const fileName = getFileName(documentUrl);

  console.log("Document path ---------------------------:", new URL(documentUrl).pathname);
  const wrapper = document.createElement("div");
  wrapper.className = "document-preview-wrapper";
  wrapper.innerHTML = `
    <div class="doc-card">
      <span class="doc-icon" aria-hidden="true">${meta.icon}</span>
      <div class="doc-info">
        <span class="doc-filename">${fileName}</span>
        <span class="doc-type">${meta.label}</span>
      </div>
      <a
        class="doc-download-btn"
        href="${documentUrl}"
        download="${fileName}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download ${fileName}">
        ⬇️ Download
      </a>
    </div>
  `;

  block.innerHTML = "";
  block.appendChild(wrapper);
}