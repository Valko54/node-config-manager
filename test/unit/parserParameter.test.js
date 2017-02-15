'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert;

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
            assert.isNull(parserParameter.parse('string'));
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
                            level_two_two: false
                        },
                        level_one_two: false
                    },
                    main_three: 400,
                    main_four: 12.40,
                    main_five: '127.0.0.1'
                },
                json = {
                    'MAIN_ONE__LEVEL_ONE_ONE__LEVEL_TWO_ONE': false,
                    'MAIN_ONE__LEVEL_ONE_TWO__LEVEL_TWO_ONE': true,
                    'MAIN_ONE__LEVEL_ONE_TWO__LEVEL_TWO_TWO': '${ENV__TEST}',
                    'MAIN_TWO__LEVEL_ONE_ONE__LEVEL_TWO_ONE__LEVEL_THREE_ONE': '${ENV__TEST__SECOND}',
                    'MAIN_TWO__LEVEL_ONE_ONE__LEVEL_TWO_TWO': 'false',
                    'MAIN_TWO__LEVEL_ONE_TWO': '${ENV__TEST__BOOLEAN_SECOND}',
                    'MAIN_THREE': '${ENV__TEST__NUMBER}',
                    'MAIN_FOUR': '${ENV__TEST__FLOAT}',
                    'MAIN_FIVE': '${ENV__TEST__IP}'
                };

            process.env.ENV__TEST = 'test';
            process.env.ENV__TEST__SECOND = '${ENV__TEST}';
            process.env.ENV__TEST__BOOLEAN = 'false';
            process.env.ENV__TEST__BOOLEAN_SECOND = '${ENV__TEST__BOOLEAN}';
            process.env.ENV__TEST__NUMBER = '400';
            process.env.ENV__TEST__FLOAT = '12.40';
            process.env.ENV__TEST__IP = '127.0.0.1';

            expect(parserParameter.parse(json)).to.deep.equal(res);

            delete process.env.ENV__TEST;
            delete process.env.ENV__TEST__SECOND;
            delete process.env.ENV__TEST__BOOLEAN;
            delete process.env.ENV__TEST__BOOLEAN_SECOND;
            delete process.env.ENV__TEST__NUMBER;
            delete process.env.ENV__TEST__FLOAT;
        });
        it('should return null when parameter is not an object', function() {
            var string = '{main_one: true,main_two: false}';

            expect(parserParameter.parse(string, false)).to.equal(null);
        });
        it('should return correct type when parameter is typed-prefixed', function() {
            expect(parserParameter.parse({test: 'ncm_boolean:true'})).to.deep.equal({test: true});
            expect(parserParameter.parse({test: 'ncm_boolean:false'})).to.deep.equal({test: false});
            expect(parserParameter.parse({test: 'ncm_string:true'})).to.deep.equal({test: 'true'});
            expect(parserParameter.parse({test: 'ncm_number:17'})).to.deep.equal({test: 17});
            expect(parserParameter.parse({test: 'ncm_number:0x11'})).to.deep.equal({test: 17});
            expect(parserParameter.parse({test: 'ncm_string:0x11'})).to.deep.equal({test: '0x11'});
            expect(parserParameter.parse({test: 'ncm_invalid:xx'})).to.deep.equal({test: 'ncm_invalid:xx'});
        });
    });
});