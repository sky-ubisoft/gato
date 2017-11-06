Gato, web-app monitoring
===================


Gato allow your to monitore your webapp, exporte and expose metrics in multiple way

----------


Exemple
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
  - name: app1
    url: "https://www.google.com",
    loadTimeout: 3000,
    interval: 60000,
    performance: true
  - name: app2
    url: "http://httpstat.us/500"

exports:
  httpServer:
    port: 8080
  stdout:
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
