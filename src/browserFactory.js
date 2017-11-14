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

            this.config = {
                args: this.args,
                headless: this.headless,
                ignoreHTTPSErrors: chromium.ignoreCertificateErrors
            };
        }
        getBrowser() {
            console.log(this.args)
            return puppeteer.launch(this.config);
        }
    }
exports.BrowserFactory = BrowserFactory;