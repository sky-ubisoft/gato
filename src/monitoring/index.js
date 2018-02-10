const { logger, levels } = require('../logger');
const qrate = require('qrate');
const MAX_BROWSER_TABS = 3;

class Monitoring {
    constructor({ targets }, exporter, browserFactory) {
        this.exporter = exporter;
        this.targets = targets;
        this.browserFactory = browserFactory;
    }
    async interval({ target, MonitoringPlugin, exporter, browser }) {
        let result;
        try {
            const monitoringInstance = new MonitoringPlugin(target, exporter, browser);
            result = await monitoringInstance.monitore();
            await exporter.processResult(result, target);
        } catch (err) {
            if (result) {
                logger.log({ level: levels.error, message: `Monitoring::start - ${err.toString()}` });
            } else {
                logger.log({ level: levels.verbose, message: `Monitoring:: start - ${target.name} - result from 'monitore()' is not defined` });
            }
        }
    }

    async start() {
        this.browser = await this.browserFactory.getBrowser();
        this.queue = qrate(this.interval, MAX_BROWSER_TABS);

        this.targets.forEach(target => {
            let MonitoringPlugin;
            try {
                MonitoringPlugin = require(`./plugins/${target.type}`);
            } catch (e) {
                logger.log({ level: levels.warn, message: `Monitoring:: start - './plugins/${target.type}/index.js' not found - ${e.toString()}` });
                try {
                    MonitoringPlugin = require(target.type);
                } catch (e2) {
                    logger.log({ level: levels.error, message: `Monitoring:: start - ${target.name} - ${e2.toString()}` });
                    process.exit(e2.code);
                }
            }
            this.exporter.prepProcessResult(target);
            setInterval(
                ({ queue, browser, exporter }) => {
                    logger.log({ level: levels.verbose, message: `Monitoring:: start - current queue length: ${queue.length()}` });
                    queue.push({
                        target, MonitoringPlugin,
                        browser,
                        exporter
                    })
                },
                target.interval,
                {
                    queue: this.queue,
                    browser: this.browser,
                    exporter: this.exporter
                }
            );
        });
    }
}

exports.Monitoring = Monitoring;
