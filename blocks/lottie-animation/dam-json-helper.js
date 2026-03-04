/**
 * Lottie JSON Helper - Project Repository Base
 *
 * This helper fetches Lottie JSON files stored in the project's code repository
 * under /blocks/lottie-animation/lottie-data/
 */

export async function fetchLottieJson(filename) {
    console.log('[Lottie Helper] Fetching animation:', filename);

    if (!filename) {
        throw new Error('Animation filename is required');
    }

    const fetchUrl = getFetchUrl(filename);
    console.log('[Lottie Helper] Resolved URL:', fetchUrl);

    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Animation file "${filename}.json" not found in lottie-data folder.`);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Lottie Helper] ✓ Successfully loaded JSON');
        return data;

    } catch (error) {
        console.error('[Lottie Helper] Fetch failed:', error.message);
        throw error;
    }
}

/**
 * Resolve filename to the local project path
 */
export function getFetchUrl(filename) {
    // If it's already a full path (starting with /), return it directly
    if (filename.startsWith('/')) {
        return filename;
    }

    // Strip .json extension if provided by user
    const baseName = filename.replace(/\.json$/, '');

    // Resolve to the project's lottie-data directory
    // window.hlx.codeBasePath handles correctly resolving paths in EDS
    const codeBase = window.hlx?.codeBasePath || '';
    const repoPath = `${codeBase}/blocks/lottie-animation/lottie-data/${baseName}.json`.replace(/\/+/g, '/');

    return repoPath;
}

/**
 * Utility: Check if an asset is accessible
 */
export async function checkAssetAvailability(filename) {
    try {
        const url = getFetchUrl(filename);
        const response = await fetch(url, {
            method: 'HEAD'
        });

        return {
            available: response.ok,
            status: response.status,
            contentType: response.headers.get('content-type')
        };
    } catch (error) {
        return {
            available: false,
            status: 0,
            error: error.message
        };
    }
}