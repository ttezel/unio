exports.clone = function (thing) {
    return JSON.parse(JSON.stringify(thing))
}