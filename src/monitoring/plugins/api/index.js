const Joi = require('joi');
const { logger, levels } = require('../../../logger');
const request = require('superagent');
const { getTime } = require('../../../tools/helpers');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  type: Joi.string().valid('api'),
  url: Joi.string().required(),
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
    try {
      const data = await request(this.target.url)
        .set(this.target.headers);
      const result = {
        status: data.status,
        loadingTime: getTime() - startTime,
        url: this.target.url,
        name: this.target.name,
        ok: data.ok
      };
      return result;
    } catch (err) {
      logger.log({ level: levels.error, message: `ApiMonitoring::monitore - ${this.target.name} - ${err}` });
      const result = {
        status: 0,
        timestamp: startTime,
        loadingTime: 0,
        url: this.target.url,
        name: this.target.name,
        ok: false
      };
      return result;
    }
  }
}

module.exports = ApiMonitoring;