var express = require('express');
var passport = require('passport');
var http = require('http');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var setAuthCookie = require('../auth');


var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  USER: process.env.USER,
}

var proxy = httpProxy.createProxyServer({
  target: {
    host: process.env.SHINY_HOST,
    port: process.env.SHINY_PORT
  },
  ws: true,
  preserveHeaderKeyCase: true,
  proxyTimeout: (24 * 60 * 60 * 1000) // 1 day
});

proxy.on('error', function(e) {
  console.log('Error connecting');
  console.log(e);
});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  setAuthCookie(proxyReq);
  if (req.body) {
    let length = Buffer.byteLength(req.body);
    proxyReq.setHeader('Content-Length', length);
    proxyReq.write(req.body);
  }
});

/* Handle login */
router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  }
);

/* Handle logout */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

router.post('/auth-sign-out', function (req, res) {
  req.logout();
  res.redirect('/login');
});

/* Handle auth callback */
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
);

/* Authenticate and proxy all other requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {
  if (req.method == 'POST') {
    req.body = '';
    req.addListener('data', function (chunk) {
      req.body += chunk;
    });
    req.addListener('end', function () {
      proxy.web(req, res);
    });
  } else {
    proxy.web(req, res);
  }
});


module.exports = router;
