const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('api', 'spa'),
  url: Joi.string().required(),
  interval: Joi.number().default(30 * 1000),
  performance: Joi.boolean().default(false),
  headers: Joi.object().default({})
});


class ApiMonitoring {
  constructor(config, exporter, browser) {

    const { error, value } = Joi.validate(config, schema);
    if(error) throw error
    this.target = value;
    this.exporter = exporter;
    this.browser = browser;
  }
  async monitore() {
    try {
      const startLoad = Date.now();

      let page;
      try {
        page = await this.browser.newPage();
      } catch (err) {

      }

      const response = await page.goto(this.target.url, { 'waitUntil': 'networkidle' });
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
          url: this.target.url,
          name: this.target.name,
          jsError: error,
          ok: response.ok,
          responseData
        };

        this.exporter.processResult(result, this.target);
        page && await page.close();
        this.monitore();
      }
      setTimeout(async () => doMonitor(), this.target.interval);
    } catch (error) {
      console.error('ERROR', error)
      var result = {
        status: 0,
        loadingTime: 0,
        loadEvent: false,
        url: this.target.url,
        name: this.target.name,
        jsError: false,
        ok: false
      }
      this.exporter.processResult(result, this.target);
      const doMonitor = async () => {
        page && await page.close();
        this.monitore();
      }
      setTimeout(async () => doMonitor(), this.target.interval);
    }
  }
}

exports.default = ApiMonitoring
