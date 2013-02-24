var request = require('request')
var unio = require('../lib/unio')
var fbSpec = require('../specs/fb')
var config = require('../config')
var assert = require('assert')

describe('unio', function () {
    it('uses fb spec to make a fql query', function (done) {

        var authUrl = 'https://graph.facebook.com/oauth/access_token'

        var reqOpts = {
            url: authUrl,
            method: 'GET',
            qs: {
                client_id: config.fb.app_id,
                client_secret: config.fb.app_secret,
                grant_type: 'client_credentials'
            }
        }

        //get access_token from facebook
        request(reqOpts, function (err, res, body) {
            assert.equal(err, null)
            assert.equal(res.statusCode, 200)
            assert(body)

            var accessToken = body.replace('access_token=', '')

            assert(accessToken)

            //import facebook REST API spec
            //authenticate and make query
            var params = {
                q: 'coffee',
                access_token: accessToken
            }

            unio()
                .use('fb')
                .get('search', params, function (err, reply) {
                    assert.equal(err, null)

                    var first = reply.data[0]

                    console.log('first search result', first)

                    assert(first.id)
                    assert(first.from)

                    done()
                })
        })
    })
})