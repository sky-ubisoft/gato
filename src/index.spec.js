jest.mock('./exporter', () => {
    return { Exporter: jest.fn() }
});
jest.mock('./monitoring', () => {
    return {
        Monitoring: jest.fn(() => {
            return { start: jest.fn() };
        })
    }
});
jest.mock('./tools/configValidator', () => {
    return {
        ConfigValidator: jest.fn(() => {
            return {
                getConfig: jest.fn(() => {
                    return { gato: jest.fn(), exports: jest.fn(), browserFactory: jest.fn() };
                })
            }
        })
    }
});
jest.mock('./tools/browserFactory', () => {
    return { BrowserFactory: jest.fn() };
});
jest.mock('./logger', () => {
    return { logger: jest.fn(), levels: jest.fn() };
});

const { start } = require('./index');

describe('index.js', () => {
    describe('start', () => {
        test('start is unsuccessfull without method parameter nor argv', () => {
            expect(() => start()).toThrow(new Error('-c Config file is needed'));
        });
        test('start is successfull with method parameter and start monitoring', () => {
            start('./example/config.yml');
        });
    })
})