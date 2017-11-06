class StdoutExporter{
    constructor(config){
        this.pretty = config.pretty;
    }
    process(result,target){
        if(!this.pretty){
            console.log(result);   
        }else{
            console.dir(result, {depth: null, colors: true})
        }
    }
}

exports.StdoutExporter = StdoutExporter;
