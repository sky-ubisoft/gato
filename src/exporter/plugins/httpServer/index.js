const express = require('express');
const Joi = require('joi');
const app = express();
const { logger, levels } = require('../../../logger');

const DEFAULT_PORT = 8080;

const schema = Joi.object().keys({
    port: Joi.number().default(DEFAULT_PORT),
    type: Joi.string().valid('httpServer')
});

class HttpServerExporter {
    constructor(config) {
        const { error, value } = Joi.validate(config, schema);
        if (error) {
            logger.log({ level: levels.error, message: `HttpServerExporter:: Config validation error: ${error}` });            
            throw error;
        }        
        this.config = value;
        this.allStatus = {};
        const port = this.config.port || process.env.PORT || DEFAULT_PORT;
        app.get('/', (req, res) => {
            res.send(this.allStatus)
        });
        const listener = app.listen(port, () => {
            logger.log({ level: levels.info, message: `Web agent is listening on port ${port}` });
        });
        listener.on('error', err => {
            if (err.errno === 'EADDRINUSE') {
                logger.log({ level: levels.error, message: `Port ${port} already used` });
            } else {
                logger.log({ level: levels.error, message: `${err}` });
            }
        });
    }
    process(result, target) {
        this.allStatus[target.name] = result;
    }
}

exports.default = HttpServerExporter;