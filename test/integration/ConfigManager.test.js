'use strict';

var expect = require('chai').expect;

var NODE_ENV = 'test',
    CONFIG_DIR = 'test/integration/config',
    error = require('../../lib/error'),
    uObject = require('../../lib/utils/object'),
    ConfigManager = require('../../lib/ConfigManager'),
    configManager = null;

describe('ConfigManager - Integration Test', function () {
    beforeEach(function () {
        configManager = new ConfigManager.ConfigManager();
    });

    afterEach(function () {
        configManager = null;
    });

    describe('#prototype.addConfig', function () {
        it('should return an error - No config file', function () {
            var lambdaMock = 'lambda';

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV
            });

            //Add config
            expect(configManager.addConfig.bind(configManager, lambdaMock)).to.throw(error.CONFIG_NOT_EXISTS);
        });
        it('should add new config to store - env config file', function () {
            var loggerMock = 'logger',
                methodMock = 'Logger',
                file = require('./config/test/' + loggerMock),
                defaultFile = require('./config/' + loggerMock);

            uObject.extend(defaultFile, file);
            file = defaultFile;

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV
            });

            //Add config
            configManager.addConfig(loggerMock);

            expect(configManager.store[loggerMock]).to.deep.equal(file);
            expect(configManager.method[methodMock]()).to.deep.equal(file);
            expect(configManager.count()).to.equal(1);
        });
        it('should add new config to store - default config file', function () {
            var dbMock = 'db',
                methodMock = 'Db',
                file = require('./config/' + dbMock);

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV
            });

            //Add config
            configManager.addConfig(dbMock);

            expect(configManager.store[dbMock]).to.deep.equal(file);
            expect(configManager.method[methodMock]()).to.deep.equal(file);
            expect(configManager.count()).to.equal(1);
        });
        it('should add new yaml config to store - default config file', function () {
            var mailMock = 'mail',
                methodMock = 'Mail',
                fileMock = {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'user@gmail.com',
                        pass: 'pass'
                    },
                    attachments: [
                        {
                            filename: 'fileName.txt',
                            content: 'Hello world!'
                        },
                        {
                            filename: 'fileName.yml'
                        }
                    ]
                };

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV
            });

            //Add config
            configManager.addConfig(mailMock);

            expect(configManager.store[mailMock]).to.deep.equal(fileMock);
            expect(configManager.method[methodMock]()).to.deep.equal(fileMock);
            expect(configManager.count()).to.equal(1);
        });
        it('should add new config to store - just env variables (camelCase)', function () {
            var otherMock = 'other',
                methodMock = 'Other',
                res = {
                    user: {
                        firstName: 'Damien',
                        lastName: 'Picard',
                        sex: 'M'
                    },
                    group: {
                        status: 'Engineer'
                    }
                };

            //Env
            process.env.OTHER__USER__LAST_NAME = 'Picard';
            process.env.OTHER__USER__FIRST_NAME = 'Damien';
            process.env.OTHER__USER__SEX = 'M';
            process.env.OTHER__GROUP__STATUS = 'Engineer';

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV,
                camelCase: true
            });

            //Add config
            configManager.addConfig(otherMock);

            expect(configManager.store[otherMock]).to.deep.equal(res);
            expect(configManager.method[methodMock]()).to.deep.equal(res);
            expect(configManager.count()).to.equal(1);
        });
        it('should add new config to store - just env variables (underscore_case)', function () {
            var otherMock = 'other',
                methodMock = 'Other',
                res = {
                    user: {
                        first_name: 'Damien',
                        last_name: 'Picard',
                        sex: 'M'
                    },
                    group: {
                        status: 'Engineer'
                    }
                };

            //Env
            process.env.OTHER__USER__LAST_NAME = 'Picard';
            process.env.OTHER__USER__FIRST_NAME = 'Damien';
            process.env.OTHER__USER__SEX = 'M';
            process.env.OTHER__GROUP__STATUS = 'Engineer';

            //Init
            configManager.init({
                configDir: CONFIG_DIR,
                env: NODE_ENV,
                camelCase: false
            });

            //Add config
            configManager.addConfig(otherMock);

            expect(configManager.store[otherMock]).to.deep.equal(res);
            expect(configManager.method[methodMock]()).to.deep.equal(res);
            expect(configManager.count()).to.equal(1);
        });
    });
});