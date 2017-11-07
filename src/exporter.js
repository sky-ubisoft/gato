const { HttpServerExporter } = require('./exporters/httpServer');
const { StdoutExporter } = require('./exporters/stdout');
const { InfluxDbExporter } = require('./exporters/influxdb');

class Exporter {
    constructor(exportsConfig){
        this.stdout = {active:false};
        this.allStatus = {};
        this.httpMode = false;
        this.exporters = [];
        console.log(exportsConfig);
        
        for (var key in exportsConfig) {
            switch (key) {
                case "httpServer": this.exporters.push(new HttpServerExporter(exportsConfig[key])); break;
                case "stdout": this.exporters.push(new StdoutExporter(exportsConfig[key])); break;
                case "influxdb": this.exporters.push(new InfluxDbExporter(exportsConfig[key])); break;
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