const puppeteer = require('puppeteer');
const { ApiMonitoring } = require('./api.monitoring.js');
const { SpaMonitoring } = require('./spa.monitoring.js');

class Monitoring {
    constructor(check, exporter) {
        this.exporter = exporter;
        this.check = check;
    }
    async start() {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        this.check.forEach(service => {
            let MonitoringClass;
            switch (service.type) {
                case 'api':
                    MonitoringClass = ApiMonitoring;
                    break;
                default:
                case 'spa':
                    MonitoringClass = SpaMonitoring;
                    break;
            }
            const monitoringInstance = new MonitoringClass(this.check, this.exporter);
            monitoringInstance.monitore(browser, service).then();
        });
    }
}

exports.Monitoring = Monitoring
