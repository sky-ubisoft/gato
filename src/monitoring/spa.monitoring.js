const puppeteer = require('puppeteer');

class SpaMonitoring {
  constructor(check, exporter) {
    this.exporter = exporter;
    this.check = check;
  }
  async monitore(browser, service) {
    try {
      var startLoad = Date.now();

      let page;
      try {
        page = await browser.newPage();
      } catch (err) {

      }

      const response = await page.goto(service.url, { 'waitUntil': 'networkidle' });
      var loadingTime = Date.now() - startLoad;
      var loadEvent = false;
      var error = false;
      var performance = {};
      page.on('pageerror', error => {
        error = true;
      });

      page.on('metrics', perf => {
        performance = perf.metrics;
      });

      page.on('load', msg => {
        loadEvent = true;
      });

      let responseData;

      const doMonitor = async () => {
        var result = {
          status: response.status,
          loadingTime: loadingTime,
          loadEvent: loadEvent,
          url: service.url,
          name: service.name,
          jsError: error,
          ok: response.ok
        };

        if (service.type === 'spa') {
          if (service.performance && performance) {
            result.performance = {}
            console.log('perf', performance);
            Object.keys(performance).map(({ name, value }) => {
              result.performance[name] = value;
            })
          }
        }

        this.exporter.processResult(result, service);
        page && await page.close();
        this.monitore(browser, service);
      }
      setTimeout(async () => doMonitor(), service.interval);
    } catch (error) {
      console.error('ERROR', error)
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
}

exports.SpaMonitoring = SpaMonitoring
