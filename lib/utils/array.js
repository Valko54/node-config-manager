'use strict';

exports.contains = function(a, obj) {
	var i, length = a.length;
	for (i = 0; i < length; i++) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
};