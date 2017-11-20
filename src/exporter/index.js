const { logger, levels } = require('../logger');

class Exporter {
    constructor(exportersConfig) {
        this.stdout = { active: false };
        this.allStatus = {};
        this.httpMode = false;
        this.exporters = [];
        this.init(exportersConfig);
    }
    init(exportersConfig) {
        exportersConfig.forEach((exporterConfig) => {
            const key = exporterConfig.type;
            let plugins;
            if (!key) throw 'Exporter type is missing';
            const pluginsPath = `./plugins/${key.trim()}/index.js`;
            try {
                plugins = require(pluginsPath);
            } catch (e) {
                logger.log({ level: levels.warn, message: `Exporter::init - Plugins "${pluginsPath}" is not found, fallbacking to "${key}"` });
                try {
                    plugins = require(key);
                } catch (e) {
                    logger.log({ level: levels.error, message: `Exporter::constuctor - Plugins ${key} is not found, please install it - ${e.toString()}` });
                    process.exit(e.code);
                }
            }
            this.exporters.push(new plugins.default(exporterConfig));
        });
    }
    processResult(result, target) {
        this.exporters.forEach((exporter) => {
            exporter.process(result, target);
        });
    }
}
exports.Exporter = Exporter;