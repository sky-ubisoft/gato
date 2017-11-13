const express = require('express');
const Joi = require('joi');
const app = express();

const schema = Joi.object().keys({
    port: Joi.number().default(8080),
    type: Joi.string()
});

class HttpServerExporter{
    constructor(config){
        const { error, value } = Joi.validate(config, schema);
        if(error) throw error
        this.config = value;
        this.allStatus = {};
        app.get('/', (req, res) => {
          res.send(this.allStatus)
        })
        app.listen(this.config.port, () => console.log('Web agent is listening on port ' + this.config.port ));
    }
    process(result,target){
        this.allStatus[target.name] = result;
    }
}

exports.default = HttpServerExporter;