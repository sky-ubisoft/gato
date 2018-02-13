const { logger, levels } = require('../logger');
const qrate = require('qrate');
const DEFAULT_CONCURRENCY = 3;

class Monitoring {
    constructor({ targets, gato }, exporter, browserFactory) {
        this.exporter = exporter;
        this.targets = targets;
        this.browserFactory = browserFactory;
        this.gato = gato;
        this._queues = {};
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

        this.targets.forEach(target => {
            const monitoringTypeOptions = this.gato && this.gato.monitoring && this.gato.monitoring[target.type] ? this.gato.monitoring[target.type] : {};
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
            const concurrency = monitoringTypeOptions.jobConcurrency ? monitoringTypeOptions.jobConcurrency : DEFAULT_CONCURRENCY;
            this._queues[target.type] = (qrate(this.interval, concurrency));
            this.exporter.prepProcessResult(target);
            setInterval(
                ({ queue, browser, exporter }) => {
                    logger.log({ level: levels.verbose, message: `Monitoring:: start - '${target.type}' queue: ${queue.length()}` });
                    queue.push({
                        target, MonitoringPlugin,
                        browser,
                        exporter
                    })
                },
                target.interval,
                {
                    queue: this._queues[target.type],
                    browser: this.browser,
                    exporter: this.exporter
                }
            );
        });
    }
}

exports.Monitoring = Monitoring;
