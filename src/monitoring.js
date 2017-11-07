const puppeteer = require('puppeteer');

class Monitoring {
    constructor(check, exporter) {
        this.exporter = exporter;
        this.check = check;
    }
    monitore(browser, service) {
        return browser.newPage().then((page) => {
            var startLoad = Date.now();
            return page._client.send('Performance.enable').then(() => {
                return page.goto(service.url, { 'waitUntil': 'networkidle' }).then((response) => {
                    var loadingTime = Date.now() - startLoad;
                    var loadEvent = false;
                    var error = false;
                    var performance = {};
                    page.on('pageerror', error => {
                        error = true;
                    })
                    page._client.send('Performance.getMetrics').then((perf) => {
                        performance = perf.metrics;
                    })
                    page.on('load', msg => {
                        loadEvent = true;
                    })
                    setTimeout(() => {
                        var result = {
                            status: response.status,
                            loadingTime: loadingTime,
                            loadEvent: loadEvent,
                            url: service.url,
                            name: service.name,
                            jsError: error,
                            ok: response.ok
                        }

                        if (service.performance && performance) {
                            result.performance = {}
                            performance.forEach(({ name, value }) => {
                                result.performance[name] = value;
                            })
                        }

                        this.exporter.processResult(result, service);
                        setTimeout(() => {
                            page.close().then(() => {
                                this.monitore(browser, service);
                            })
                        }, service.interval)
                    }, service.loadTimeout);
                });
            });
        })
    }
    start() {
        puppeteer.launch().then((browser) => {
            this.check.forEach((service) => {
                this.monitore(browser, service).then()
            })
        })
    }
}

exports.Monitoring = Monitoring
