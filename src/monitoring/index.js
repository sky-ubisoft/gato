class Monitoring {
    constructor({targets}, exporter, browserFactory) {
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
            } catch(e) {
                try {
                    monitoringPlugin = require(target.type);
                } catch(e) {
                console.error(`Plugins ${target.type} is not found, please install it`);
                process.exit(e.code);
                }
            }
            const monitoringInstance = new monitoringPlugin.default(target, this.exporter, this.browser);
            monitoringInstance.monitore().then();
        });
        process.on('exit', () => this.browser.close());
    }
}

exports.Monitoring = Monitoring
