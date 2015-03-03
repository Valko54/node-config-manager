'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    path = require('path');

var CONFIG_DIR = 'config/',
    NODE_ENV = 'test',
    error = require('../../lib/error'),
    rewire = require('rewire'),
    configManager = null;

describe('ConfigManager', function() {

    beforeEach(function() {
        configManager = rewire('../../lib/ConfigManager');
    });

    afterEach(function() {
        configManager = null;
    });

    describe('#new', function() {
        it('should return a ConfigManager instance', function() {
            assert.isNotNull(configManager);

            expect(configManager.store).to.be.a('object');
            expect(configManager.method).to.be.a('object');
            expect(configManager.env).to.be.a('string');
            expect(configManager.configDir).to.be.a('string');
            expect(configManager.camelCase).to.be.a('boolean');

            expect(configManager.env).to.equal(NODE_ENV);
        });
    });
    describe('#prototype.init', function() {
        it('should return an error - configManager.count() > 0', function() {

            //Mock result of count function
            configManager.count = function() {
                return 1;
            };

            expect(configManager.init.bind(configManager)).to.throw(error.MANAGER_CAN_NOT_BE_INITIALIZE_ANYMORE);
        });
        it('should have default settings - without options', function() {
            configManager.init();

            //Camel case has its default value
            expect(configManager.camelCase).to.equal(false);
        });
        it('should have custom value for camelCase', function() {
            configManager.init({
                camelCase: true
            });

            //Camel case has a new value
            expect(configManager.camelCase).to.equal(true);
        });
        it('should have custom value for env', function() {
            var newEnv = 'develop';

            configManager.init({
                env: newEnv
            });

            //Camel case has a new value
            expect(configManager.env).to.equal(newEnv);
        });
        it('should have custom value for configDir', function() {
            var rootConfig = '/config';

            configManager.init({
                configDir: rootConfig
            });

            //Camel case has a new value
            expect(configManager.configDir).to.equal(rootConfig);
        });
    });
    describe('#prototype.set', function() {
        it('should return an error - bad parameter without parameter', function() {
            expect(configManager.set.bind(configManager)).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - bad parameter with invalid key', function() {
            expect(configManager.set.bind(configManager, {}, {})).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - key doesn\'t exist', function() {
            expect(configManager.set.bind(configManager, 'lambda', true)).to.throw(error.OPTION_NOT_EXISTS);
        });
        describe('configDir option', function() {
            var option = 'configDir';
            it('should return an error - bad value', function() {
                expect(configManager.set.bind(configManager, option, {})).to.throw(error.BAD_TYPE_MUST_BE_STRING);
            });
            it('should have custom value for configDir', function() {
                var rootConfig = '/config/';

                configManager.set(option, rootConfig);

                expect(configManager[option]).to.equal(rootConfig);
            });
        });
        describe('env option', function() {
            var option = 'env';
            it('should return an error - bad value', function() {
                expect(configManager.set.bind(configManager, option, {})).to.throw(error.BAD_TYPE_MUST_BE_STRING);
            });
            it('should have custom value for env', function() {
                var env = 'develop';

                configManager.set(option, env);

                expect(configManager[option]).to.equal(env);
            });
        });
        describe('camelCase option', function() {
            var option = 'camelCase';
            it('should return an error - bad value', function() {
                expect(configManager.set.bind(configManager, option, {})).to.throw(error.BAD_TYPE_MUST_BE_BOOLEAN);
            });
            it('should have custom value for camelCase', function() {
                var flag = true;

                configManager.set(option, flag);

                expect(configManager[option]).to.equal(flag);
            });
        });
        it('set two options', function() {
            configManager
                .set('camelCase', true)
                .set('configDir', '/config/');

            expect(configManager.camelCase).to.equal(true);
            expect(configManager.configDir).to.equal('/config/');
        });
    });
    describe('#prototype.get', function() {
        it('should return an error - bad parameter without parameter', function() {
            expect(configManager.get.bind(configManager)).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - bad parameter with invalid key', function() {
            expect(configManager.get.bind(configManager, {})).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - key doesn\'t exist', function() {
            expect(configManager.get.bind(configManager, 'lambda')).to.throw(error.OPTION_NOT_EXISTS);
        });
        it('should return an option - key configDir', function() {
            expect(configManager.get('configDir')).to.be.a('string');
        });
    });
    describe('#prototype.addConfig', function() {
        it('should return an error - bad parameter without parameter', function() {
            expect(configManager.addConfig.bind(configManager)).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - bad parameter with invalid configName', function() {
            expect(configManager.addConfig.bind(configManager, {})).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - config doesn\'t exist', function() {
            var loggerMock = 'logger',
                fileManagerMock = {
                    configDir: path.resolve(process.cwd(), CONFIG_DIR) + '/',
                    env: NODE_ENV,
                    getFile: function(path) {
                        return null;
                    }
                };

            configManager.__set__('fileManager', fileManagerMock);

            expect(configManager.addConfig.bind(configManager, loggerMock)).to.throw(error.CONFIG_NOT_EXISTS);
        });
        it('should add new config to store', function() {
            var loggerMock = 'logger',
                methodMock = 'Logger',
                contentMock = {
                    content: 'mock'
                },
                fileManagerMock = {
                    configDir: path.resolve(process.cwd(), CONFIG_DIR) + '/',
                    env: NODE_ENV,
                    getFile: function(path) {
                        return contentMock;
                    }
                };

            configManager.__set__('fileManager', fileManagerMock);

            //Add logger
            configManager.addConfig(loggerMock);

            expect(configManager.store[loggerMock]).to.equal(contentMock);
            expect(configManager.method[methodMock]()).to.equal(contentMock);
            expect(configManager.count()).to.equal(1);
        });
        it('should return an error - config already exists', function() {
            var loggerMock = 'logger',
                contentMock = {
                    content: 'mock'
                },
                fileManagerMock = {
                    configDir: path.resolve(process.cwd(), CONFIG_DIR) + '/',
                    env: NODE_ENV,
                    getFile: function(path) {
                        return contentMock;
                    }
                };

            configManager.__set__('fileManager', fileManagerMock);

            //Add logger
            configManager.addConfig(loggerMock);
            expect(configManager.count()).to.equal(1);
            expect(configManager.addConfig.bind(configManager, loggerMock)).to.throw(error.CONFIG_ALREADY_LOADED);
            expect(configManager.count()).to.equal(1);
        });
        it('should add new config to store with env args', function() {
            var loggerMock = 'logger',
                contentMock = {
                    content: 'mock',
                    override: false,
                    pros: {
                        ok: true
                    }
                },
                fileManagerMock = {
                    configDir: path.resolve(process.cwd(), CONFIG_DIR) + '/',
                    env: NODE_ENV,
                    getFile: function(path) {
                        return contentMock;
                    }
                },
                envArgs = {
                    'NODE_ENV': 'test',
                    'LOGGER__WITH_COLOR': 'true',
                    'LOGGER__OVERRIDE': true,
                    'LOGGER__PROS__NOTOK': false,
                    'DB__DATABASE': 'hostname'
                },
                fullContentMock = {
                    content: 'mock',
                    with_color: true,
                    override: true,
                    pros: {
                        ok: true,
                        notok: false
                    }
                };

            configManager.__set__('fileManager', fileManagerMock);
            configManager.__set__('envArgs', envArgs);

            //Add logger
            configManager.addConfig(loggerMock);

            expect(configManager.store[loggerMock]).to.deep.equal(fullContentMock);
            expect(configManager.count()).to.equal(1);
        });
    });
    describe('#prototype.removeConfig', function() {
        it('should return an error - bad parameter without parameter', function() {
            expect(configManager.removeConfig.bind(configManager)).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - bad parameter with invalid configName', function() {
            expect(configManager.removeConfig.bind(configManager, {})).to.throw(error.BAD_PARAMETER);
        });
        it('should return an error - config is not loaded', function() {
            expect(configManager.removeConfig.bind(configManager, 'logger')).to.throw(error.CONFIG_NOT_LOADED);
        });
        it('should delete logger config', function() {
            var loggerMock = 'logger',
                methodMock = 'Logger',
                contentMock = {
                    content: 'mock'
                },
                fileManagerMock = {
                    configDir: path.resolve(process.cwd(), CONFIG_DIR) + '/',
                    env: NODE_ENV,
                    getFile: function(path) {
                        return contentMock;
                    }
                };

            configManager.__set__('fileManager', fileManagerMock);

            configManager.addConfig(loggerMock);

            expect(configManager.getConfig(loggerMock)).to.equal(contentMock);
            expect(configManager.method[methodMock]()).to.equal(contentMock);
            expect(configManager.count()).to.equal(1);

            configManager.removeConfig(loggerMock);

            assert.isUndefined(configManager.getConfig(loggerMock));
            assert.isFalse(configManager.method.hasOwnProperty(methodMock));
            expect(configManager.count()).to.equal(0);
        });
    });
});