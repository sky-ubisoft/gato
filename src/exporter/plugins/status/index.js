const Joi = require('joi');
const request = require('superagent');
const { logger, levels } = require('../../../logger');

const schema = Joi.object().keys({
    type: Joi.string().valid('status'),
    url: Joi.string().required(),
    monitorings: Joi.array().items(Joi.string().required()).unique().default([]),
    headers: Joi.object().default({})
});

class StatusExporter {
    constructor(config) {
        const { error, value } = Joi.validate(config, schema);
        if (error) {
            logger.log({ level: levels.error, message: `StatusExporter:: Config validation error: ${error}` });
            throw error;
        }
        this.config = value;
    }

    async process(result, target) {
        if (!this.config.monitorings.includes(target.type)) {
            return;
        }
        try {
            const resulStr = JSON.stringify(result);
            const data = await request.post(this.config.url)
                .set('Content-Type', 'application/json')
                .set(this.config.headers)
                .send(resulStr);
        } catch (err) {
            logger.log({ level: levels.error, message: `StatusExporter::process - ${err}` });
        }
    }
}

exports.default = StatusExporter;