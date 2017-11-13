const { HttpServerExporter } = require('./plugins/httpServer');
const { StdoutExporter } = require('./plugins/stdout');
const { InfluxDbExporter } = require('./plugins/influxdb');

class Exporter {
    constructor(exportsConfig){
        this.stdout = {active:false};
        this.allStatus = {};
        this.httpMode = false;
        this.exporters = [];
        
        for (var key in exportsConfig) {
            try {
                const plugins = require(`./plugins/${key}/index.js`);
                this.exporters.push(new plugins.default(exportsConfig[key]));
            } catch(e) {
                try {
                    const plugins = require(key);
                    this.exporters.push(new plugins.default(exportsConfig[key]));
                } catch(e) {
                console.error(`Plugins ${key} is not found, please install it`);
                process.exit(e.code);
                }
            }
        }
    }
    processResult(result, target){
        this.exporters.forEach((exporter) => {
            exporter.process(result,target);
        });
    }
}
exports.Exporter = Exporter;