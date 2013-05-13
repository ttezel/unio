var assert = require('assert')
var config = require('../config')
var unio = require('../lib/unio')

describe('unio - Facebook API', function () {
    var fbAccessToken = null

    // use unio to get a facebook access token
    before(function (done) {

        var client = unio()

        var oauthParams = {
            client_id: config.fb.app_id,
            client_secret: config.fb.app_secret,
            grant_type: 'client_credentials'
        }

        client
            .use('fb')
            .get('oauth/access_token', oauthParams, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)
                assert(body)

                fbAccessToken = body.replace('access_token=', '')

                assert(fbAccessToken)
                done()
            })        

    })

    it('GET search request', function (done) {
        var client = unio()

        var params = {
            q: 'coffee',
            access_token: fbAccessToken
        }

        client
            .use('fb')
            .get('search', params, function (err, res, reply) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(reply)
                assert(reply.data)

                var firstResult = reply.data[0];

                assert(firstResult.id)
                assert(firstResult.type)
                assert(firstResult.created_time)

                done()
            })
    })
})