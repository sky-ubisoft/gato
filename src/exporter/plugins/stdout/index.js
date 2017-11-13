const Joi = require('Joi');

const schema = Joi.object().keys({
    pretty: Joi.boolean().default(false)
});

class StdoutExporter{
    constructor(config){
        const { error, value } = Joi.validate(config, schema);
        if(error) throw error
        this.config = value;
        this.pretty = this.config.pretty;
    }
    process(result,target){
        if(!this.pretty){
            console.log(result);   
        }else{
            console.dir(result, {depth: null, colors: true})
        }
    }
}

exports.default = StdoutExporter;
