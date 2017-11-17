const Joi = require('joi');
const { logger, levels } = require('../../../logger');

function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t)
  });
}

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
    let page;
    let result;

    try {
      const startLoad = Date.now();
      page = await this.browser.newPage();

      for (var headerKey in this.target.headers) {
        const temp = {};
        temp[headerKey] = this.target.headers[headerKey];
        page.setExtraHTTPHeaders(temp);
      }

      const response = await page.goto(this.target.url, { 'waitUntil': 'networkidle', 'timeout': 3000000 });

      result = {
        status: response.status,
        loadingTime: Date.now() - startLoad,
        url: this.target.url,
        name: this.target.name,
        ok: response.ok
      };

      return result
    } catch (error) {
      logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - ${error.toString()}` });
      result = {
        status: 0,
        loadingTime: 0,
        url: this.target.url,
        name: this.target.name,
        ok: false
      }
      return result
    }
  }
}

module.exports = SpaMonitoring;
