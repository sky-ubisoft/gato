const puppeteer = require('puppeteer');

class BrowserFactory {
        
        constructor(chromiumConfig) {
            this.args = [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ];
    
            if(chromiumConfig && chromiumConfig.ignoreCertificateErrors){
                this.args.push('--ignore-certificate-errors')
            }
        }
        getBrowser() {
            return puppeteer.launch({
                args: this.args
            });
        }
    }
exports.BrowserFactory = BrowserFactory;