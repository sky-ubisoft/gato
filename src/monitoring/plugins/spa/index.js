const Joi = require('joi');
const { logger, levels } = require('../../../logger');
const { getTime } = require('../../../tools/helpers');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('spa'),
  url: Joi.string().required(),
  tags: Joi.object().default({}),
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

  async handleResult({ result, pageResponse = false, startTime, perf = {}, err = {} }) {
    const reponseTime = getTime();
    return {
      ...result,
      status: pageResponse && pageResponse.status,
      loadingTime: reponseTime - startTime,
      ok: pageResponse && pageResponse.ok,
      perf,
      err
    };
  }

  async handleError({ err, page, result, resolve, startTime }) {
    logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - error happen at the page: ${err}` });
    return resolve(this.handleResult({ result, err, startTime }));
  }

  async handlePageError({ pageerr, page, result, resolve, startTime }) {
    logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - pageerror occurred: ${pageerr}` });
    return resolve(this.handleResult({ result, err: pageerr, startTime }));
  }

  async handleLoad({ page, result, resolve, pageResponse, startTime }) {
    const pageUrl = page.url();
    if (pageUrl === "chrome-error://chromewebdata/") {
      page && await page.close();
      return;
    }
    const perf = await page.metrics();
    logger.log({ level: levels.verbose, message: `SpaMonitoring::monitore - page successfully loaded: ${page.url()}` });
    page && await page.close();
    return resolve(this.handleResult({ result, perf, pageResponse, startTime }));
  }

  async monitore() {
    let page;
    let result;
    const timestamp = Date.now();
    const startTime = getTime();

    try {
      return new Promise(async (resolve, reject) => {
        let pageResponse;
        page = await this.browser.newPage();

        Object.keys(this.target.headers).map(headerName => {
          page.setExtraHTTPHeaders({ [headerName]: this.target.headers[headerName] });
        });

        result = {
          timestamp,
          url: this.target.url,
          name: this.target.name,
        };

        page.on('error', err => {
          this.handleError({ err, result, resolve, startTime })
        });
        page.on('pageerror', pageerr => {
          this.handlePageError({ pageerr, result, resolve, startTime })
        });
        page.on('load', () => {
          this.handleLoad({ page, result, resolve, startTime });
        });

        await page.goto(this.target.url, { 'waitUntil': 'networkidle2', 'timeout': 3000000 }).catch(async (err) => {
          page && await page.close();
          reject(err);
        });
      });

    } catch (error) {

      page && await page.close();

      logger.log({ level: levels.error, message: `SpaMonitoring::monitore - ${this.target.name} - ${error.toString()}` });
      result = {
        status: 0,
        loadingTime: 0,
        timestamp,
        url: this.target.url,
        name: this.target.name,
        ok: false
      }
      return Promise.resolve(result);

    }
  }
}

module.exports = SpaMonitoring;
