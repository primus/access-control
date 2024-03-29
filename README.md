# HTTP Access-Control (CORS)

[![Version npm](https://img.shields.io/npm/v/access-control.svg?style=flat-square)](https://www.npmjs.com/package/access-control)[![CI](https://img.shields.io/github/actions/workflow/status/primus/access-control/ci.yml?branch=master&label=CI&style=flat-square)](https://github.com/primus/access-control/actions?query=workflow%3ACI+branch%3Amaster)[![Coverage Status](http://img.shields.io/coveralls/primus/access-control/master.svg?style=flat-square)](https://coveralls.io/r/primus/access-control?branch=master)

`access-control` implements HTTP Access Control, which more commonly known as
CORS according to the W3 specification. The code is dead simple, easy to
understand and therefor also easy to contribute to. `access-control` comes with
a really simple API, so it's super simple, super awesome, super stable. All you
expect from a small building block module as this.

## Installation

```
npm install --save access-control
```

## Usage

The module must first be configured before it can be used to add the correct
CORS information to your HTTP requests. This is done by suppling the module with
options.

```js
'use strict';

var access = require('access-control');
```

After requiring the module you can supply the returned function with an options
object which can contain the following properties:

<dl>
  <dt>origins</dt>
  <dd>
    An Array or comma separated list of origins that are allowed to access the
    URL. If this option is not supplied it will default to <code>*</code> which
    will allow every origin.
  </dd>
  <dt>methods</dt>
  <dd>
    An Array or comma separated list of HTTP methods that can be used to access
    the URL. This defaults to GET, HEAD, PUT, POST, DELETE and OPTIONS.
  </dd>
  <dt>credentials</dt>
  <dd>
    Allow sending of authorization and cookie information in the request. If
    this option is set to <code>true</code> (which is also the default value) in
    combination with the <code>origins</code> option to set to <code>*</code> we
    will automatically change the <code>Access-Control-Allow-Origin</code>
    header to the sent <code>Origin</code> header. As <code>*</code> as origin
    in combination with <code>true</code> as value is not allowed by the
    specification.
  </dd>
  <dt>maxAge</dt>
  <dd>
    The maximum duration that a client can cache the response of the preflight
    or <code>OPTIONS</code> request. The value can be set in numbers or a human
    readable string which we will parse with the <strong>ms</strong> module. We
    default to 30 days.
  </dd>
  <dt>headers</dt>
  <dd>
    An Array or comma separated list of headers that is allowed to be sent to
    the server. This option is disabled by default.
  </dd>
  <dt>exposed</dt>
  <dd>
    An Array or comma separated list of headers that is exposed to the client
    that makes the request. This option is disabled by default.
  </dd>
</dl>

```js
var cors = access({
  maxAge: '1 hour',
  credentials: true,
  origins: 'http://example.com'
});
```

Now the `cors` variable contains a function that should receive your `request`
and `response`. So it's as easy as:

```js
var http = require('http').createServer(function (req, res) {
  if (cors(req, res)) return;

  res.end('hello world');
}).listen(8080);
```

You might have noticed that we've added an if statement around our `cors`
function call. This is because the module will be answering the preflight
request for you. So when it returns the **boolean** `true` you don't have to
respond the request any more. In addition to the answering the option request is
also answer the requests with a `403 Forbidden` when the validation of the
Access Control is failing.

In order to not waste to much bandwidth, the CORS headers will only be added if
the request contains an `Origin` header, which should be sent by every request
that requires HTTP Access Control information.

## middleware

The library has build-in support for express based middleware (req, res, next).
In fact, it's build in to the returned function so all you need to do is:

```js
var app = express();

app.use(require('access-control')({ /* options here */ }));
```

And you have CORS handling enabled on your express instance. It's that easy.

## Phonegap & Origin: null

If you're using Phonegap, your XHR requests will be sent with `Origin: null` as
Origin header. In order to resolve this you must add the domain you are
requesting to your origin white list:

http://docs.phonegap.com/en/1.9.0/guide_whitelist_index.md.html

This will ensure that the correct headers will be used for these cross
domain/origin requests.

## Related reading

If you're interested in learning more about HTTP Access Control (CORS) here's a
good list to get started with:

- [W3C's CORS Spec](http://www.w3.org/TR/cors/)
- [HTML5 Rocks CORS Tutorial](http://www.html5rocks.com/en/tutorials/cors/)
- [Mozilla's HTTP access control (CORS)](https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS)
- [Mozilla's Server-Side Access Control](https://developer.mozilla.org/en-US/docs/Server-Side_Access_Control)
- [Enable CORS](http://enable-cors.org)
- [Same origin policy](http://en.wikipedia.org/wiki/Same_origin_policy)

## License

MIT
