const Joi = require('joi');
const { logger, levels } = require('../../../logger');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('api', 'spa'),
  url: Joi.string().required(),
  interval: Joi.number().default(30 * 1000),
  performance: Joi.boolean().default(false),
  headers: Joi.object().default({})
});

class SpaMonitoring {
  constructor(config, exporter, browser) {
    const { error, value } = Joi.validate(config, schema);
    if (error) throw error
    this.target = value;
    this.exporter = exporter;
    this.browser = browser;
  }
  async monitore() {
    try {
      var startLoad = Date.now();

      let page;
      try {
        page = await this.browser.newPage();
      } catch (err) { }

      for (var headerKey in this.target.headers) {
        const temp = {};
        temp[headerKey] = this.target.headers[headerKey];
        page.setExtraHTTPHeaders(temp);
      }

      const response = await page.goto(this.target.url, { 'waitUntil': 'networkidle', 'timeout': 3000000 });
      var loadingTime = Date.now() - startLoad;
      var loadEvent = false;
      var error = false;
      var performance = {};

      page.on('pageerror', error => {
        error = true;
        logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - ${error.toString()}` });
      });

      page.on('error', error => {
        error = true;
        logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - ${error.toString()}` });
      });

      page.on('metrics', perf => {
        performance = perf.metrics;
        logger.log({ level: levels.info, message: `SpaMonitoring::monitore - ${this.target.name} - metrics done` });
      });

      page.on('load', msg => {
        loadEvent = true;
        logger.log({ level: levels.info, message: `SpaMonitoring::monitore - ${this.target.name} - load done` });
      });

      let responseData;

      const doMonitor = async () => {
        var result = {
          status: response.status,
          loadingTime: loadingTime,
          loadEvent: loadEvent,
          url: this.target.url,
          name: this.target.name,
          jsError: error,
          ok: response.ok
        };

        if (this.target.type === 'spa') {
          if (this.target.performance && performance) {
            result.performance = {};
            logger.log({ level: levels.debug, message: `SpaMonitoring::monitore - ${this.target.name} - ${performance.toString()}` });
            Object.keys(performance).map(({ name, value }) => {
              result.performance[name] = value;
            })
          }
        }

        this.exporter.processResult(result, this.target);
        page && await page.close();
        this.monitore();
      }
      setTimeout(async () => doMonitor(), this.target.interval);
    } catch (error) {
      logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - ${error.toString()}` });
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

exports.default = SpaMonitoring
