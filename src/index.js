
var { Exporter } = require('./exporter');
var { Monitoring } = require('./monitoring');
var { ConfigValidator } = require('./configValidator');

var argv = require('minimist')(process.argv.slice(2));
if (!argv.c) throw "-c Config file is needed"

const configPath = argv.c;
var configValidator = new ConfigValidator(configPath)

const config = configValidator.getConfig();

var exporter = new Exporter(config.exports);
var monitor = new Monitoring(config.targets, exporter);

monitor.start();
