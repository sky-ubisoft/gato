const { logger, levels } = require('../logger');

class Exporter {
    constructor(exportersConfig) {
        this.stdout = { active: false };
        this.allStatus = {};
        this.httpMode = false;
        this.exporters = [];
        exportersConfig.forEach((exporterConfig) => {
            const key = exporterConfig.type;
            let plugins;
            if (!key) throw 'Exporter type is missing'
            try {
                plugins = require(`./plugins/${key.trim()}/index.js`);
            } catch (e) {

                console.log(e);
                try {
                    plugins = require(key);
                } catch (e) {
                    logger.log({ level: levels.error, message: `Exporter::constuctor - Plugins ${key} is not found, please install it - ${e.toString()}` });
                    process.exit(e.code);
                }
            }
            this.exporters.push(new plugins.default(exporterConfig));
        })
    }
    processResult(result, target) {
        this.exporters.forEach((exporter) => {
            exporter.process(result, target);
        });
    }
}
exports.Exporter = Exporter;