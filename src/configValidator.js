const Joi = require('joi');
const YAML = require('yamljs');

const targetSchema = Joi.object().keys({
    name: Joi.string().required(),
    url: Joi.string().required(),
    loadTimeout: Joi.number().default(2000),
    interval: Joi.number().default(30*1000),
    performance: Joi.boolean().default(false)
})

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
})



const schema = Joi.object().keys({
    targets: Joi.array().items(targetSchema).required(),
    exports: exportSchema 
})

class ConfigValidator {
    
    constructor(path){
        const {error, value} = Joi.validate(YAML.load(path), schema);
        if(error) throw error;
        this.config = value;

    }
    getConfig(){
        return this.config;
    }
}
exports.ConfigValidator = ConfigValidator;