#unio

`One REST API Spec for All.`

This repo is the `Unio` REST API client - it implements the **Facebook** APIs, and supports any REST API that can be described in JSON.

The initiative behind `unio` is to describe REST APIs in a simple, readable JSON file. This allows it to be trivially implemented by the `unio` client - making the implementation time for new REST APIs as close to **zero** as possible. See [the blog post](http://ttezel.github.com) motivating this client, and feel free to fork and add new REST API specs!

#Install

```
npm install unio
```

#Usage

```javascript
var unio = require('unio')

var params = {
    q: 'coffee',
    access_token: 'YOUR_FB_ACCESS_TOKEN'
}

// with the facebook search API
unio()
    .use('fb')
    .get('search', params, function (err, reply) {
        console.log('first search result', reply.data[0])
    })

// add a new REST API spec to unio
unio()
    .spec(apiSpec)
    .use('newly-added-spec')
    .post('some_resource', function (err, reply) {
        //...
    })

```

#API:

##`.use(service)`

Tells the `unio` client that the next HTTP request you make will be to `service`.

##`.spec(specObject)`
    
Adds a new REST API spec, described by `specObject`, to the `unio` client. Allows it the `use` it and make `get`, `post`, `put`, and `delete` requests to the REST API described by `specObject`.

See the [Facebook JSON spec](https://github.com/ttezel/unio/blob/master/specs/fb.json) and the [Twitter JSON spec](https://github.com/ttezel/unio/blob/master/specs/twitter.json) as examples. The specs that `unio` supports are in the `specs` folder.

##`.get(resource, [ params, callback ])`

**GET** a REST API `resource`, with optional params object (which will get url-encoded for you), and an optional `callback`, that has the following signature: `function (err, reply)`.

##`.post(resource, [ params, callback ])`

See `.get()` -> same thing but using **POST**.

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