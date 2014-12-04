'use strict';

var expect = require('chai').expect;

var parserParameter = require('../../lib/parser/parameter');

describe('Parser.Parameter', function() {
    describe('#convertStrArrayToString', function() {
        it('should return camelCase string', function() {
            var strArray = [
                'ConVerT',
                'str',
                'aRrAy',
                'to',
                'STRING'
            ];
            var str = parserParameter.convertStrArrayToString(strArray, true);
            expect(str).to.equal('convertStrArrayToString');
        });
        it('should return underscore_case string', function() {
            var strArray = [
                'ConVerT',
                'str',
                'aRrAy',
                'to',
                'STRING'
            ];
            var str = parserParameter.convertStrArrayToString(strArray, false);
            expect(str).to.equal('convert_str_array_to_string');
        });
    });
    describe('#parse', function() {
        it('should return null when parameter is not an object', function() {
            expect(parserParameter.parse('string')).to.be.null();
        });
        it('should return camelCase JSON', function() {
            var res = {
                    logger: {
                        active: true,
                        withColor: false,
                        colors: {
                            blue: true,
                            red: false
                        }
                    },
                    db: {
                        hostname: 'localhost'
                    }
                },
                json = {
                    'LOGGER__ACTIVE': true,
                    'LOGGER__WITH_COLOR': false,
                    'LOGGER__COLORS__BLUE': true,
                    'LOGGER__COLORS__RED': false,
                    'DB__HOSTNAME': 'localhost'
                },
                obj = parserParameter.parse(json, true);

            expect(obj).to.deep.equal(res);
        });
        it('should return underscore_case JSON', function() {
            var res = {
                    main_one: {
                        level_one_one: {
                            level_two_one: false
                        },
                        level_one_two: {
                            level_two_one: true,
                            level_two_two: 'test'
                        }
                    },
                    main_two: {
                        level_one_one: {
                            level_two_one: {
                                level_three_one: 'test'
                            },
                            level_two_two: 'false'
                        }
                    }
                },
                json = {
                    'MAIN_ONE__LEVEL_ONE_ONE__LEVEL_TWO_ONE': false,
                    'MAIN_ONE__LEVEL_ONE_TWO__LEVEL_TWO_ONE': true,
                    'MAIN_ONE__LEVEL_ONE_TWO__LEVEL_TWO_TWO': '${ENV__TEST}',
                    'MAIN_TWO__LEVEL_ONE_ONE__LEVEL_TWO_ONE__LEVEL_THREE_ONE': '${ENV__TEST__SECOND}',
                    'MAIN_TWO__LEVEL_ONE_ONE__LEVEL_TWO_TWO': 'false'
                };

            process.env.ENV__TEST = 'test';
            process.env.ENV__TEST__SECOND = '${ENV__TEST}';

            expect(parserParameter.parse(json)).to.deep.equal(res);

            delete process.env.ENV__TEST;
            delete process.env.ENV__TEST__SECOND;
        });
        it('should return null when parameter is not an object', function() {
            var string = '{main_one: true,main_two: false}';

            expect(parserParameter.parse(string, false)).to.equal(null);
        });
    });
});