var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var crypto = require('crypto');
var router = express.Router();


function formatDate(d) {
  // Eg: Thu, 01 Aug 2017 07:05:08 GMT
  var dateString = d.toLocaleString('en-US', {
    'weekday': 'short', 'day': '2-digit', 'month': 'short', 'year': 'numeric',
    'hour': 'numeric', 'minute': 'numeric', 'second': 'numeric',
    'hour12': false, 'timeZone': 'GMT', 'timeZoneName': 'short'
  });
  var parts = dateString.split(' ');
  // swap month and day
  parts[2] = [parts[1], parts[1] = parts[2]][0];
  // strip comma from day and year
  parts[1] = parts[1].slice(0, 2);
  parts[3] = parts[3].slice(0, 4);
  return parts.join(' ');
}


function expiry(duration) {
  var expires = new Date();
  expires.setTime(expires.getTime() + duration);
  return expires;
}


function base64HMAC(message, key) {
  return crypto.createHmac('SHA256', key).update(message).digest('base64')
}


function secureCookie(value, validDuration) {
  var expires = formatDate(expiry(validDuration));
  var hmac = base64HMAC(value + expires, process.env.SECURE_COOKIE_KEY);
  return [value, expires, hmac].map(encodeURIComponent).join('|');
}


function setAuthCookie(req) {
  var staySignedInDays = process.env.STAY_SIGNED_IN_DAYS || 1;
  var duration = staySignedInDays * 24 * 60 * 60 * 1000;
  cookie = [
    'user-id=' + secureCookie('rstudio', duration),
    'Path=/',
    'HttpOnly'
  ].join('; ');
  req.setHeader('Cookie', cookie);
}

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
  proxy.web(req, res);
});


module.exports = router;
