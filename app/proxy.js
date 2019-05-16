const auth = require('./auth');
const config = require('./config');
const httpProxy = require('http-proxy');
const log = require('bole')('proxy');


var proxy = httpProxy.createProxyServer(config.proxy);

proxy.on('proxyReq', proxyRequest);
proxy.on('proxyReqWs', proxyRequest);
proxy.on('error', function (err) {
  log.error(err);
});

function proxyRequest(proxyReq, req, res, options) {
  const secureCookie = auth.secureCookie(
    config.rstudio.user,
    config.rstudio.duration,
    config.rstudio.key,
  );
  const cookies = insertCookie(req, 'user-id', secureCookie);

  proxyReq.setHeader('Cookie', cookies);
  if (req.headers['content-length']) {
    proxyReq.setHeader('Content-Length', req.headers['content-length']);
  }
};

function insertCookie(req, name, value) {
  log.debug('cookie header:', req.headers['Cookie']);
  var cookies = (req.headers['Cookie'] || '').split('; ');

  // remove existing cookie
  cookies = cookies.filter(function (cookie) {
    return cookie.indexOf(name + '=') !== 0;
  });

  cookies.push(name + '=' + value);

  return cookies.join('; ');
}


module.exports = proxy;
