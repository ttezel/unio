var assert = require('assert')
var util = require('util')

exports.inspect = function (obj) {
    return util.inspect(obj, true, 10, true)
}

exports.validateTwitterSearchReply = function (reply) {
    assert(reply)
    assert(reply.max_id)
    assert(reply.max_id_str)
    assert(reply.results)
    assert(Array.isArray(reply.results))
    assert(reply.results[0])

    exports.validateTweet(reply.results[0])
}

exports.validateTweet = function (tweet) {
    assert(tweet)
    assert(tweet.created_at, 'tweet didnt have creation time: '+exports.inspect(tweet))
    assert(tweet.from_user || tweet.user)
    assert(tweet.from_user_id || tweet.user.id)
    assert(tweet.from_user_id_str || tweet.user.id_str)
    assert(tweet.id)
    assert(tweet.id_str)
    assert(tweet.text)
}

exports.validateTwitterUser = function (users) {
    // normalize to array of users before validation
    if (!Array.isArray(users)) 
        users = [ users ]

    users.forEach(function (user) {
        assert(user.name)
        assert(user.created_at)
        assert(user.id_str)
        assert(user.followers_count)
        assert(user.friends_count)
        assert(user.screen_name)
    })
}

exports.validateTwitterPlace = function (twitterPlaces) {
    // normalize to array of users before validation
    if (!Array.isArray(twitterPlaces)) 
        twitterPlaces = [ twitterPlaces ]

    twitterPlaces.forEach(function (place) {
        assert(place.bounding_box)
        assert(place.bounding_box.coordinates)
        assert(place.bounding_box.type)
        assert(place.geometry)
        assert(place.country)
        assert(place.full_name)
    })
}