const { logger, levels } = require('../logger');

class Monitoring {
    constructor({ targets }, exporter, browserFactory) {
        this.exporter = exporter;
        this.targets = targets;
        this.browserFactory = browserFactory;
    }
    async start() {
        this.browser = await this.browserFactory.getBrowser();
        this.targets.forEach(target => {
            let monitoringPlugin;
            try {
                monitoringPlugin = require(`./plugins/${target.type}/index.js`);
            } catch (e) {
                try {
                    monitoringPlugin = require(target.type);
                } catch (e) {
                    logger.log({ level: levels.error, message: `Monitoring::start - ${target.name} - ${e.toString()}` });
                    process.exit(e.code);
                }
            }
            const monitoringInstance = new monitoringPlugin.default(target, this.exporter, this.browser);
            monitoringInstance.monitore().then();
        });
    }
}

exports.Monitoring = Monitoring
