var assert = require('assert')
var util = require('util')
var config = require('../config')
var unio = require('../lib/unio')

describe('unio - Github API', function () {

    it.skip('github API', function (done) {
        var client = unio()

        var params = {
            scopes: config.github.scopes,
            oauth: {
                client_id: config.github.client_id,
                client_secret: config.github.client_secret
            }
        }

        client
            .use('github')
            .get('authorizations', params, function (err, res, body) {
                assert.equal(err, null, util.inspect(err, true, 10, true))
                assert.equal(res.statusCode, 200)

                console.log('github user reply', reply)

                done()
            })
    })
})