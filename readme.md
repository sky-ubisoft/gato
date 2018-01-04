Gato
===================


Gato is an agent written is nodejs for collect, export your end-point

Design goals are to have a minimal memory footprint with a plugin system so that developers in the community can easily add support for new export or import plugins.

---------------------------------
Gato is plugin-driven and has the concept of 2 distinct plugins:

1. [Monitoring Plugins](#input-plugins) collect from various end-point
4. [Exporter Plugins](#output-plugins) write metrics to various destinations

----------
## Monitoring Plugins

* [Single page application](./src/monitorings/plugins/spa)
* [Api](./src/monitorings/plugins/api)

## Exporter Plugins

* [InfluxDb](./src/exporter/plugins/influxDb)
* [HttpServer](./src/exporter/plugins/httpServer)
* [Console](./src/exporter/plugins/stdout)

Example
-------------
Gato is a nodejs app, you will need node 6 minimum to run it.

```
git clone https://github.com/nicolasgere/gato.git
```

```
npm install
```

```
node src/index.js -c config.yml
```

config.yml:
```
targets:
  - type: sla
	name: app1
    url: "https://www.google.com",
    loadTimeout: 3000,
    interval: 60000,
    performance: true

exports:
  - type: httpServer
    port: 8080
  - type: stdout
    pretty: true
```

Result
-----------

```
{ 
  status: 500,
  loadingTime: 1189,
  loadEvent: false,
  url: 'http://httpstat.us/500',
  name: 'app2',
  jsError: false,
  ok: false
}
{ 
  status: 200,
  loadingTime: 1966,
  loadEvent: false,
  url: 'https://www.google.com',
  name: 'app1',
  jsError: false,
  ok: true
}
  ```
