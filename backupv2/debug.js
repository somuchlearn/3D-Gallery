import puppeteer from 'puppeteer';

(async () => {
    console.log('🚀 Starting Chrome with DevTools...');

    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Collect console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text()
        });
        console.log(`[Console ${msg.type()}]:`, msg.text());
    });

    // Collect errors
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
    });

    console.log('📱 Loading app at http://localhost:5173/...');
    await page.goto('http://localhost:5173/', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    // Wait for Three.js to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Taking screenshot...');
    await page.screenshot({
        path: 'screenshot.png',
        fullPage: false
    });

    // Get performance metrics
    const metrics = await page.metrics();
    console.log('\n📊 Performance Metrics:', metrics);

    // Get any errors
    const errors = await page.evaluate(() => {
        return {
            hasCanvas: !!document.querySelector('canvas'),
            controls: !!document.querySelector('#controls'),
            errors: window.errors || []
        };
    });

    console.log('\n✅ Page Check:', errors);
    console.log('\n💾 Screenshot saved to screenshot.png');
    console.log('\n🔍 Console Logs:', consoleLogs.length, 'messages');

    console.log('\n✨ Chrome is open with DevTools. Press Ctrl+C to close when done.');

    // Keep browser open for manual inspection
    // await browser.close();
})();
