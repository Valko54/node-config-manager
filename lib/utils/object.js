'use strict';

exports.isEmpty = function (obj) {
    // null and undefined are "empty"
    if (obj == null) {
        return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) {
        return false;
    }
    if (obj.length === 0) {
        return true;
    }

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        /* istanbul ignore else */
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
};

var extend = exports.extend = function (target, source) {
    target = target || {};
    source = source || {};

    for (var prop in source) {
        /* istanbul ignore else */
        if (source.hasOwnProperty(prop)) {
            if (source[prop] instanceof Array) {
                // don't edit Array object - just replace
                target[prop] = source[prop];
            } else if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};