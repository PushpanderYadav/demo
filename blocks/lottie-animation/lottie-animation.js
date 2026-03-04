import { fetchLottieJson } from './dam-json-helper.js';

export default async function decorate(block) {
  // Parse block properties
  const props = parseBlockProps(block);

  // Debug log for authoring help
  if (props.showcontrols) {
    console.debug('[Lottie] Parsed properties:', props);
  }

  // Get animation filename (prioritize local repo)
  const assetPath =
    props.animation ||
    props.animationfilename ||
    props.animationjsonfile ||
    props.animationjsonfiles ||
    props.filename ||
    scanBlockForFilename(block);

  if (!assetPath) {
    block.innerHTML = `
      <div class="animation-placeholder">
        <p>⚠️ No Lottie Animation Selected</p>
        <p>Authoring tip: Enter a filename (like <code>mapanimation5</code>) from the <code>lottie-data</code> folder.</p>
        ${props.showcontrols || window.location.hostname.includes('localhost') || window.location.hostname.includes('.aem.page') ? `
          <div class="debug-info" style="font-size:10px; opacity:0.6; margin-top:20px; line-height: 1.5; border-top:1px solid rgba(0,0,0,0.1); padding-top:10px;">
            <strong>Debug for Authors:</strong><br>
            Properties detected: ${Object.keys(props).filter(k => !k.startsWith('aue')).join(', ') || 'none'}<br>
            Block content length: ${block.textContent.trim().length} chars<br>
            Hostname: ${window.location.hostname}
          </div>
        ` : ''}
      </div>
    `;
    return;
  }

  // Handle case where assetPath might be a JSON array string ["path"]
  let finalPath = assetPath;
  if (typeof assetPath === 'string' && assetPath.startsWith('[') && assetPath.endsWith(']')) {
    try {
      const arr = JSON.parse(assetPath);
      if (Array.isArray(arr) && arr.length > 0) finalPath = arr[0];
    } catch (e) {
      console.warn('[Lottie] Failed to parse assetPath as array:', e);
    }
  }

  // Show loading state
  block.innerHTML = '<div class="loading">Loading...</div>';
  block.classList.add('lottie-animation-block');

  // Create an observer to lazy-load the animation
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      initAnimation(block, finalPath, props);
    }
  }, { threshold: 0, rootMargin: '200px' });

  observer.observe(block);
}

async function initAnimation(block, finalPath, props) {
  try {
    // Parallelize library loading and JSON fetching
    const [, animationData] = await Promise.all([
      loadLottieLibrary(),
      fetchLottieJson(finalPath)
    ]);

    console.log('[Lottie] Animation ready:', animationData.nm || 'Unnamed');

    // Build the component UI
    buildAnimationUI(block, animationData, props, finalPath);

  } catch (error) {
    console.error('[Lottie] Initialization failed:', error);
    showError(block, finalPath, error);
  }
}

function parseBlockProps(block) {
  const props = {
    loop: true,
    autoplay: true,
    showcontrols: false,
    renderer: 'svg',
    width: '100%',
    height: 'auto'
  };

  // 1. Get from data attributes (Universal Editor) - convert to lowercase
  const dataProps = block.dataset;
  Object.keys(dataProps).forEach(key => {
    if (key.startsWith('aue')) return;

    let value = dataProps[key];
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    props[key.toLowerCase()] = value;
  });

  // 2. Get from block content (table format) - convert labels to lowercase keys
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach(row => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      const valueCell = cells[1];
      let value = valueCell.textContent.trim();

      const link = valueCell.querySelector('a');
      if (link && (link.href || link.textContent.includes('/content/'))) {
        value = link.getAttribute('href') || link.textContent.trim();
      }

      if (value === 'true') value = true;
      if (value === 'false') value = false;

      props[key] = value;
    }
  });

  return props;
}

function scanBlockForFilename(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim();
    if (text && !text.includes(' ') && !text.includes('/')) {
      return text;
    }
    if (text.includes('/content/dam/') && text.endsWith('.json')) {
      return text.split('/').pop().replace('.json', '');
    }
  }

  return null;
}

function loadLottieLibrary() {
  // Already loaded
  if (window.lottie || window.bodymovin) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Script tag already injected by another block (e.g. global-airport-network)
    // — attach to it instead of injecting a duplicate
    const existing = document.querySelector('script[src*="lottie-web"]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Lottie library'));
    document.head.appendChild(script);
  });
}

function buildAnimationUI(block, animationData, props, assetPath) {
  block.innerHTML = '';

  if (props.showcontrols) {
    const infoPanel = createInfoPanel(animationData, assetPath);
    block.appendChild(infoPanel);
  }

  const container = document.createElement('div');
  container.className = 'lottie-animation-container';
  container.id = `lottie-${Date.now()}`;

  if (props.width) container.style.width = props.width;
  if (props.height && props.height !== 'auto') container.style.height = props.height;

  block.appendChild(container);

  const animation = window.lottie.loadAnimation({
    container: container,
    renderer: props.renderer || 'svg',
    loop: props.loop !== false,
    autoplay: props.autoplay !== false,
    animationData: animationData
  });

  block.lottieAnimation = animation;

  if (props.showcontrols) {
    addControls(block, animation);
  }

  console.log('✓ Animation rendered successfully');
}

function createInfoPanel(data, assetPath) {
  const panel = document.createElement('div');
  panel.className = 'animation-info';

  const duration = data.op && data.fr ? (data.op / data.fr).toFixed(2) : 'Unknown';

  panel.innerHTML = `
    <div class="info-header">
      <h3>📽️ Lottie Animation</h3>
      <div class="controls">
        <button class="btn-play-pause" data-state="playing">⏸ Pause</button>
        <button class="btn-restart">⟳ Restart</button>
      </div>
    </div>
    <div class="info-details">
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${data.nm || 'Unnamed'}</span>
      </div>
      <div class="info-row">
        <span class="label">Asset:</span>
        <span class="value">${assetPath}</span>
      </div>
      <div class="info-row">
        <span class="label">Size:</span>
        <span class="value">${data.w} × ${data.h} px</span>
      </div>
      <div class="info-row">
        <span class="label">Duration:</span>
        <span class="value">${duration}s @ ${data.fr}fps</span>
      </div>
      <div class="info-row">
        <span class="label">Layers:</span>
        <span class="value">${data.layers?.length || 0}</span>
      </div>
    </div>
  `;

  return panel;
}

function addControls(block, animation) {
  const playPauseBtn = block.querySelector('.btn-play-pause');
  const restartBtn = block.querySelector('.btn-restart');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      const state = playPauseBtn.dataset.state;
      if (state === 'playing') {
        animation.pause();
        playPauseBtn.innerHTML = '▶ Play';
        playPauseBtn.dataset.state = 'paused';
      } else {
        animation.play();
        playPauseBtn.innerHTML = '⏸ Pause';
        playPauseBtn.dataset.state = 'playing';
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      animation.goToAndPlay(0);
      if (playPauseBtn) {
        playPauseBtn.innerHTML = '⏸ Pause';
        playPauseBtn.dataset.state = 'playing';
      }
    });
  }
}

function showError(block, filename, error) {
  block.innerHTML = `
    <div class="animation-error">
      <h3>❌ Failed to Load Animation</h3>
      <div class="error-details">
        <p><strong>Animation:</strong> ${filename}</p>
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
      <div class="error-help">
        <p><strong>How to fix:</strong></p>
        <ul>
          <li>Make sure the file <code>${filename}.json</code> is in the <code>/blocks/lottie-animation/lottie-data/</code> folder.</li>
          <li>Verify the filename is spelled correctly (case-sensitive).</li>
          <li>Ensure the JSON is a valid Lottie animation format.</li>
        </ul>
      </div>
      <div class="error-actions">
        <button onclick="location.reload()">🔄 Retry</button>
      </div>
    </div>
  `;
}
