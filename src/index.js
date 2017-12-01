const { Exporter } = require('./exporter');
const { Monitoring } = require('./monitoring');
const { ConfigValidator } = require('./tools/configValidator');
const { BrowserFactory } = require('./tools/browserFactory');
const { logger, levels } = require('./logger');

const start = (configPath) => {
    const argv = require('minimist')(process.argv.slice(2));
    configPath = configPath || argv.c;
    if (!configPath) throw new Error('-c Config file is needed')

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const configValidator = new ConfigValidator(configPath);
    const config = configValidator.getConfig();
    const browserFactory = new BrowserFactory(config.gato);
    const exporter = new Exporter(config.exports);
    const monitor = new Monitoring(config, exporter, browserFactory);

    process.on('uncaughtException', err =>
        logger.log({ level: levels.error, message: `${err}` })
    );

    monitor.start();
};

module.exports = { start };
