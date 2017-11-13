const puppeteer = require('puppeteer');

class BrowserFactory {
        
        constructor({chromium}) {
            this.args = [
                ' --dissable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ];
            this.headless = chromium.headless;
            if(chromium.ignoreCertificateErrors){
                this.args.push('--ignore-certificate-errors');
            }
        }
        getBrowser() {
            return puppeteer.launch({
                args: this.args,
                headless: this.headless
            });
        }
    }
exports.BrowserFactory = BrowserFactory;