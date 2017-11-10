const express = require('express');
const app = express()

class HttpServerExporter{
    constructor(config){
        this.allStatus = {};
        app.get('/', (req, res) => {
          res.send(this.allStatus)
        })
        app.listen(config.port, () => console.log('Web agent is listening on port ' + config.port ));
    }
    process(result,target){
        this.allStatus[target.name] = result;
    }
}

exports.HttpServerExporter = HttpServerExporter;