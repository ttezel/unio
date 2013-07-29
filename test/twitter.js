var assert = require('assert')
var util = require('util')
var config = require('../config')
var unio = require('../lib/unio')
var helper = require('./helper')

describe('unio - Twitter API', function () {

    it('GET /search/tweets resource', function (done) {
        var client = unio()

        var params = {
            q: 'banana',
            oauth: config.twitter.oauth
        }

        client
            .use('twitter')
            .get('search/tweets', params, function (err, res, reply) {
                assert.equal(err, null)
                assert.equal(res.statusCode, 200)
                helper.twitter.validateSearchReply(reply)

                done()
            })
    })

    it('POST /statuses/destroy/:id resource', function (done) {
        
        // post a tweet so we can then delete it
        exports.postTweet(function (err, tweet) {
            assert.equal(err, null)
            assert(tweet)

            var testTweetIdStr = tweet.id_str
            assert(testTweetIdStr)
            
            var client = unio()

            var params = {
                id: testTweetIdStr,
                oauth: config.twitter.oauth
            }

            client
                .use('twitter')
                .post('statuses/destroy/:id', params, function (err, res, reply) {
                    assert.equal(err, null, 'error: '+util.inspect(err, true, 10, true))

                    var errMsg = 'statusCode: '+res.statusCode+'. res.body: '+res.body

                    assert.equal(res.statusCode, 200, errMsg)
                    helper.twitter.validateTweet(reply)

                    done()
                })
        })
    }) 

    it('GET /geo/id/:place_id resource', function (done) {
        var client = unio()

        var params = {
            place_id: 'df51dec6f4ee2b2c',
            oauth: config.twitter.oauth
        }

        client
            .use('twitter')
            .get('geo/id/:place_id', params, function (err, res, reply) {
                assert.equal(err, null, 'error: '+util.inspect(err, true, 10, true))

                var errMsg = 'statusCode: '+res.statusCode+'. res.body: '+res.body

                assert.equal(res.statusCode, 200, errMsg)
                helper.twitter.validatePlace(reply)

                done()
            })
    })
})

/**
 * Post a tweet, then pass control to `cb`.
 * 
 * @param  {Function} cb    completion callback: function (err, tweet) {...}
 */
exports.postTweet = function (cb) {
    var client = unio()

    var params = {
        status: 'tweeting using unio :)',
        oauth: config.twitter.oauth
    }

    client
        .use('twitter')
        .post('statuses/update', params, function (err, res, reply) {
            if (err) return cb(err)

            assert.equal(res.statusCode, 200)
            helper.twitter.validateTweet(reply)
            assert.equal(reply.text, params.status)

            return cb(null, reply)
        })
}

