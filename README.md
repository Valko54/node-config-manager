# Config manager [![Build Status](https://travis-ci.org/Valko54/node-config-manager.svg)](https://travis-ci.org/Valko54/node-config-manager) [![Coverage Status](https://img.shields.io/coveralls/Valko54/node-config-manager.svg)](https://coveralls.io/r/Valko54/node-config-manager)

A configuration manager for NodeJS. It helps you to organize your project and the different configurations of your environments. 

## Installation
```
npm install --save node-config-manager
```

## Usage

* [Structure](#structure)
* [Initialize](#initialize)
	* [Environment variables](#environment-variables)
	* [Method init](#method-init)
* [Manage your configurations](#manage-your-configurations)
	* [Add a configuration](#add-a-configuration)
	* [Get a configuration](#get-a-configuration)
	* [Remove a configuration](#remove-a-configuration) 
* [Testing](#testing)

## Structure

In a project, it's often necessary to have multiple environments (test, development, preproduction, production, etc.). ConfigManager offers a simple and intuitive architecture to organize it.

<b>Example </b> :
```
config/ 
    release/        (release env)
        logger.yaml
        db.json
    develop/        (develop env)
        logger.json
        db.js
    test/           (test env)
        db.json
    logger.js       (default logger configuration)
    db.js           (default db configuration)
    lambda.json     (default lambda configuration)
```

The config directory can be overridden by environment variables (NODE_CONFIG_DIR='./config') or when ConfigManager is initialized (#[ConfigManager.prototype.init](#method-init)) .

## Initialize

### Environment variables
Name | Type | Default | Description 
-----------|-----------|------------|------------
NODE_CONFIG_DIR | String | ./config | Config directory path
NODE_ENV | String | -- | Node environment
NODE_CAMEL_CASE | Boolean | false | Naming convention of variables 

### Method init

If you don't like to configure with environment variables, you can initialize the different variables in JavaScript by using prototype init method.
```js
var cfgManager = require('node-config-manager'),
    options = {
		configDir: './config',
		env: 'test',
		camelCase: true
	};

cfgManager.init(options);
```

## Manage your configurations

After the configuration of the module, you can use the configuration store everywhere.

### Add a configuration

In the first step, ConfigManager will search for the config file which matches with the current environment.

<b>Example - </b> test environment :
```javascript
config/ 
  test/           (test env)
     db.json
  logger.js       (default logger configuration)
  db.js           (default db configuration)
```

```javascript
var cfgManager = require('node-config-manager');

cfgManager.addConfig('db') //Load config/test/db.json
		  .addConfig('logger'); // Load config/logger.js
```

In the second step, ConfigManager will replace the loaded configurations by environment variables if they exist.

<b>Example - </b> app.json :
```javascript
{
  "host": "localhost",
  "port": 80,
  "fstKey": {
	"sndKey": "custom_key_1",
	"copyHost": "custom_key_2"
  }
}
```
And with the following environment variables :
```javascript
export APP__HOST="127.0.0.1"
export APP__FST_KEY__SND_KEY="anyKey"
export APP__FST_KEY__COPY_HOST="${APP__HOST}"
```
Result : 
```javascript
{
  "host": "127.0.0.1",
  "port": 80,
  "fstKey": {
	"sndKey": "anyKey",
	"copyHost": "127.0.0.1"
  }
}
```

### Get a configuration

After adding your configuration, there are two methods to get your configuration :
```javascript
var appCfgByGetConfig = cfgManager.getConfig('app'),
	appCfgByMethod = cfgManager.method.App();

console.log(appCfgByGetConfig.host); //127.0.0.1
console.log(appCfgByMethod.port); //80
```

If the config doesn't exist : 
* first case : return "null",
* second case : throw exception "undefined is not a function"

### Remove a configuration

You can delete a configuration with the removeConfig method.

```javascript
cfgManager.removeConfig('app');
```

### Type inference for environment variables

Environment variables cannot be typed. ConfigManager will try to infere the type, for example `APP__HOST=127.0.0.1` will be parsed as a string and `APP_PORT=8080` as a number.  
You can override this type inference with type prefixes in environment variables : `APP_PORT=ncm_string:8080` will return a string instead of number. The following type prefixes are supported: 

* `ncm_string`
* `ncm_boolean`
* `ncm_number`

## Testing

From the repo root:

```
npm install
npm test
```
