const puppeteer = require('puppeteer');

class BrowserFactory {
        
        constructor({chromium}) {
            this.args = [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ];
            this.headless = chromium.headless;
            if(chromium.ignoreCertificateErrors){
                this.args.push('--ignore-certificate-errors');
            }
        }
        getBrowser() {
            console.log(this.args)
            return puppeteer.launch({
                args: this.args,
                headless: this.headless,
                ignoreHTTPSErrors: true
            });
        }
    }
exports.BrowserFactory = BrowserFactory;