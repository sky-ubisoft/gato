const winston = require('winston');

const levels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly'
};

const format = winston.format;

const logger = winston.createLogger({
  level: levels.info,
  format: format.simple()
});

const consoleTransportConfig = {
  level: process.env.NODE_ENV === 'production'
    ? levels.info
    : levels.debug
}
logger.add(new winston.transports.Console(consoleTransportConfig));

module.exports = {
  logger,
  levels
};