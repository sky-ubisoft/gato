var express = require('express');

class HttpServerExporter{
    constructor(config){
        this.allStatus = {};
        var app = express()
        app.get('/', function (req, res) {
          res.send(this.allStatus)
        })
        app.listen(config.port, () => console.log('Exporter is listening port ' + config.port ))
    }
    process(result,target){
        this.allStatus[target.name] = result;
    }
}

exports.HttpServerExporter = HttpServerExporter;