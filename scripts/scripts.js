import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from "./aem.js";
// Add these lines after existing imports from "./aem.js"
const getMetadata = (name) => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.content : null;
};


/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter(
        (attr) =>
          attr.startsWith("data-aue-") || attr.startsWith("data-richtext-")
      )
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes("localhost"))
      sessionStorage.setItem("fonts-loaded", "true");
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auto Blocking failed", error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

// /**
//  * Loads everything needed to get to LCP.
//  * @param {Element} doc The container element
//  */
// async function loadEager(doc) {
//   document.documentElement.lang = "en";
//   decorateTemplateAndTheme();
//   const main = doc.querySelector("main");
//   if (main) {
//     decorateMain(main);
//     document.body.classList.add("appear");
//     await loadSection(main.querySelector(".section"), waitForFirstImage);
//   }

//   try {
//     /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
//     if (window.innerWidth >= 900 || sessionStorage.getItem("fonts-loaded")) {
//       loadFonts();
//     }
//   } catch (e) {
//     // do nothing
//   }
// }

async function loadEager(doc) {
  document.documentElement.lang = "en";
  decorateTemplateAndTheme();
  const main = doc.querySelector("main");
  if (main) {
    decorateMain(main);
    document.body.classList.add("appear");
    
    // ???? Wait for Target propositions if enabled (before LCP section)
    if (getMetadata('target') === 'true') {
      await new Promise(resolve => {
        if (window.alloy) return resolve();
        const checkAlloy = () => {
          if (window.alloy) resolve();
          else setTimeout(checkAlloy, 50);
        };
        checkAlloy();
      });
    }
    
    await loadSection(main.querySelector(".section"), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem("fonts-loaded")) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector("main");
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector("header"));
  loadFooter(doc.querySelector("footer"));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // window.setTimeout(() => {
  // ✅ Step 2: container add karo (where plugin should appear)
  addBhashiniContainer();

  // ✅ Step 1: script add karo (bottom of body)
  loadBhashiniScript();

  // existing delayed logic
  import("./delayed.js");
  // }, 300);
}
// ???? ADOBE TARGET INTEGRATION (using existing window.alloy)
const onDecoratedElement = (fn) => {
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
    return;
  }
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY' || 
      m.target.dataset?.sectionStatus === 'loaded' || 
      m.target.dataset?.blockStatus === 'loaded')) {
      fn();
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector('main'), { 
    subtree: true, 
    attributes: true, 
    attributeFilter: ['data-block-status', 'data-section-status'] 
  });
  observer.observe(document.body, { childList: true });
};

const getAndApplyTargetPropositions = async () => {
  if (!window.alloy) {
    console.warn('? window.alloy not available');
    return;
  }
  
  try {
    console.log('???? Fetching Target propositions...');
    const response = await window.alloy('sendEvent', { 
      renderDecisions: false,
      decisionScopes: ['__view__']
    });
    
    const { propositions } = response;
    console.log('???? Propositions:', propositions?.length || 0);
    
    onDecoratedElement(async () => {
      await window.alloy('applyPropositions', { propositions });
      console.log('? Target applied!');
      
      setTimeout(() => {
        window.alloy('sendEvent', {
          xdm: {
            eventType: 'decisioning.propositionDisplay',
            _experience: { decisioning: { propositions } }
          }
        });
        console.log('???? Display events sent');
      }, 1000);
    });
  } catch (error) {
    console.error('? Target error:', error);
  }
};

// Auto-trigger Target if metadata present
if (getMetadata('target') === 'true' || getMetadata('personalization')) {
  getAndApplyTargetPropositions();
}


function loadBhashiniScript() {
  // prevent multiple load
  if (document.getElementById("bhashini-script")) return;

  const script = document.createElement("script");
  script.id = "bhashini-script";
  script.src =
    "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
  script.defer = true;

  document.body.appendChild(script);
}
function addBhashiniContainer() {
  if (document.querySelector(".bhashini-plugin-container")) return;

  const container = document.createElement("div");
  container.className = "bhashini-plugin-container";

  // Add inside header
  const header = document.querySelector("header");

  if (header) {
    // header ke end me add hoga
    header.appendChild(container);
  } else {
    // fallback (agar header abhi load nahi hua)
    document.body.prepend(container);
  }
}

// function addBhashiniContainer() {
//   // prevent duplicate
//   if (document.querySelector(".bhashini-plugin-container")) return;

//   const container = document.createElement("div");
//   container.className = "bhashini-plugin-container";

//   // 🔥 target: header > .default-content-wrapper
//   const headerWrapper = document.querySelector(".primary-header");

//   if (headerWrapper) {
//     headerWrapper.appendChild(container);
//   } else {
//     // fallback (in case header not yet rendered)
//     document.body.prepend(container);
//   }
// }

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
