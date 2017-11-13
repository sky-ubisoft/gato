
const { Exporter } = require('./exporter');
const { Monitoring } = require('./monitoring');
const { ConfigValidator } = require('./configValidator');
const { BrowserFactory } = require('./browserFactory.js');

var argv = require('minimist')(process.argv.slice(2));
if (!argv.c) throw "-c Config file is needed"

const configPath = argv.c;
var configValidator = new ConfigValidator(configPath)

const config = configValidator.getConfig();

const browserFactory = new BrowserFactory(config.gato);
const exporter = new Exporter(config.exports);
const monitor = new Monitoring(config, exporter, browserFactory);

monitor.start();
