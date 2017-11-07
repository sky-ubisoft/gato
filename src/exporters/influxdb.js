const Influx = require('influx');

class InfluxDbExporter{
    constructor(config){
        this.measurement = config.measurement;
        this.influx = new Influx.InfluxDB({
            host: config.host,
            port: config.port,
            database: config.database,
            schema: [
              {
                measurement: config.measurement,
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

exports.InfluxDbExporter = InfluxDbExporter;
