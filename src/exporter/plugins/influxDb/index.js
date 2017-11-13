const Influx = require('influx');
const Joi = require('Joi');

const schema = Joi.object().keys({
    host: Joi.string().required(),
    database: Joi.string().required(),
    measurement: Joi.string().required(),
    port: Joi.number().default(8086)
});


class InfluxDbExporter{
    constructor(config){
        const { error, value } = Joi.validate(config, schema);
        if(error) throw error;
        this.config = value;

        this.measurement = config.measurement;
        this.influx = new Influx.InfluxDB({
            host:  this.config.host,
            port:  this.config.port,
            database:  this.config.database,
            schema: [
              {
                measurement:  this.config.measurement,
                fields: {
                  status: Influx.FieldType.INTEGER,
                  loadingTime: Influx.FieldType.INTEGER,
                  loadEvent: Influx.FieldType.INTEGER,
                  url: Influx.FieldType.STRING,
                  name: Influx.FieldType.STRING,
                  jsError:Influx.FieldType.INTEGER,
                  ok: Influx.FieldType.INTEGER
                },
                tags: [
                  'service'
                ]
              }
            ]
           })
    }
    process(result,target){
        result = this.sanitize(result);
        this.influx.writePoints([
            {
              measurement: this.measurement,
              tags: { service: target.name },
              fields: result,
            }
          ]).then(console.log).catch(console.log)
    }
    sanitize(result){
        for (var key in result) {
            if(typeof(result[key]) === "boolean"){
                result[key] = result[key] ? 1 : 0;
            }
        }
        
        return result
    }
}

exports.default = InfluxDbExporter;
