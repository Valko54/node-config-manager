'use strict';

var expect = require('chai').expect,
    uObject = require('../../lib/utils/object');

describe('Util.Object', function () {
    describe('#isEmpty', function () {
        it('should return true - object is null', function () {
            expect(uObject.isEmpty(null)).to.equal(true);
        });
        it('should return false - object.length > 0', function () {
            var obj = {};

            Object.defineProperty(obj, 'length', {
                get: function () {
                    return 1;
                }
            });

            expect(uObject.isEmpty(obj)).to.equal(false);
        });
        it('should return true - object.length === 0', function () {
            var obj = {};

            Object.defineProperty(obj, 'length', {
                get: function () {
                    return 0;
                }
            });

            expect(uObject.isEmpty(obj)).to.equal(true);
        });
        it('should return false - object.length is wrong and object is not empty', function () {
            var obj = {
                test: 'test'
            };

            Object.defineProperty(obj, 'length', {
                get: function () {
                    return -1;
                }
            });

            expect(uObject.isEmpty(obj)).to.equal(false);
        });
        it('should return true - object.length is wrong and object is empty', function () {
            var obj = {};

            Object.defineProperty(obj, 'length', {
                get: function () {
                    return -1;
                }
            });

            expect(uObject.isEmpty(obj)).to.equal(true);
        });
    });
    describe('#extend', function () {
        it('should return an empty object', function () {
            expect(uObject.extend()).to.deep.equal({});
        });
        it('should return a clone of source - target null', function () {
            var mock = {
                test: 'test'
            };
            expect(uObject.extend(null, mock)).to.deep.equal(mock);
        });
        it('should return a clone of source - target is empty', function () {
            var mock = {
                test: 'test'
            };
            expect(uObject.extend({}, mock)).to.deep.equal(mock);
        });
        it('should return an object extended', function () {
            var srcMock = {
                    test: {
                        test: 'test'
                    },
                    array: [
                        {test: 0},
                        {test: 1},
                        {test: 2}
                    ]
                },
                tgtMock = {
                    _test: 'test',
                    array: [
                        {test: 3},
                        {test: 4}
                    ]
                },
                resMock = {
                    test: {
                        test: 'test'
                    },
                    array: [
                        {test: 0},
                        {test: 1},
                        {test: 2}
                    ],
                    _test: 'test'
                };

            expect(uObject.extend(tgtMock, srcMock)).to.deep.equal(resMock);
        });
    });
});