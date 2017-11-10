const puppeteer = require('puppeteer');

class ApiMonitoring {
  constructor(check, exporter) {
    this.exporter = exporter;
    this.check = check;
  }
  async monitore(browser, service) {
    try {
      const startLoad = Date.now();

      let page;
      try {
        page = await browser.newPage();
      } catch (err) {

      }

      const response = await page.goto(service.url, { 'waitUntil': 'networkidle' });
      const loadingTime = Date.now() - startLoad;
      let loadEvent = false;
      let error = false;
      const performance = {};
      page.on('pageerror', error => {
        error = true;
      });

      page.on('load', msg => {
        loadEvent = true;
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (err) {
        responseData = null;
      }

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
        };

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

exports.ApiMonitoring = ApiMonitoring
