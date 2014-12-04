'use strict';

var error = require('../error');

exports.parse = function(json, camelCase) {
    if ('object' !== typeof json) {
        return null;
    }

    camelCase = camelCase || false;

    //Get keys
    var levels, value, attr, _pObject, pObject,
        object = {},
        keys = Object.keys(json);

    keys.forEach(function(key) {
        value = json[key];

        //split levels
        levels = key.split('__');

        //Back to top
        _pObject = pObject = object;
        attr = null;

        levels.forEach(function(level) {
            attr = convertStrArrayToString(level.split('_'), camelCase);

            //Persist
            _pObject = pObject;

            //New Object
            pObject[attr] = pObject[attr] || {};
            pObject = pObject[attr];
        });

        //Save value
        /* istanbul ignore else */
        if (_pObject && attr) {
            _pObject[attr] = validateValue(processTag(value));
        }
    });

    return object;
};

var validateValue = function(value) {
    switch (value) {
        case 'true':
            value = true;
            break;
        case 'false':
            value = false;
            break;
        default:
            if ('string' === typeof value) {
                //String or Number
                value = isNaN(value) ? value : (value % 1 === 0 ? parseInt(value) : parseFloat(value));
            }
            break;
    }
    return value;
};

var convertStrArrayToString =
    exports.convertStrArrayToString = function(strArray, camelCase) {
        var i,
            length = strArray.length,
            str = '';

        for (i = 0; i < length; i++) {
            if (camelCase) {
                str += (i === 0 ? strArray[i].toLowerCase() : strArray[i].charAt(0).toUpperCase() + strArray[i].slice(1).toLowerCase());
            } else {
                str += (i === 0 ? strArray[i].toLowerCase() : '_' + strArray[i].toLowerCase());

            }
        }

        return str;
    };

var tagRegex = /\$\{[a-zA-Z_]+\}/,
    resolveRegex = /[a-zA-Z_]+/;

var processTag =
    exports.processTag = function(str) {
        if ('string' !== typeof str) {
            return str;
        }

        var tag;
        while (str.search(tagRegex) >= 0) {
            tag = str.match(tagRegex)[0];
            str = str.replace(tag, resolveTag(tag), 'g');
        }
        return str;
    };

var resolveTag = function(tag) {
    //Extract a-zA-Z_
    var extract = tag.match(resolveRegex),
        resolved = process.env[extract];
    if (resolved) {
        return resolved;
    } else {
        throw new Error(error.TAG_UNKNOWN + tag);
    }
};