const Joi = require('joi');
const { logger, levels } = require('../../../logger');
const request = require('superagent');
const { getTime } = require('../../../tools/helpers');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('api'),
  url: Joi.string().required(),
  tags: Joi.object().default({}),
  interval: Joi.number().default(30 * 1000),
  headers: Joi.object().default({})
});

class ApiMonitoring {
  constructor(config, exporter) {
    const { error, value } = Joi.validate(config, schema);
    if (error) throw error
    this.target = value;
    this.exporter = exporter;
  }
  async monitore() {
    const startTime = getTime();
    const timestamp = Date.now();
    try {
      const data = await request(this.target.url)
        .set(this.target.headers);
      const result = {
        status: data.status,
        timestamp,
        loadingTime: getTime() - startTime,
        url: this.target.url,
        name: this.target.name,
        ok: data.ok,
        body: data.body
      };
      return result;
    } catch (err) {
      logger.log({ level: levels.error, message: `ApiMonitoring::monitore - ${this.target.name} - ${err}` });
      const result = {
        status: 0,
        timestamp,
        loadingTime: 0,
        url: this.target.url,
        name: this.target.name,
        ok: false,
        err
      };
      return result;
    }
  }
}

module.exports = ApiMonitoring;
