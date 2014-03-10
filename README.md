# Access-Control (CORS)

`access-control` implements HTTP Access Control, which more commonly known as
CORS according to the w3 specification. The code is dead simple, easy to
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

- origins
- credentials
- maxAge
- headers
- exposed

```js
var cors = access({
  maxAge: '1 hour',
  credentials: true,
  origins: 'http://example.com'
});
```

Now the `cors` variable contains a function that should receive your `request`
and `response`.

## License

MIT
