const puppeteer = require('puppeteer');
const { logger, levels } = require('../logger');

class BrowserFactory {
    constructor({ chromium }) {
        this.args = [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ];
        this.headless = chromium.headless;
        if (chromium.ignoreCertificateErrors) {
            this.args.push('--ignore-certificate-errors');
        }

        this.config = {
            args: this.args,
            headless: this.headless,
            ignoreHTTPSErrors: chromium.ignoreCertificateErrors
        };
    }
    async getBrowser() {
        logger.log({ level: levels.verbose, message: `BrowserFactory::getBrowser - ${this.args.toString()}` });
        const browser = await puppeteer.launch(this.config);
        process.on('exit', async () => await browser.close());
        return browser;
    }
}
exports.BrowserFactory = BrowserFactory;