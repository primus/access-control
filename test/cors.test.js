describe('access-control', function () {
  'use strict';

  var request = require('request')
    , access = require('../')
    , http = require('http')
    , chai = require('chai')
    , expect = chai.expect
    , server
    , cors;

  //
  // Port number for the HTTP server;
  //
  var port = 1024;

  afterEach(function (next) {
    if (!server) return next();

    server.close();
    next();
  });

  it('exposes it self as an function', function () {
    expect(access).to.be.a('function');
  });

  it('returns a function after configuring', function () {
    expect(access()).to.be.a('function');
  });

  it('does not send Access-* headers if the origin header is missing', function (next) {
    cors = access();

    server = http.createServer(function (req, res) {
      if (cors(req, res)) return;

      res.end('foo');
    }).listen(++port, function listening() {
      request('http://localhost:'+ port, function (err, res, body) {
        if (err) return next(err);

        expect(body).to.equal('foo');
        expect(res.headers).to.not.have.property('access-control-allow-origin');

        next();
      });
    });
  });

  it('accepts empty origin headers which are send when using datauris');

  it('sets the origin to the Origin header for GET requests with credentials');

  describe('preflight', function () {
    it('contains a Access-Control-Allow-Origin header');
    it('only handles preflight when send with Access-Control-Request-Method');
    it('optionally adds the Access-Control-Max-Age header');
    it('optionally adds the Access-Control-Allow-Methods header');
    it('optionally adds the Access-Control-Allow-Headers header');
    it('returns true when it handled the request');
    it('answers with a 200 OK');
  });

  describe('validation', function () {
    it('only allows valid origin headers');
    it('only accepts allowed methods');
    it('only accepts allowed origins');
    it('only accepts allowed headers');
  });
});
