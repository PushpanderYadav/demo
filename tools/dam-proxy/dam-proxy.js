export async function main(request) {
    // Extract the DAM asset path from the query parameter
    const url = new URL(request.url);
    const assetPath = url.searchParams.get('path');

    if (!assetPath) {
        return new Response('Missing path parameter', { status: 400 });
    }

    // Construct the AEM publish URL
    const aemPublishUrl = 'https://publish-p168597-e1803019.adobeaemcloud.com';
    const fullUrl = `${aemPublishUrl}${assetPath}`;

    try {
        // Fetch from AEM publish (server-side, no CORS)
        const response = await fetch(fullUrl);

        if (!response.ok) {
            return new Response(`Failed to fetch: ${response.status}`, { status: response.status });
        }

        // Get the content
        const content = await response.text();

        // Return with CORS headers enabled
        return new Response(content, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
