var request = require('request')
var unio = require('../lib/unio')
var config = require('../config')
var assert = require('assert')
var util = require('util')
var helper = require('./helper')


describe('unio behavior', function () {

    var client = unio()

    it('next request without .use() defaults to last used API', function (done) {
        client.use('twitter')

        assert(client.usingSpec)
        assert.equal(client.usingSpec.name, 'twitter')

        client.use('instagram')

        assert(client.usingSpec.name, 'instagram')

        done()
    })
})