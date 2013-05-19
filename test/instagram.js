var assert = require('assert')
var config = require('../config')
var unio = require('../lib/unio')
var helper = require('./helper')

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

    it('instagram API: GET tags/:id/media/recent resource', function (done) {
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

                helper.instagram.validateMedia(firstMedia)
                
                done()
            })
    })

    it('instagram API: GET users/:userid resource', function (done) {
        var client = unio()        

        var params = {
            userid: '1574083',
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('users/:userid', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(body)
                assert(body.data)

                var user = body.data

                helper.instagram.validateUser(user)
                
                done()
            })
    })

    it('instagram API: GET users/self/feed resource', function (done) {
        var client = unio()        

        var params = {
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('users/self/feed', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(body)
                assert(body.data)

                var firstMedia = body.data[0];

                helper.instagram.validateMedia(firstMedia)
                
                done()
            })
    })    

    it('instagram API: GET users/:user_id/media/recent resource', function (done) {
        var client = unio()        

        var params = {
            user_id: '3',
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('users/:user_id/media/recent', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(body)
                assert(body.data)

                var firstMedia = body.data[0];

                helper.instagram.validateMedia(firstMedia)
                
                done()
            })
    })

    it('instagram API: GET users/self/media/liked resource', function (done) {
        var client = unio()        

        var params = {
            access_token: config.instagram.access_token
        }

        client
            .use('instagram')
            .get('users/self/media/liked', params, function (err, res, body) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)

                assert(body)
                assert(body.data)

                var firstMedia = body.data[0];

                helper.instagram.validateMedia(firstMedia)
                
                done()
            })
    }) 
})