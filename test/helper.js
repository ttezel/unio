var assert = require('assert')
var util = require('util')

exports.inspect = function (obj) {
    return util.inspect(obj, true, 10, true)
}

exports.twitter = {}
exports.instagram = {}

exports.twitter.validateSearchReply = function (reply) {
    assert(reply)
    assert(reply.statuses)
    assert(Array.isArray(reply.statuses))
    assert(reply.statuses[0])

    exports.twitter.validateTweet(reply.statuses[0])
}

exports.twitter.validateTweet = function (tweet) {
    assert(tweet)
    assert(tweet.created_at, 'tweet didnt have creation time: '+exports.inspect(tweet))
    assert(tweet.from_user || tweet.user)
    assert(tweet.from_user_id || tweet.user.id)
    assert(tweet.from_user_id_str || tweet.user.id_str)
    assert(tweet.id)
    assert(tweet.id_str)
    assert(tweet.text)
}

exports.twitter.validateUser = function (users) {
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

exports.twitter.validatePlace = function (twitterPlaces) {
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

exports.instagram.validateMedia = function (media) {
    assert(media)
    assert(media.id)
    assert(media.tags)
    assert(media.likes)
    assert(media.images)
}

exports.instagram.validateUser = function (user) {
    assert(user)
    assert(user.id)
    assert(user.username)
    assert(user.full_name)
    assert(user.profile_picture)
    assert(user.counts)
}