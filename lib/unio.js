var request = require('request')
var fs = require('fs')
var Seq = require('seq')
var util = require('util')
var querystring = require('querystring')
var path = require('path')

module.exports = function () {
    return new Unio()
}

//allowed verbs
var VERBS = [
    'get',
    'post',
    'put',
    'delete'
];

function Unio () {
    var self = this
    var specDir = path.resolve(__dirname, '../specs')
    var specs = fs.readdirSync(specDir).map(function (specFile) {
        return path.resolve(__dirname, '../specs/'+specFile)
    })

    this.auth = {}
    this.specs = {}

    specs.forEach(self.spec.bind(this))
}

VERBS.forEach(function (verb) {
    Unio.prototype[verb] = function (resource, params, callback) {
        if (!this.usingSpec) {
            throw new Error('must call Unio.use() first to tell unio which resource to request.')
        }

        resource = this.usingSpec.api_root + '/' + resource

        return this.request(verb, resource, params, callback)
    }
})

/**
 * Import a new REST API spec into Unio
 * 
 * @param  {Object or String or Array} spec
 *
 * `spec` can be:
 *  (1) Object (single API spec)
 *  (2) Array (Array of (1))
 *  (3) String representing:
 *      -   local fs path to json file that 
 *          is parsed as (1) or (2)
 *      
 */
Unio.prototype.spec = function (spec) {
    var self = this

    if (Array.isArray(spec)) {
        spec.forEach(function (entry) { 
            self.addSpec(entry) 
        })
        return this
    } else if (typeof spec === 'object') {
        return this.addSpec(spec)
    } else if (typeof spec === 'string') {
        //expects file on fs to be a json file
        //or js file exporting an object
        if (fs.existsSync(spec)) {
            spec = require(spec)
            return this.addSpec(spec)
        } else {
            throw new Error('string argument passed to `unio.spec()` does not exist on the local fs')
        }
    } else {
        throw new Error('unsupported type supplied as first argument to `unio.spec()`. Got:'+typeof spec)
    }
}

Unio.prototype.addSpec = function (spec) {
    if (this.specs[spec.name]) {
        throw new Error('spec with this name already exists.')
    }
    this.specs[spec.name] = spec
    return this
}

Unio.prototype.use = function (specName) {
    if (!this.specs[specName])
        throw new Error('Cannot use '+specName+'. Call unio.spec() to add this spec before calling .use().')
    this.usingSpec = this.specs[specName]
    return this
}

/**
 * [request description]
 * @param  {[type]}   verb      [description]
 * @param  {[type]}   reqParams     looks like: { domain: 'https://api.xyz.com', qs: 'a=foo&b=bar'}
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
Unio.prototype.request = function (verb, resource, params, callback) {
    var self = this
    var reqOpts = {
        method: verb
    }

    var validCallback = callback && typeof callback === 'function'

    if ([ 'POST', 'PUT' ].indexOf(verb) !== -1) {
        reqOpts.body = params
    } else {
        resource += '?' + querystring.stringify(params)
    }

    reqOpts.url = resource

    // console.log('reqOpts', reqOpts)

    request(reqOpts, function (err, res, body) {
        if (err) {
            if (validCallback)
                return callback(err, null)

            throw err
        }

        //attempt to parse the string as JSON
        var parsed = null
        var error = null

        try {
            console.log('about to parse json', typeof body)
            parsed = JSON.parse(body)
        } catch (e) {
            error = new Error('failed to parse Facebook body as JSON')
            error.details = e
            error.body = body

            util.puts('JSON parse error', util.inspect(error, true, 10, true))
        } finally {
            if (validCallback)
                return callback(error, parsed)

            if (error)
                throw error
        }
    })
}


