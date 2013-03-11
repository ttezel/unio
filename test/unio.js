var request = require('request')
var unio = require('../lib/unio')
var fbSpec = require('../specs/fb')
var config = require('../config')
var assert = require('assert')
var util = require('util')

function inspect (obj) {
    return util.inspect(obj, true, 10, true)
}

function validateSearchReply (reply) {
    assert(reply)
    assert(reply.max_id)
    assert(reply.max_id_str)
    assert(reply.results)
    assert(Array.isArray(reply.results))
    assert(reply.results[0])

    validateTweet(reply.results[0])
}

function validateTweet (tweet) {
    assert(tweet)
    assert(tweet.created_at, inspect(tweet))
    assert(tweet.from_user || tweet.user)
    assert(tweet.from_user_id || tweet.user.id)
    assert(tweet.from_user_id_str || tweet.user.id_str)
    assert(tweet.id)
    assert(tweet.id_str)
    assert(tweet.text)
    console.log('from_user: @%s', tweet.from_user || tweet.user.screen_name)
    console.log('tweet text:', tweet.text)
}


describe('unio', function () {

    var testTweetIdStr = null

    var client = unio()

    it('facebook API - search', function (done) {

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

            client
                .use('fb')
                .get('search', params, function (err, reply) {
                    assert.equal(err, null)

                    assert(reply)
                    assert(reply.data)

                    var first = reply.data[0]

                    console.log('first search result', first)

                    assert(first.id)
                    assert(first.from)

                    done()
                })
        })
    })

    it('twitter API - search', function (done) {
        var params = {
            q: 'banana'
        }

        client
            .use('twitter')
            .get('search', params, function (err, reply) {
                assert.equal(err, null)
                validateSearchReply(reply)

                done()
            })
    })

    it('making request without .use defaults to last used API', function (done) {
        var params = {
            q: 'apple'
        }

        client
            .get('search', params, function (err, reply) {
                assert.equal(err, null)
                validateSearchReply(reply)

                done()
            })
    })

    it('twitter API - statuses/update', function (done) {
        var params = {
            status: 'tweeting using unio :)',
            oauth: config.twitter.oauth
        }

        client
            .use('twitter')
            .post('statuses/update', params, function (err, reply) {
                assert.equal(err, null)
                validateTweet(reply)
                assert.equal(reply.text, params.status)

                testTweetIdStr = reply.id_str

                assert(testTweetIdStr)

                done()
            })
    })

    it('twitter API - statuses/destroy/:id', function (done) {
        var params = {
            id: testTweetIdStr,
            oauth: config.twitter.oauth
        }

        client
            .use('twitter')
            .post('statuses/destroy/'+testTweetIdStr, params, function (err, reply) {
                assert.equal(err, null, util.inspect(err, true, 10, true))

                console.log('destroyed tweet:', reply.text)
                validateTweet(reply)

                done()
            })
    })

    it.skip('github API', function (done) {

        var params = {
            scopes: config.github.scopes,
            oauth: {
                client_id: config.github.client_id,
                client_secret: config.github.client_secret
            }
        }

        client
            .use('github')
            .get('authorizations', params, function (err, reply) {
                assert.equal(err, null, util.inspect(err, true, 10, true))

                console.log('github user reply', reply)

                done()
            })
    })
})