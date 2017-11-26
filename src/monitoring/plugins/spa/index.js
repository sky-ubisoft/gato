const Joi = require('joi');
const { logger, levels } = require('../../../logger');
const { getTime } = require('../../../tools/helpers');

function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t)
  });
}

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('spa'),
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
      const startTime = getTime();
      page = await this.browser.newPage();

      Object.keys(this.target.headers).map(headerName => {
        page.setExtraHTTPHeaders({ [headerName]: this.target.headers[headerName] });
      });

      const response = await page.goto(this.target.url, { 'waitUntil': 'networkidle2', 'timeout': 3000000 });

      const reponseTime = getTime();

      const perf = await page.metrics();

      result = {
        status: response.status,
        timestamp: startTime,
        loadingTime: reponseTime - startTime,
        url: this.target.url,
        name: this.target.name,
        ok: response.ok,
        perf
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
