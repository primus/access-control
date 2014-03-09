'use strict';

var setHeader = require('setheader')
  , ms = require('ms');

/**
 * Configure the CORS / Access Control headers.
 *
 * @param {Object} options
 * @returns {Function}
 * @api public
 */
function access(options) {
  options = options || {};

  // The allowed origin of the request.
  options.origin = 'origin' in options
    ? options.origin
    : '*';

  // The allowed methods for the request.
  options.methods = 'methods' in options
    ? options.methods
    : ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'];

  // Allow sending of authorization and cookie information.
  options.credentials = 'credentials' in options
    ? options.credentials
    : true;

  // Cache duration of the preflight/OPTIONS request.
  options.maxAge = 'maxAge' in options
    ? options.maxAge
    : '1 year';

  // The allowed request headers.
  options.headers = 'headers' in options
    ? options.headers
    : null;

  // Server headers exposed to the user agent.
  options.exposed = 'exposed' in options
    ? options.exposed
    : null;

  //
  // Be a bit flexible in the way the arguments are supplied, transform Array's
  // in to strings and human readable numbers strings in to numbers.
  //
  if (Array.isArray(options.methods)) options.methods = options.methods.join(',');
  if (Array.isArray(options.headers)) options.headers = options.headers.join(',');
  if (Array.isArray(options.exposed)) options.exposed = options.exposed.join(',');
  if ('string' === typeof options.maxAge) options.maxAge = ms(options.maxAge);

  /**
   * The actual function that handles the setting of the requests and answering
   * of the OPTIONS method.
   *
   * @param {Request} req The incoming HTTP request.
   * @param {Response} res The outgoing HTTP response.
   * @returns {Boolean}
   * @api public
   */
  return function control(req, res) {
    var credentials = options.credentials;

    //
    // The `origin` header WILL always be send for browsers that support CORS.
    // If it's in the request headers, we should not be sending the headers as
    // it would only be pointless overhead.
    //
    // @see https://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Origin
    //
    if (!('origin' in req.headers)) return false;

    //
    // GET requests are not preflighted for CORS but the browser WILL reject the
    // content if it was requested with `withCredentials=true` and the Origin is
    // set to `*`. So we need set an non `*` Access-Control-Allow-Origin and
    // thats why we will default to the Origin.
    //
    if (
         'GET' === req.method
      && options.credentials
      && options.origin === '*'
    ) {
      setHeader(res, 'Access-Control-Allow-Origin', req.headers.origin);
    } else {
      setHeader(res, 'Access-Control-Allow-Origin', options.origin);
    }

    if (options.credentials) {
      setHeader(res, 'Access-Control-Allow-Credentials', 'true');
    }

    //
    // The HTTP Access Control (CORS) uses the OPTIONS method to preflight
    // requests to it can get approval before doing the actual request. So it's
    // vital that these requests are handled first and as soon as possible.
    //
    if ('OPTIONS' === req.method) {
      if (options.maxAge) {
        setHeader(res, 'Access-Control-Max-Age', options.maxAge);
      }

      if (options.methods) {
        setHeader(res, 'Access-Control-Allow-Methods', options.methods);
      }

      if (options.headers) {
        setHeader(res, 'Access-Control-Allow-Headers', options.headers);
      } else if (req.headers['access-control-request-headers']) {
        setHeader(res, req.headers['access-control-request-headers']);
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

    return false;
  };
}

//
// Expose the module.
//
module.exports = access;
