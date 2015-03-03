/* See LICENSE file for terms of use */
'use strict';

// import libraries
var path = require('path'),
    debug = require('debug')('configmanager:configmanager'),
    error = require('./error'),
    uObject = require('./utils/object'),
    uArray = require('./utils/array'),
    FileManager = require('./FileManager'),
    parser = require('./parser/parameter');

/**
 * STATIC (default)
 **/
var DEFAULT_CONFIG_DIR = 'config/',
    DEFAULT_ENV = '',
    DEFAULT_CAMELCASE = false;

//List of key availables
var keys = ['configDir', 'env', 'camelCase'],
    envArgs = process.env,
    fileManager = null;

/**
 * ConfigManager constructor.
 *
 * The export object of the 'ConfigManager' module is an instance of this class
 * Most apps will only use this one instance
 *
 * @api public
 */
function ConfigManager() {
    //Init store and method variables
    this.store = {};
    this.method = {};

    //Load config directory
    this.configDir = envArgs.NODE_CONFIG_DIR;

    if (!this.configDir || 'string' !== typeof this.configDir) {
        this.configDir = path.resolve(process.cwd(), DEFAULT_CONFIG_DIR) + '/';
    } else {
        this.configDir = path.resolve(this.configDir) + '/';
    }

    //Load env
    this.env = envArgs.NODE_ENV;

    if (!this.env || 'string' !== typeof this.env) {
        this.env = DEFAULT_ENV;
    }

    //Default options
    this.camelCase = envArgs.NODE_CAMEL_CASE;

    switch (this.camelCase) {
        case 'true':
            this.camelCase = true;
            break;
        case 'false':
            this.camelCase = false;
            break;
        default:
            if (!this.camelCase || 'boolean' !== typeof this.camelCase) {
                this.camelCase = DEFAULT_CAMELCASE;
            }
            break;
    }

    debug('Create ConfigManager object [configDir: %s | env: %s | camelCase: %s]', this.configDir, this.env, this.camelCase);
}

/**
 * ConfigManager constructor
 *
 * The exports of the config manager module is an instance of this class.
 *
 * ####Example:
 * var configManager = require('configManager');
 * var configManager2 = new configManager.ConfigManager();
 *
 * @method ConfigManager
 *
 * @api public
 */

ConfigManager.prototype.ConfigManager = ConfigManager;

/**
 * ConfigManager initialization
 *
 * ####Example:
 * configManager.init({
 *    configDir: '~/Desktop/config',
 *    env: 'develop',
 *    camelCase: true
 * });
 *
 * @param {Object} options
 * @method init
 *
 * @api public
 */
ConfigManager.prototype.init = function (options) {
    if (this.count() > 0) {
        throw new Error(error.MANAGER_CAN_NOT_BE_INITIALIZE_ANYMORE);
    }

    options = options || {};

    //Load options
    this.configDir = options.configDir ? options.configDir : this.configDir;
    this.env = options.env ? options.env : this.env;
    this.camelCase = options.camelCase ? options.camelCase : this.camelCase;

    debug('Initialization of the ConfigManager object [configDir: %s | env: %s | camelCase: %s]', this.configDir, this.env, this.camelCase);
    return this;
};

/**
 *  Sets ConfigManager options
 *
 * ####Example:
 * configManager.set('configDir','~/Desktop/config');
 * configManager
 *  .set('configDir', '~/Desktop/config')
 *  .set('camelCase', true);
 *
 * @param {String} key
 * @param {String} value
 * @method set
 *
 * @api public
 */
ConfigManager.prototype.set = function (key, value) {
    if (arguments.length < 2 || 'string' !== typeof key) {
        throw new Error(error.BAD_PARAMETER);
    }

    switch (key) {
        case keys[0]:
            //configDir
            if ('string' !== typeof value) {
                throw new Error(error.BAD_TYPE_MUST_BE_STRING + value);
            }
            this.configDir = path.resolve(value) + '/';
            break;
        case keys[1]:
            //env
            if ('string' !== typeof value) {
                throw new Error(error.BAD_TYPE_MUST_BE_STRING + value);
            }
            this.env = value;

            break;
        case keys[2]:
            //camelCase
            if ('boolean' !== typeof value) {
                throw new Error(error.BAD_TYPE_MUST_BE_BOOLEAN + value);
            }
            this.camelCase = value;

            break;
        default:
            throw new Error(error.OPTION_NOT_EXISTS);
    }

    return this;
};

/**
 * Gets ConfigManager options
 *
 * ####Example:
 * configManager.get('camelCase');
 *
 * @param {String} key
 * @method get
 *
 * @api public
 */
ConfigManager.prototype.get = function (key) {
    if (arguments.length < 1 || 'string' !== typeof key) {
        throw new Error(error.BAD_PARAMETER);
    }

    if (!uArray.contains(keys, key)) {
        throw new Error(error.OPTION_NOT_EXISTS);
    }

    return this[key];
};

/**
 * Add new config to ConfigManager store
 *
 * First step : Lookup your config file in relation to your current environment
 * ${configDir}/${env}/configName.(js | json)
 *
 * First step bis : If 'configName' has not a specific file for your current environment, the system takes your default configuration.
 * ${configDir}/configName.(js | json)
 *
 * Second step : Each configuration is customizable by environment variables.
 * LOGGER__ACTIVE=true              => {'logger': {'active': true}}
 * LOGGER__WITH_COLOR=false         => {'logger': {'with_color': false}}
 * LOGGER__DEBUG__MAX_SIZE=4096     => {'logger': {'debug': {'max_size': 4096}}}
 *
 * Third step : Save config in the store
 *
 * ####Example:
 * configName : 'logger'      envArgs : {LOGGER__ACTIVE: true, LOGGER__WITH_COLOR: false, DB__HOSTNAME: 'localhost'}
 * #1 Get content file :
 *
 * config = {
 *      active: false,
 *      level: 'debug'
 * }
 *
 * #2 Result after overriding by environment variables :
 *
 * config = {
 *      active: true,
 *      level: 'debug',
 *      with_color: false
 * }
 *
 * #3 this.store['logger'] = config;
 *
 * @param {String} configName
 * @method addConfig
 *
 * @api public
 */
ConfigManager.prototype.addConfig = function (configName) {
    if (arguments.length < 1 || 'string' !== typeof configName) {
        throw new Error(error.BAD_PARAMETER);
    }

    //Check if already exists
    if (this.store.hasOwnProperty(configName)) {
        throw new Error(error.CONFIG_ALREADY_LOADED + configName);
    }

    //Load config from config files
    if (!fileManager ||
        fileManager.configDir !== this.configDir ||
        fileManager.env !== this.env) {
        fileManager = new FileManager(this.configDir, this.env);
    }

    //Load config and defaultConfig
    var config = fileManager.getFile(configName) || {};
    var defaultConfig = fileManager.getFile(configName, true) || {};

    //Load envConfig with the environment variables
    var regex = new RegExp('^' + configName.toUpperCase() + '__'),
        data = {},
        envConfig;

    for (var propEnv in envArgs) {
        if (envArgs.hasOwnProperty(propEnv) && propEnv.match(regex)) {
            data[propEnv] = envArgs[propEnv];
        }
    }

    envConfig = parser.parse(data, this.camelCase)[configName];

    //Override defaultConfig with config
    uObject.extend(defaultConfig, config);
    config = defaultConfig;

    //Override config with envConfig
    uObject.extend(config, envConfig);

    if (!uObject.isEmpty(config)) {
        //Add new config to store
        this.store[configName] = config;

        //Create method
        var methodName = configName.charAt(0).toUpperCase() + configName.slice(1).toLowerCase(),
            self = this;

        this.method[methodName] = function () {
            return self.store[configName];
        };
        return this;
    } else {
        throw new Error(error.CONFIG_NOT_EXISTS + configName);
    }
};

/**
 * Remove the 'configName' config from ConfigManager store
 *
 * @param {String} configName
 * @method removeConfig
 *
 * @api public
 */
ConfigManager.prototype.removeConfig = function (configName) {
    if (arguments.length < 1 || 'string' !== typeof configName) {
        throw new Error(error.BAD_PARAMETER);
    }

    //Check if the config exists
    if (this.store.hasOwnProperty(configName)) {
        //Delete the sconfig from store
        delete this.store[configName];

        //Delete method
        var methodName = configName.charAt(0).toUpperCase() + configName.slice(1).toLowerCase();
        delete this.method[methodName];

        return this;
    } else {
        throw new Error(error.CONFIG_NOT_LOADED + configName);
    }
};

/**
 * Get the 'configName' config from ConfigManager store
 *
 * @param {String} configName
 * @method getConfig
 *
 * @api public
 */
ConfigManager.prototype.getConfig = function (configName) {
    return this.store[configName];
};

/**
 * Gets the number of configurations from store
 *
 * @method count
 *
 * @api public
 */
ConfigManager.prototype.count = function () {
    return Object.keys(this.store).length;
};

var configManager = module.exports = new ConfigManager();