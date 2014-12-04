'use strict';

var expect = require('chai').expect,
    uArray = require('../../lib/utils/array');

describe('Util.Array', function() {
    describe('#contains', function() {
        it('should return true', function() {
            var str = 'test',
                array = [str];

            expect(uArray.contains(array, str)).to.equal(true);
        });
        it('should return false', function() {
            var str = 'test',
                array = ['testo'];
            expect(uArray.contains(array, str)).to.equal(false);
        });
    });
});