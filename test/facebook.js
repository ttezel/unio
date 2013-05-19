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

    it('GET /search resource', function (done) {
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

    it('GET /:id resource', function (done) {
        var client = unio()

        var params = {
            access_token: fbAccessToken,
            id: '588625709'
        }

        client
            .use('fb')
            .get(':id', params, function (err, res, reply) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(reply)
                assert(reply.id)
                assert(reply.name)
                assert(reply.first_name)
                assert(reply.last_name)
                assert(reply.username)

                done()
            })
    })

    it('GET /:id/picture resource', function (done) {
        var client = unio()

        var params = {
            id: '588625709',
            type: 'small',
            access_token: fbAccessToken,
            redirect: false // gets JSON back instead of the raw image
        }

        client
            .use('fb')
            .get(':id/picture', params, function (err, res, reply) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(reply)
                assert(reply.data)
                assert(reply.data.url)

                done()
            })
    })

    it('GET /fql resource using `SELECT first_name FROM user WHERE uid=588625709`', function (done) {
        var client = unio()

        var params = {
            q: 'SELECT first_name FROM user WHERE uid=588625709',
            access_token: fbAccessToken
        }

        client
            .use('fb')
            .get('fql', params, function (err, res, reply) {
                assert.equal(err, null)

                var errMsg = 'statusCode: '+res.statusCode+'. res.body: '+res.body

                assert.equal(res.statusCode, 200, errMsg)

                assert(reply)
                assert(reply.data)
                assert(reply.data[0])

                done()
            })
    })
})