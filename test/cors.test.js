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
});
