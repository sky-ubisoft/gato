const Influx = require('influx');
const Joi = require('joi');
const { logger, levels } = require('../../../logger');

const schema = Joi.object().keys({
    host: Joi.string().required(),
    database: Joi.string().required(),
    measurement: Joi.string().required(),
    port: Joi.number().default(8086),
    type: Joi.string()
});


class InfluxDbExporter {
    constructor(config) {
        const { error, value } = Joi.validate(config, schema);
        if (error) throw error;
        this.config = value;

        this.measurement = config.measurement;
        this.influx = {};
        this.influx = new Influx.InfluxDB({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            schema: [
                {
                    measurement: this.config.measurement,
                    fields: {
                        status: Influx.FieldType.INTEGER,
                        loadingTime: Influx.FieldType.INTEGER,
                        loadEvent: Influx.FieldType.INTEGER,
                        url: Influx.FieldType.STRING,
                        name: Influx.FieldType.STRING,
                        jsError: Influx.FieldType.INTEGER,
                        ok: Influx.FieldType.INTEGER
                    },
                    tags: [
                        'service'
                    ]
                }
            ]
        })
        process.on('exit', () => this.influx.close());
    }

    async process(result, target) {
        const db = this.influx[target.type.toLowerCase()];
        if (!db) {
            db = this.instantiateDb(result, target);
            this.influx[target.type.toLowerCase()] = db;
        }
        result = this.sanitize(result);
        try {
            const data = await this.influx.writePoints([
                {
                    measurement: target.type,
                    tags: { service: target.name },
                    fields: result,
                }
            ]);
            logger.log({ level: levels.info, message: `InfluxDbExporter::process - ${target.name}` });
        } catch (err) {
            logger.log({ level: levels.error, message: `InfluxDbExporter::process - ${target.name} - ${err}` });
        }
    }
    sanitize(result) {
        const resultClean = {}
        for (var key in result) {
            if (typeof (result[key]) === "boolean") {
                resultClean[key] = result[key] ? 1 : 0;
            }
            if (typeof (result[key]) === "string" || typeof (result[key]) === "number") {
                resultClean[key] = result[key];
            }
        }

        return resultClean
    }
    instantiateDb(result, target) {
        const fields = {};
        for (var key in result) {
            if (typeof (result[key]) === "number") {
                field[key] = Influx.FieldType.FLOAT;
            }
            if (typeof (result[key]) === "string") {
                field[key] = Influx.FieldType.STRING;
            }
            if (typeof (result[key]) === "boolean") {
                field[key] = Influx.FieldType.INTEGER;
            }
        }

        return new Influx.InfluxDB({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            schema: [
                {
                    measurement: target.type,
                    fields: fields,
                    tags: [
                        'service'
                    ]
                }
            ]
        })
    }
}

exports.default = InfluxDbExporter;
