var auth = require('./auth');
var config = require('./config');
var httpProxy = require('http-proxy');
var log = require('bole')('proxy');


log.info('Starting proxy:', config.proxy);
var proxy = httpProxy.createProxyServer(config.proxy);

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  proxyReq.setHeader('Cookie', insert_auth_cookie(req));
  proxy_body(req, proxyReq);
});

proxy.on('proxyReqWs', function (proxyReqWs, req, res, options) {
  proxyReqWs.setHeader('Cookie', insert_auth_cookie(req));
  proxy_body(req, proxyReq);
});

function insert_auth_cookie(req) {
  return insert_cookie(req, 'user-id', auth.cookie(
    config.rstudio.user, config.rstudio.duration, config.rstudio.key));
}

function insert_cookie(req, name, value) {
  var cookies = req.get('Cookie').split('; ');

  // remove existing cookie
  cookies = cookies.filter(function (cookie) {
    return cookie.indexOf(name + '=') !== 0;
  });

  cookies.push(name + '=' + value);

  return cookies.join('; ');
}

function proxy_body(req, proxyReq) {
  if (req.body && req.body.length) {
    proxyReq.setHeader('Content-Length', content_length(req));
    write_body(req, proxyReq);
  }
}

function content_length(req) {
  return req.body.reduce(function (length, chunk) {
    return length + chunk.byteLength;
  }, 0);
}

function write_body(req, proxyReq) {
  req.body.map(function (chunk) {
    proxyReq.write(chunk);
  });
}


module.exports = proxy;
