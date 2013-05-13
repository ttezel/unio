var assert = require('assert')
var config = require('../config')
var unio = require('../lib/unio')

describe('unio - Instagram API', function () {

    it('GET tags/:id resource', function (done) {
        var client = unio()

        var authUrl = 'https://instagram.com/oauth/authorize/?client_id=' 
                        + config.instagram.client_id
                        + '&redirect_uri='
                        + config.instagram.redirect_uri
                        + '&response_type=token'

        // console.log('authUrl', authUrl)

        var params = {
            id: 'nofilter',
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('tags/:id', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)
                assert(body)
                assert(body.data)
                assert(body.data.media_count)
                
                done()
            })
    })

    it('instagram API: GET tags/:id/media/recent', function (done) {
        var client = unio()        

        var params = {
            id: 'nofilter',
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('tags/:id/media/recent', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(body)
                assert(body.data)

                var firstMedia = body.data[0];

                assert(firstMedia)
                assert(firstMedia.id)
                assert(firstMedia.tags)
                assert(firstMedia.filter)
                assert(firstMedia.likes)
                assert(firstMedia.images)
                
                done()
            })
    })
})