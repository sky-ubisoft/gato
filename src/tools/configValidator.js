const Joi = require('joi');
const YAML = require('yamljs');

const configSchema = Joi.object().keys({
    chromium: Joi.object().keys({
        ignoreCertificateErrors: Joi.bool().default(false),
        headless: Joi.boolean().default(true)
    }),
    monitoring: Joi.object().default({})
});



const schema = Joi.object().keys({
    targets: Joi.array().required(),
    exports: Joi.array().required(),
    gato: configSchema
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