const winston = require('winston');

const levels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly'
};
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'error'
    })
  ]
});

module.exports = {
  logger,
  levels
};