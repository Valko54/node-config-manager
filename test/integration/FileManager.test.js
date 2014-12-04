'use strict';

var expect = require('chai').expect;

var NODE_ENV = 'test',
    CONFIG_DIR = 'test/integration/config',
    error = require('../../lib/error'),
    FileManager = require('../../lib/FileManager'),
    fileManager = null;

describe('FileManager - Integration Test', function() {
    beforeEach(function() {
        fileManager = new FileManager(CONFIG_DIR, NODE_ENV);
    });

    afterEach(function() {
        fileManager = null;
    });

    describe('#prototype.getFile', function() {
        it('should return null', function() {
            expect(fileManager.getFile('lambda')).to.be.null();
        });
        it('should return content of test/logger.json', function() {
            expect(fileManager.getFile('logger')).to.equal(require('./config/test/logger'));
        });
        it('should return content of /db.json', function() {
            expect(fileManager.getFile('db')).to.equal(require('./config/db'));
        });
    });
});