class Exporter {
    constructor(exportersConfig){
        this.stdout = {active:false};
        this.allStatus = {};
        this.httpMode = false;
        this.exporters = [];
        exportersConfig.forEach((exporterConfig) => {
            const key = exporterConfig.type;  
            let plugins;
            if(!key) throw 'Exporter type is missing'
            try {
                plugins = require(`./plugins/${key}/index.js`);
            } catch(e) {
                try {
                    plugins = require(key);
                } catch(e) {
                console.error(`Plugins ${key} is not found, please install it`);
                process.exit(e.code);
                }
            }
            this.exporters.push(new plugins.default(exporterConfig));
        })
    }
    processResult(result, target){
        this.exporters.forEach((exporter) => {
            exporter.process(result,target);
        });
    }
}
exports.Exporter = Exporter;