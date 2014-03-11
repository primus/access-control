describe('access-control', function () {
  'use strict';

  var request = require('request')
    , access = require('../')
    , http = require('http')
    , chai = require('chai')
    , expect = chai.expect
    , server
    , cors;

  chai.Assertion.includeStack = true;

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

    it('only handles preflight when send with Access-Control-Request-Method', function (next) {
      cors = access();

      server = http.createServer(function (req, res) {
        expect(cors(req, res)).to.equal(false);

        res.statusCode = 404;
        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          method: 'OPTIONS',
          headers: {
            Origin: 'http://example.com',
          }
        }, function (err, res, body) {
          if (err) return next(err);

          expect(res.statusCode).to.equal(404);
          expect(body).to.equal('foo');

          next();
        });
      });
    });

    it('optionally adds the Access-Control-Max-Age header', function (next) {
      cors = access({ maxAge: '1 day' });

      server = http.createServer(function (req, res) {
        if (cors(req, res)) return;

        res.statusCode = 404;
        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          method: 'OPTIONS',
          headers: {
            Origin: 'http://example.com',
            'Access-Control-Request-Method': 'GET'
          }
        }, function (err, res, body) {
          if (err) return next(err);

          expect(res.statusCode).to.equal(200);
          expect(res.headers['access-control-max-age']).to.equal('86400');

          next();
        });
      });
    });

    it('optionally adds the Access-Control-Allow-Methods header');
    it('optionally adds the Access-Control-Allow-Headers header');

    it('returns true when it handled the request', function (next) {
      cors = access();

      server = http.createServer(function (req, res) {
        expect(cors(req, res)).to.equal(true);

        res.statusCode = 404;
        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          method: 'OPTIONS',
          headers: {
            Origin: 'http://example.com',
            'Access-Control-Request-Method': 'GET'
          }
        }, function (err, res, body) {
          if (err) return next(err);

          expect(body).to.equal('');
          expect(+res.headers['content-length']).to.equal(0);

          next();
        });
      });
    });

    it('answers with a 200 OK', function (next) {
      cors = access();

      server = http.createServer(function (req, res) {
        if (cors(req, res)) return;

        res.statusCode = 404;
        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          method: 'OPTIONS',
          headers: {
            Origin: 'http://example.com',
            'Access-Control-Request-Method': 'GET'
          }
        }, function (err, res, body) {
          if (err) return next(err);

          expect(res.statusCode).to.equal(200);
          next();
        });
      });
    });
  });

  describe('validation', function () {
    it('only allows valid origin headers', function (next) {
      cors = access();

      server = http.createServer(function (req, res) {
        if (cors(req, res)) return;

        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          headers: {
            Origin: 'http://example.com%'
          },
          method: 'GET'
        }, function (err, res, body) {
          if (err) return next(err);
          expect(res.statusCode).to.equal(403);

          request({
            uri: 'http://localhost:'+ port,
            headers: {
              Origin: 'example.co'
            },
            method: 'GET'
          }, function (err, res, body) {
            if (err) return next(err);

            expect(res.statusCode).to.equal(403);

            request({
              uri: 'http://localhost:'+ port,
              headers: {
                Origin: ''
              },
              method: 'GET'
            }, function (err, res, body) {
              if (err) return next(err);

              expect(res.statusCode).to.equal(403);

              next();
            });
          });
        });
      });
    });

    it('only accepts allowed origin headers', function (next) {
      cors = access({
        origins: 'http://example.com',
        credentials: false
      });

      server = http.createServer(function (req, res) {
        if (cors(req, res)) return;

        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          headers: {
            Origin: 'http://example.com'
          },
          method: 'GET'
        }, function (err, res, body) {
          if (err) return next(err);

          expect(body).to.equal('foo');
          expect(res.statusCode).to.equal(200);
          expect(res.headers['access-control-allow-origin']).to.equal('http://example.com');

          request({
            uri: 'http://localhost:'+ port,
            headers: {
              Origin: 'http://example.co'
            },
            method: 'GET'
          }, function (err, res, body) {
            if (err) return next(err);

            expect(res.statusCode).to.equal(403);
            expect(res.headers).to.not.have.property('access-control-allow-origin');

            next();
          });
        });
      });
    });

    it('only accepts allowed methods', function (next) {
      cors = access({
        methods: ['GET', 'OPTIONS'],
        credentials: false
      });

      server = http.createServer(function (req, res) {
        if (cors(req, res)) return;

        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          headers: {
            Origin: 'http://example.com'
          },
          method: 'GET'
        }, function (err, res, body) {
          if (err) return next(err);

          expect(body).to.equal('foo');
          expect(res.statusCode).to.equal(200);
          expect(res.headers['access-control-allow-origin']).to.equal('*');

          request({
            uri: 'http://localhost:'+ port,
            headers: {
              Origin: 'http://example.com'
            },
            method: 'POST',
            json: { foo: 'bar' }
          }, function (err, res, body) {
            if (err) return next(err);

            expect(res.statusCode).to.equal(403);
            expect(res.headers).to.not.have.property('access-control-allow-origin');

            next();
          });
        });
      });
    });

    it('only accepts allowed headers');

    it('returns true when invalid responses are handled', function (next) {
      cors = access({
        methods: ['POST']
      });

      server = http.createServer(function (req, res) {
        expect(cors(req, res)).to.equal(true);
        res.end('foo');
      }).listen(++port, function listening() {
        request({
          uri: 'http://localhost:'+ port,
          headers: {
            Origin: 'http://example.com'
          },
          method: 'GET'
        }, function (err, res, body) {
          expect(res.statusCode).to.equal(403);
          next();
        });
      });
    });
  });
});
