# Test Data for Local Development

This directory contains test Lottie JSON files for local development testing.

## Purpose

The dam-proxy serverless function doesn't execute in local development (`aem up`). To enable local testing, the Lottie animation block will fall back to loading JSON files from this directory when:

1. Running on `localhost`
2. The proxy fails (returns JavaScript source code)
3. Direct fetch from AEM publish fails (CORS error)

## Usage

### For Local Development

1. **Place your Lottie JSON file here** with the same filename as in DAM
   - Example: If DAM path is `/content/dam/gmr/animations/mapanimation5.json`
   - Place file at: `blocks/lottie-animation/test-data/mapanimation5.json`

2. **Refresh your browser** - the animation should now load from the local file

3. **Check console** - you should see:
   ```
   [DAM Helper] ⚠️ Using local test file for development. This will not work in production!
   ```

### Sample File

`mapanimation5.json` - A simple rotating circle animation for testing

## Important Notes

⚠️ **This is for development only!** 
- Test files will NOT work in production
- Always ensure your actual DAM assets are published before deploying

✅ **Production Behavior:**
- In production (deployed environment), the dam-proxy will execute properly
- The local test file strategy will be skipped
- Assets will be fetched from AEM publish instance

## Adding Your Own Test Files

1. Export your Lottie animation from After Effects or download from LottieFiles
2. Save the JSON file in this directory
3. Use the same filename as your DAM asset
4. Test locally before publishing to DAM

## Troubleshooting

**Animation not loading?**
- Check the filename matches exactly (case-sensitive)
- Verify the JSON is valid Lottie format
- Check browser console for error messages

**Still getting errors?**
- The JSON might be malformed
- Try validating at https://lottiefiles.com/
