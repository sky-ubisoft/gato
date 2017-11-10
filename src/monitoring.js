const puppeteer = require('puppeteer');

class Monitoring {
    constructor(check, exporter) {
        this.exporter = exporter;
        this.check = check;
    }
    async monitore(browser, service) {
        try {
            var startLoad = Date.now();
            const page = await browser.newPage();
            const response = await page.goto(service.url, { 'waitUntil': 'networkidle' });
            // await page._client.send('Performance.enable')
            var loadingTime = Date.now() - startLoad;
            var loadEvent = false;
            var error = false;
            var performance = {};
            page.on('pageerror', error => {
                error = true;
            })
            page.on('metrics', perf => {
                performance = perf.metrics;
            })
            page.on('load', msg => {
                loadEvent = true;
            })
            const responseData = await response.json();
            console.log(responseData)
            const doMonitor = async () => {
                var result = {
                    status: response.status,
                    loadingTime: loadingTime,
                    loadEvent: loadEvent,
                    url: service.url,
                    name: service.name,
                    jsError: error,
                    ok: response.ok,
                    responseData
                }

                if (service.performance && performance) {
                    result.performance = {}
                    performance.forEach(({ name, value }) => {
                        result.performance[name] = value;
                    })
                }

                this.exporter.processResult(result, service);
                page && await page.close();
                this.monitore(browser, service);
            }
            setTimeout(async () => doMonitor(), service.interval);
        } catch (error) {
            var result = {
                status: 0,
                loadingTime: 0,
                loadEvent: false,
                url: service.url,
                name: service.name,
                jsError: false,
                ok: false
            }
            this.exporter.processResult(result, service);
            const doMonitor = async () => {
                page && await page.close();
                this.monitore(browser, service);
            }
            setTimeout(async () => doMonitor(), service.interval);
        }
    }
    async start() {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        this.check.forEach((service) => {
            this.monitore(browser, service).then();
        });
    }
}

exports.Monitoring = Monitoring
