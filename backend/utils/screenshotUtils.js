import puppeteer from 'puppeteer';

export const generateDashboardScreenshot = async (module = 'sales-export') => {
  let browser = null;
  try {
    // Determine frontend URL (fallback to localhost for local testing)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Use the print token configured in App.jsx to bypass auth and UI wrappers
    const targetUrl = `${frontendUrl}/?print=true&token=astroved_pdf_secret_123&module=${module}`;

    console.log(`Launching Puppeteer to screenshot: ${targetUrl}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,1600'],
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2 // High resolution for better email readability
      }
    });

    const page = await browser.newPage();

    // Navigate and wait for network to be idle to ensure data is fetched (networkidle2 ignores the Vite HMR websocket)
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the specific element to be rendered, but don't fail if it doesn't exist
    try {
      await page.waitForSelector('#report-ready', { timeout: 15000 });
    } catch (e) {
      console.warn("Element #report-ready not found, proceeding with screenshot anyway.");
    }

    // Ensure all charts/images are fully loaded if there are any animations
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Capture full page screenshot as JPEG with 90 quality
    let imageBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    return imageBuffer;
  } catch (error) {
    console.error('Error generating screenshot with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
