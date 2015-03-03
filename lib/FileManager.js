/* See LICENSE file for terms of use */
'use strict';

var fs = require('fs'),
    debug = require('debug')('configmanager:filemanager'),
    path = require('path'),
    error = require('./error');

var EXTENSION_AVAILABLE = ['.js', '.json'];

function FileManager(configDir, env) {
    if (arguments.length !== 2 ||
        'string' !== typeof configDir ||
        'string' !== typeof env) {
        throw new Error(error.BAD_PARAMETER);
    }

    debug('Create FileManager object to %s and %s/%s', configDir, configDir, env);

    this.configDir = configDir;
    this.env = env;
}

FileManager.prototype.getFile = function (name, justDefault) {
    var self = this,
        content = null,
        lookup = function (dir, file) {
            var i, filepath, find = false;
            for (i = 0; i < EXTENSION_AVAILABLE.length && find !== true; i++) {
                filepath = path.resolve(dir + '/' + file + EXTENSION_AVAILABLE[i]);
                debug('Lookup the config file : %s', filepath);
                find = fs.existsSync(filepath);
            }

            if (find) {
                return self.loadFile(filepath);
            } else {
                return null;
            }
        };

    justDefault = justDefault || false;

    if (!justDefault) {
        //Lookup the file in env folder
        content = lookup(path.resolve(this.configDir + '/' + this.env), name);
    }

    //Return result or lookup the file in config folder
    return content ? content : lookup(path.resolve(this.configDir), name);
};

FileManager.prototype.loadFile = require;

var fileManager = module.exports = FileManager;