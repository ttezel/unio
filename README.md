#unio

##`One REST API Client for All.`


The `Unio` client is an easily-extensible REST API Client that supports any REST API that can be described in JSON.

The initiative behind `unio` is to describe REST APIs in simple, readable JSON files. This allows them to be imported into `unio`, and it will know automatically how to talk to the web service from the JSON spec. You can simply import the spec, and start making requests to the API right away. This makes it easy for you to test, use and reuse REST APIs by saving you the time of writing an API client for every new service that pops up.

Currently, the APIs implemented out-of-the-box with `unio` are:

* **Facebook**
* **Twitter**
* **Github**
* **StackExchange**

Feel free to fork and add new REST API specs!

# Implementations

* Node.js: [unio](https://github.com/ttezel/unio) by Tolga Tezel (@ttezel)
* Python: [PyUnio](https://github.com/citruspi/PyUnio) by Mihir Singh (@citruspi)

#Install

```
npm install unio
```

#Usage

```javascript
var unio = require('unio')

//
// with the Facebook Search API
//
var params = {
    q: 'coffee',
    access_token: 'YOUR_FB_ACCESS_TOKEN'
}

unio()
    .use('fb')
    .get('search', params, function (err, reply) {
        console.log('first search result', reply.data[0])
    })

//
// with the Twitter Search API
//
unio()
    .use('twitter')
    .get('search', { q: 'banana' }, function (err, reply) {
        console.log('search results:', reply)
    })

//
// use the Twitter REST API to post a tweet
//
var params = {
    status: 'tweeting using unio! :)',
    oauth: {
        consumer_key:       '...',
        consumer_secret:    '...',
        token:              '...',
        token_secret:       '...',
    }
}

unio()
    .use('twitter')
    .post('statuses/update', params, function (err, reply) {
        //...
    })

//
// with the Github API
//
unio()
    .use('github')
    .get('user', { access_token: 'ACCESS-TOKEN' }, function (err, reply) {
        //...
    })

//
// import a JSON spec from the local filesystem
//
unio()
    .spec('./path/to/json/file')
    .use('myspec')
    .post('blah', function (err, reply) {
        //...
    })

//
// add a new spec directly
//
var apiSpec = {
    name: 'api-name',
    api_root: 'http://api.something.com',
    resources: {
        "some/resource": {
            "path": "some/resource"
            "methods": [ "post" ],
            "params": [
                {
                    "foo": "required"
                },
                {
                    "bar": "optional"
                },
            ]
        }
    }
}

unio()
    .spec(apiSpec)
    .use('api-name')
    .post('some/resource', function (err, reply) {
        //...
    })


```

#API:

##`.use(service)`

Tells the `unio` client that the next HTTP request you make will be to `service`.

##`.spec(spec)`
    
Adds a new REST API spec, described by `spec`, to the `unio` client. Allows it the `use` it and make `get`, `post`, `put`, and `delete` requests to the REST API described by `spec`. It can be a regular Javascript `Object`, `Array`, or `String` that is a path to a JSON file.

The specs that `unio` currently supports are in the `specs` folder. See the [Facebook spec](https://github.com/ttezel/unio/blob/master/specs/fb.json) and the [Twitter spec](https://github.com/ttezel/unio/blob/master/specs/twitter.json) as examples. 

##`.get(resource, [ params, callback ])`

**GET** a REST API `resource`, with optional params object (which will get url-encoded for you), and an optional `callback`, that has the following signature: `function (err, reply)`.

##`.post(resource, [ params, callback ])`

See `.get()` -> same thing but using **POST**.

##`.patch(resource, [ params, callback ])`

See `.get()` -> same thing but using **PATCH**.

##`.put(resource, [ params, callback ])`

See `.get()` -> same thing but using **PUT**.

##`.delete(resource, [ params, callback ])`

See `.get()` -> same thing but using **DELETE**.


-------

## Running the tests

```
npm test
```

-------

## License 

(The MIT License)

Copyright (c) by Tolga Tezel <tolgatezel11@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
