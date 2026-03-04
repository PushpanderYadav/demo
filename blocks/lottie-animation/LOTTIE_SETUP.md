# Lottie Animation Block - Setup Guide

## Overview

The Lottie Animation block displays animated graphics using Lottie JSON files stored in AEM DAM. This guide explains how to properly configure and use the block.

## Requirements

### 1. Lottie JSON File

- Must be a valid Lottie JSON file (exported from Adobe After Effects or similar)
- Stored in AEM DAM (recommended path: `/content/dam/gmr/animations/`)
- **Must be published** in AEM DAM (see Publishing section below)

### 2. Edge Delivery Services Configuration

According to Adobe's official documentation, DAM assets can be accessed directly from Edge Delivery Services after they are published. No additional proxy or server-side configuration is required.

## Publishing DAM Assets

**CRITICAL:** Lottie JSON files must be published in AEM DAM before they can be used in Edge Delivery Services.

### How to Publish

1. **Open AEM DAM** (Assets console)
2. **Navigate to your animation file** (e.g., `/content/dam/gmr/animations/mapanimation5.json`)
3. **Select the file** by clicking the checkbox
4. **Click "Quick Publish"** in the toolbar
   - Alternatively, use "Manage Publication" for more control
5. **Wait for completion** (usually 1-2 minutes)
6. **Verify publication** - The file should now be accessible at the published URL

### Verifying Publication

To verify an asset is published, try accessing it directly:

```
https://your-domain.com/content/dam/gmr/animations/your-file.json
```

If you get a 404 error, the asset is not published yet.

## Using the Lottie Animation Block

### In Universal Editor

1. **Add the block** to your page by dragging "Lottie Animation" from the components panel
2. **Configure the animation:**
   - Click on the block to open the properties panel
   - In the "Animation JSON Files" field, browse and select your published JSON file
   - The path should look like: `/content/dam/gmr/animations/your-animation.json`
3. **Save and preview** - The animation should load and play automatically

### In Document Authoring (Excel/Google Sheets)

Create a table with the following structure:

```
| Lottie Animation |                                          |
|------------------|------------------------------------------|
| Animation        | /content/dam/gmr/animations/your-file.json |
```

## Configuration Options

The block supports the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `animation` | string | (required) | Path to the Lottie JSON file in DAM |
| `loop` | boolean | `true` | Whether to loop the animation |
| `autoplay` | boolean | `true` | Whether to start playing automatically |
| `showcontrols` | boolean | `false` | Show debug controls (for authoring only) |
| `renderer` | string | `'svg'` | Rendering mode: 'svg', 'canvas', or 'html' |
| `width` | string | `'100%'` | Container width (CSS value) |
| `height` | string | `'auto'` | Container height (CSS value) |

### Example with Options

```
| Lottie Animation |                                          |
|------------------|------------------------------------------|
| Animation        | /content/dam/gmr/animations/logo.json    |
| Loop             | true                                     |
| Autoplay         | false                                    |
| Width            | 500px                                    |
| Height           | 500px                                    |
```

## Troubleshooting

### 404 Error - Asset Not Found

**Cause:** The JSON file is not published in AEM DAM.

**Solution:**
1. Open AEM DAM and locate the file
2. Select it and click "Quick Publish"
3. Wait 1-2 minutes for publishing to complete
4. Refresh your page

### Animation Not Playing

**Possible causes:**
- Invalid Lottie JSON format
- File is corrupted
- `autoplay` is set to `false`

**Solution:**
1. Download the JSON file and validate it at https://lottiefiles.com/
2. Try opening the JSON file directly in the browser to check for errors
3. Check the browser console for error messages

### CORS Errors

**Cause:** Network or configuration issues.

**Solution:**
- Check browser console for detailed error messages
- Verify the asset path is correct
- Ensure the asset is published

### Empty or Broken Animation

**Possible causes:**
- JSON file is empty or corrupted
- Incorrect file path
- Network issues

**Solution:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for the JSON file request - check its status and response
5. Verify the response contains valid JSON data

## Technical Details

### How It Works

1. **Block initialization:** The `lottie-animation.js` script reads the configuration
2. **Asset fetching:** The `dam-json-helper.js` fetches the JSON file directly from `/content/dam/`
3. **Rendering:** The Lottie library (loaded from CDN) renders the animation

### Fetch Strategies

The helper uses multiple fallback strategies:

1. **Direct fetch** - Recommended by Adobe for Edge Delivery Services
2. **With inline parameter** - Adds `?inline=true` to prevent download headers
3. **AEM environment detection** - Special handling for AEM author/publish environments

### Browser Compatibility

The block uses the official Lottie Web library (v5.12.2) which supports:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Best Practices

1. **Optimize JSON files** - Keep file sizes small for better performance
2. **Use descriptive names** - Name files clearly (e.g., `hero-animation.json`)
3. **Organize in folders** - Use `/content/dam/gmr/animations/` for all Lottie files
4. **Test before publishing** - Preview animations in Universal Editor before publishing pages
5. **Publish assets first** - Always publish JSON files before using them in pages

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for detailed error messages
2. Verify the asset is published in AEM DAM
3. Test the JSON file URL directly in the browser
4. Contact the development team with:
   - The asset path
   - Error messages from the console
   - Screenshots of the issue