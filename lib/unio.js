var request = require('request')
var fs = require('fs')
var Seq = require('seq')
var util = require('util')
var querystring = require('querystring')
var path = require('path')
var helper = require('./helper')

module.exports = function () {
    return new Unio()
}

// allowed verbs
var VERBS = [
    'get',
    'patch',
    'post',
    'put',
    'delete'
];

function Unio () {
    var self = this

    this.specs = {}

    // import specs from fs into unio
    var specDir = path.resolve(__dirname, '../specs')
    var specs = fs.readdirSync(specDir).map(function (specFile) {
        return path.resolve(__dirname, '../specs/'+specFile)
    })
    specs.forEach(self.spec.bind(this))
}

// attach http verbs as methods on `unio`
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
        throw new Error('Cannot use `'+specName+'`. Call unio.spec() to add this spec before calling .use().')
    this.usingSpec = this.specs[specName]
    return this
}

/**
 * Finalize and send the request, then pass control to `callback`.
 * 
 * @param  {String}   verb      http verb e.g. get, post
 * @param  {String}   resource  API resource e.g. search/tweets
 * @param  {Function} callback  completion callback. Signature: function (err, res, reply) {}
 */
Unio.prototype.request = function (verb, resource, params, callback) {
    var self = this
    var validCallback = callback && typeof callback === 'function'

    verb = verb.toLowerCase()

    if (typeof params === 'function') {
        callback = params
        params = {}
    }

    // determine the matching resource from the spec
    var specResource = self.findMatchingResource(verb, resource)
    var specErr = new Error(verb.toUpperCase()+' '+resource+' not supported for API `'+this.usingSpec.name+'`. Make sure the spec is correct, or `.use()` the correct API.')

    if (!specResource) {
        if (validCallback) return callback(specErr)
        throw specErr
    }

    // validate `params` against the currently used spec
    
    Object.keys(specResource.params).forEach(function (keyName) {
        var isRequired = specResource.params[keyName] === 'required'

        var validationErr = new Error('Invalid request: params object must have `'+keyName+'`. It is listed as a required parameter in the spec.')

        if (isRequired && typeof params[keyName] === 'undefined') {
            if (validCallback) return callback(validationErr)
            else throw validationErr
        }
    })

    var reqOpts = self.buildRequestOpts(verb, resource, specResource, params)

    // console.log('\nfinal reqOpts', util.inspect(reqOpts, true, 10, true))

    return request(reqOpts, function (err, res, body) {
        // pass error to callback, or throw if no callback was passed in
        if (err) {
            if (validCallback)
                return callback(err, null)

            throw err
        }

        var parsed = null

        // attempt to parse the string as JSON
        // if we fail, pass the callback the raw response body
        try {
            parsed = JSON.parse(body)
        } catch (e) {
            parsed = body
        } finally {
            if (validCallback)
                return callback(null, res, parsed)
        }
    })
}

/**
 * Find the first matching API resource for `verb` and `resource`
 * from the spec we are currently using.
 * 
 * @param  {String} verb       HTTP verb; eg. 'get', 'post'.
 * @param  {String} resource   user's requested resource.
 * @return {Object}            matching resource object from the spec.
 */
Unio.prototype.findMatchingResource = function (verb, resource) {
    var self = this
    var specResource = null
    var resourceCandidates = this.usingSpec.resources

    // find the first matching resource in the spec, by 
    // checking the name and then the path of each resource in the spec
    resourceCandidates.some(function (candidate, index) {

        var normName = candidate.name && self.normalizeUri(candidate.name)
        var normPath = candidate.path && self.normalizeUri(candidate.path)
                                    
        var rgxName = new RegExp(normName)
        var rgxPath = new RegExp(normPath)

        // check for a match in the resource name or path
        var nameMatch = (normName && rgxName.test(resource))
                    ||  (normPath && rgxPath.test(resource))

        // check that the verbs allowed with this resource match `verb`
        var verbMatch = candidate.methods.indexOf(verb) !== -1

        // console.log('nameMatch: %s, candidate.name: %s, candidate.path: %s, resource: %s, rgxName: %s', nameMatch, candidate.name, candidate.path, resource, rgxName)

        if (nameMatch && verbMatch) {
            specResource = self.usingSpec.resources[index]
            return true
        }
    })

    return specResource
}

Unio.prototype.buildRequestOpts = function (verb, resource, specResource, params) {
    var self = this
    var paramsClone = helper.clone(params)

    var reqOpts = {
        method: verb
    }

    // determine absolute url to resource

    // if resource path is an absolute url, just hit that url directly
    var rgxDomain = /^http/

    if (rgxDomain.test(specResource.path)) {
        reqOpts.url = specResource.path
    } else {

        var queryPath = specResource.path ? specResource.path : resource     

        // otherwise append the resource url fragment to the api root
        reqOpts.url = this.usingSpec.api_root + '/' + queryPath
    }

    var rgxParam = /\/:(\w+)/g

    // url-encode all parameters needed to build the url,
    // and strip them from `paramsClone`

    // if /:params are used in the resource path, populate them
    reqOpts.url = reqOpts.url.replace(rgxParam, function (hit) {
        var paramName = hit.slice(2)

        var userValue = paramsClone[paramName]

        // if user supplied extra values in the params object that
        // the spec doesn't take, ignore them
        if (!userValue) {
            var missingUrlParamErr = new Error('Params object is missing a required parameter from url path: '+paramName+'.')
            throw new Error(missingUrlParamErr)
        }

        var paramVal = helper.clone(userValue)

        // strip this off `paramsClone`, so we don't also encode it
        // in the querystring or body of `reqOpts`
        delete paramsClone[paramName]
        // console.log('paramName: %s. paramVal: %s', paramName, paramVal)
        return '/' + paramVal
    })

    // encode http auth params (if specified) and strip from `paramsClone`
    if (paramsClone.httpAuth) {
      var httpAuthClone = helper.clone(paramsClone.httpAuth)
      reqOpts.auth = paramsClone.httpAuth;
      delete paramsClone.httpAuth;
    }

    // encode the oauth params (if specified) and strip from `paramsClone`
    if (paramsClone.oauth) {
        // handle oauth info from params
        var oauthClone = helper.clone(paramsClone.oauth)
        reqOpts.oauth = paramsClone.oauth

        delete paramsClone.oauth
    }

    // encode the rest of the parameters as appropriate (querystring or body)
    
    if ([ 'post', 'put', 'patch' ].indexOf(verb) !== -1) {
        reqOpts.body = self.urlEncode(paramsClone)

        // encode the body as JSON
        reqOpts.json = true
    } else {
        // otherwise encode any remaining params as querystring
        if (Object.keys(paramsClone).length)
            reqOpts.qs = paramsClone
    }

    return reqOpts
}

Unio.prototype.urlEncode = function (obj) {
    return querystring.stringify(obj)
            .replace(/\!/g, "%21")
            .replace(/\'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/\*/g, "%2A")
}

/**
 * Normalize `uri` string to its corresponding regex string.
 * Used for matching unio requests to the appropriate resource.
 * 
 * @param  {String} uri
 * @return {String}
 */
Unio.prototype.normalizeUri = function (uri) {
    var normUri = uri
                    // normalize :params
                    .replace(/:w+/g, ':w+')
                    // string forward slash -> regex match for forward slash
                    .replace(/\//g, '\\/')

    return '^'+normUri+'$'
}


