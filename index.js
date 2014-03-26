'use strict';

var setHeader = require('setheader')
  , parse = require('url').parse
  , ms = require('ms');

/**
 * Configure the CORS / Access Control headers.
 *
 * @param {Object} options Configuration
 * @returns {Function}
 * @api public
 */
function access(options) {
  options = options || {};

  // The allowed origins of the request.
  options.origins = 'origins' in options
    ? options.origins
    : '*';

  // The allowed methods for the request.
  options.methods = 'methods' in options
    ? options.methods
    : ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'];

  // Allow sending of authorization and cookie information.
  options.credentials = 'credentials' in options
    ? options.credentials
    : true;

  // Cache duration of the preflight/OPTIONS request.
  options.maxAge = 'maxAge' in options
    ? options.maxAge
    : '30 days';

  // The allowed request headers.
  options.headers = 'headers' in options
    ? options.headers
    : '';

  // Server headers exposed to the user agent.
  options.exposed = 'exposed' in options
    ? options.exposed
    : '';

  //
  // Be a bit flexible in the way the arguments are supplied, transform Array's
  // in to strings and human readable numbers strings in to numbers.
  //
  ['methods', 'headers', 'exposed', 'origins'].forEach(function cleanup(key) {
    if (Array.isArray(options[key])) options[key] = options[key].join(',');
  });

  //
  // The maxAge header value must be expressed in seconds so we need to convert
  // the milliseconds returned by the `ms` module in seconds.
  //
  if ('string' === typeof options.maxAge) options.maxAge = ms(options.maxAge) / 1000;

  var methods = options.methods.toUpperCase().split(',')
    , headers = options.headers.toLowerCase().split(',')
    , origins = options.origins.toLowerCase().split(',');

  /**
   * The actual function that handles the setting of the requests and answering
   * of the OPTIONS method.
   *
   * @param {Request} req The incoming HTTP request.
   * @param {Response} res The outgoing HTTP response.
   * @param {Function} next Optional callback for middleware support.
   * @returns {Boolean}
   * @api public
   */
  return function control(req, res, next) {
    var origin = (req.headers.origin || '').toLowerCase().trim()
      , credentials = options.credentials;

    //
    // The `origin` header WILL always be send for browsers that support CORS.
    // If it's in the request headers, we should not be sending the headers as
    // it would only be pointless overhead.
    //
    // @see https://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Origin
    //
    if (!('origin' in req.headers)) {
      if ('function' === typeof next) next();
      return false;
    }

    //
    // Validate the current request to ensure that proper headers are being send
    // and that we don't answer with bullshit.
    //
    if (
         !!~origin.indexOf('%')
      || !parse(origin).protocol
      || options.origins !== '*' && !~origins.indexOf(origin)
      || !~methods.indexOf(req.method)
      // @TODO header validation
    ) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      res.end([
        'Invalid HTTP Access Control (CORS) request:',
        '  Origin: '+ req.headers.origin,
        '  Method: '+ req.method
      ].join('\n'));

      return true;
    }

    //
    // GET requests are not preflighted for CORS but the browser WILL reject the
    // content if it was requested with `withCredentials=true` and the Origin is
    // set to `*`. So we need set an non `*` Access-Control-Allow-Origin and
    // thats why we will default to the Origin.
    //
    if (
         (!methods.length || ~methods.indexOf(req.method))
      && credentials
      && options.origins === '*'
    ) {
      setHeader(res, 'Access-Control-Allow-Origin', origin);
    } else {
      setHeader(res, 'Access-Control-Allow-Origin', options.origins);
    }

    if (credentials) {
      setHeader(res, 'Access-Control-Allow-Credentials', 'true');
    }

    //
    // The HTTP Access Control (CORS) uses the OPTIONS method to preflight
    // requests to it can get approval before doing the actual request. So it's
    // vital that these requests are handled first and as soon as possible. But
    // as OPTIONS requests can also be made for other types of requests need to
    // explicitly check if the `Access-Control-Request-Method` header has been
    // sent to ensure that this is a preflight request.
    //
    if (
         'OPTIONS' === req.method
      && req.headers['access-control-request-method']
    ) {
      if (options.maxAge) {
        setHeader(res, 'Access-Control-Max-Age', options.maxAge);
      }

      if (options.methods) {
        setHeader(res, 'Access-Control-Allow-Methods', options.methods);
      }

      if (options.headers) {
        setHeader(res, 'Access-Control-Allow-Headers', options.headers);
      } else if (req.headers['access-control-request-headers']) {
        setHeader(res, 'Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
      }

      //
      // OPTION methods SHOULD be answered with a 200 status code so we're
      // correctly following the RFC 2616
      //
      // @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
      //
      res.statusCode = 200;
      res.setHeader('Content-Length', 0);
      res.end('');

      return true;
    }

    if (options.exposed) {
      setHeader(res, 'Access-Control-Expose-Headers', options.exposed);
    }

    if ('function' === typeof next) next();
    return false;
  };
}

//
// Expose the module.
//
module.exports = access;
