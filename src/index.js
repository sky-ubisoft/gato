
const { Exporter } = require('./exporter');
const { Monitoring } = require('./monitoring');
const { ConfigValidator } = require('./configValidator');
const { BrowserFactory } = require('./browserFactory.js');
const { logger, levels } = require('./logger');

var argv = require('minimist')(process.argv.slice(2));
if (!argv.c) throw "-c Config file is needed"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const configPath = argv.c;
var configValidator = new ConfigValidator(configPath)

const config = configValidator.getConfig();

const browserFactory = new BrowserFactory(config.gato);
const exporter = new Exporter(config.exports);
const monitor = new Monitoring(config, exporter, browserFactory);

process.on('uncaughtException', err => {
    logger.log({ level: levels.error, message: `${err}` })
});

monitor.start();
