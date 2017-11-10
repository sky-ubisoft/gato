const Joi = require('joi');
const YAML = require('yamljs');

const targetsSchema = Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('api', 'spa'),
    url: Joi.string().required(),
    interval: Joi.number().default(30 * 1000),
    performance: Joi.boolean().default(false)
});

const exportSchema = Joi.object().keys({
    httpServer: Joi.object().keys({
        port: Joi.number().default(8080)
    }),
    stdout: Joi.object().keys({
        pretty: Joi.boolean().default(false)
    }),
    influxdb: Joi.object().keys({
        host: Joi.string().required(),
        database: Joi.string().required(),
        measurement: Joi.string().required(),
        port: Joi.number().default(8086)
    })
});



const schema = Joi.object().keys({
    targets: Joi.array().items(targetsSchema).required(),
    exports: exportSchema
});

class ConfigValidator {

    constructor(path) {
        const { error, value } = Joi.validate(YAML.load(path), schema);
        if (error) throw error;
        this.config = value;

    }
    getConfig() {
        return this.config;
    }
}
exports.ConfigValidator = ConfigValidator;