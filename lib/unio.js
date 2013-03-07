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
    'patch',
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

    verb = verb.toLowerCase()

    var reqOpts = {
        method: verb
    }

    if (typeof params === 'function') {
        callback = params
        params = {}
    }

    var validCallback = callback && typeof callback === 'function'

    if (params.oauth) {
        // handle oauth info from params
        reqOpts.oauth = params.oauth

        var body = 
            querystring.stringify(params)
                .replace(/\!/g, "%21")
                .replace(/\'/g, "%27")
                .replace(/\(/g, "%28")
                .replace(/\)/g, "%29")
                .replace(/\*/g, "%2A")

        
        reqOpts.body = body
    }


    // encode params as appropriate
    if ([ 'post', 'put', 'patch' ].indexOf(verb) !== -1) {
        // encode params as json if not oauth
        if (!params.oauth) {
            // if it's a POST or PUT request, send params as json
            reqOpts.json = params
        }
    } else {
        // otherwise encode as querystring
        reqOpts.qs = params
    }


    // determine the matching resource from the spec
       
    var specResource = null
    var resourceCandidates = this.usingSpec.resources

    function normalizeUri (uri) {
        return '^' + 
                uri
                .replace(/:\w+/g, '(\\w+)')
                .replace(/\//g, '\\/')
    }

    // find the first matching resource in the spec, by 
    // checking the name and then the path of each resource in the spec
    resourceCandidates.some(function (candidate, index) {

        var normName = candidate.name && normalizeUri(candidate.name)
        var normPath = candidate.path && normalizeUri(candidate.path)
                                    
        var rgxName = new RegExp(normName)
        var rgxPath = new RegExp(normPath)

        // check for a match in the resource name or path
        var nameMatch = rgxName.test(resource) || rgxPath.test(resource)
        // check that the verbs allowed with this resource match `verb`
        var verbMatch = candidate.methods.indexOf(verb) !== -1

        // console.log('match', match, labelRegexp, resource)

        if (nameMatch && verbMatch) {
            specResource = self.usingSpec.resources[index]
            return true
        }
    })

    if (!specResource)
        return callback(new Error('resource `'+resource+'` not supported for API `'+this.usingSpec.name+'`. Make sure spec is correct, or `.use()` the correct API.'))

    // determine absolute url to resource

    var regexDomain = /^http/

    // if resource path is an absolute url, just hit that url directly
    if (regexDomain.test(specResource.path)) {
        reqOpts.url = specResource.path
    } else {

        var queryPath = specResource.path ? specResource.path : resource     

        // otherwise append the resource url fragment to the api root
        reqOpts.url = this.usingSpec.api_root + '/' + queryPath
    }

    // if /:params are used in the resource path, populate using params
    reqOpts.url = reqOpts.url.replace(/\/:(\w+)/g, function (hit) {
        var paramName = hit.slice(2)
        // console.log('paramName', paramName)
        return '/' + params[paramName]
    })

    // validate the requested `resource` and `params` against
    // the currently used spec

    Object.keys(specResource.params).forEach(function (keyName) {
        var isRequired = specResource.params[keyName] === 'required'

        if (isRequired && typeof params[keyName] === 'undefined')
            return callback(new Error('Invalid request: params object must define '+keyName+'. Got:'+params[keyName]+'.'))
    })

    // console.log('\nfinal reqOpts', util.inspect(reqOpts, true, 10, true))

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
            // console.log('about to parse json:', typeof body)
            parsed = JSON.parse(body)
        } catch (e) {
            console.log('statusCode', res.statusCode)
            console.log('Reply is not valid JSON. Passing back raw reply.', util.inspect(body, true, 10, true))
            
            parsed = body
        } finally {
            if (validCallback)
                return callback(error, parsed)

            if (error)
                throw error
        }
    })
}


