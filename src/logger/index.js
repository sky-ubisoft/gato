const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json()
});

const levels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly'
};

let consoleTransportConfig = {
  format: winston.format.simple(),
  level: 'error'
}
if (process.env.NODE_ENV !== 'production') {
  consoleTransportConfig = {
    format: winston.format.simple(),
    level: 'info'
  }
}
logger.add(new winston.transports.Console(consoleTransportConfig));

module.exports  = {
  logger,
  levels
};