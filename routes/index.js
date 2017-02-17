var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();

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
  ws: true
});

proxy.on('error', function(e) {
  console.log('Error connecting');
  console.log(e);
});

// Get username from request (lowercase)
//
// username is used in k8s resource labels, which only allow lowercase
function userFromRequest(req) {
  if (req && req.user && req.user.__json && req.user.__json.nickname) {
    return req.user.__json.nickname.toLowerCase()
  } else {
    return null
  }
}

// True for the owner of the machine/k8s namespace, false otherwise
function isAuthorised(username) {
  return username === env.USER
}

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  var username = userFromRequest(req)

  if (username) {
    console.log('Setting X-RStudio-Username=' + nickname)
    proxyReq.setHeader('X-RStudio-Username', nickname)
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

/* Handle auth callback */
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
);

/* Proxy RStudio login URL */
router.all('/auth-sign-in', function(req, res, next) {
  proxy.web(req, res);
});

router.all('/favicon.ico', function(req, res, next) {
  proxy.web(req, res);
});

/* Authenticate and proxy all other requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {
  var username = userFromRequest(req)
  console.log('Username from request = ' + username)

  if (isAuthorised(username)) {
    proxy.web(req, res);
  } else {
    // Not the owner of the machine - 403 FORBIDDEN
    console.log('403 FORBIDDEN for user ' + username)
    res.sendStatus(403);
  }
});


module.exports = router;
