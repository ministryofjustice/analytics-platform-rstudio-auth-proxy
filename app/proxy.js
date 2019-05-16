const auth = require('./auth');
const config = require('./config');
const httpProxy = require('http-proxy');
const log = require('bole')('proxy');


var proxy = httpProxy.createProxyServer(config.proxy);

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  proxyReq.setHeader('Cookie', insert_auth_cookie(req));
  set_content_lenght(req, proxyReq);
});

proxy.on('proxyReqWs', function (proxyReqWs, req, res, options) {
  proxyReqWs.setHeader('Cookie', insert_auth_cookie(req));
  set_content_lenght(req, proxyReqWs);
});

proxy.on('error', function (err) {
  log.error(err);
});

function insert_auth_cookie(req) {
  return insert_cookie(req, 'user-id', auth.cookie(
    config.rstudio.user, config.rstudio.duration, config.rstudio.key));
}

function insert_cookie(req, name, value) {
  log.debug('cookie header:', req.headers['Cookie']);
  var cookies = (req.headers['Cookie'] || '').split('; ');

  // remove existing cookie
  cookies = cookies.filter(function (cookie) {
    return cookie.indexOf(name + '=') !== 0;
  });

  cookies.push(name + '=' + value);

  return cookies.join('; ');
}

function set_content_lenght(req, proxyReq) {
  if (req.headers['content-length']) {
    proxyReq.setHeader('Content-Length', req.headers['content-length']);
  }
}


module.exports = proxy;
