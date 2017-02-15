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

var parseNumber = function(value) {
    return (value % 1 === 0 ? parseInt(value) : parseFloat(value));
};

var valueFromTypeInference = function(value) {
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
                value = isNaN(value) ? value : parseNumber(value);
            }
            break;
    }
    return value;
};

var valueFromTypePrefix = function(value) {
    var matches = value.match(typePrefixRegex),
        type = matches[1],
        val = matches[2];
    switch(type){
        case 'string':
            value = val;
            break;
        case 'boolean':
            value = (val === 'true');
            break;
        case 'number':
            value = parseNumber(val);
            break;
        default:
            // Should not happen thanks to regexp
            value = null;
            break;
    }
    return value;
};

var typePrefixRegex = /^ncm_(string|number|boolean):(.*)$/;
var validateValue = function(value) {
    if(value.search && value.search(typePrefixRegex)>=0){
        // Value has type prefix (`ncm_(string|numnber|boolean)`), use type prefix to parse data
        value = valueFromTypePrefix(value);
    }
    else
        // No type prefix, use type inference
        value = valueFromTypeInference(value);
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