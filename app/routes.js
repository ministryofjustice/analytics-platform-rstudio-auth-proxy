var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var express = require('express');
var middleware = require('./middleware');
var passport = require('passport');
var proxy = require('./proxy');
var router = new express.Router();


router.get('/login', function(req, res) {
  res.render('login.html', {env: process.env});
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

router.get('/auth-sign-out', function (req, res) {
  req.logout();
  res.redirect('/login');
});

router.get('/callback', [
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
]);

router.all(/.*/, [
  ensureLoggedIn('/login'),
  middleware.denyUnauthorized,
  function(req, res) {
    parseBody(req).then(function (body) {
      req.body = body;
      proxy.web(req, res);
    });
  }
]);

function parseBody(req) {
  var body = [];
  return new Promise(function (resolve, reject) {
    req.on('data', function (chunk) { body.push(chunk); });
    req.on('end', function () { resolve(body); });
    req.on('error', function (err) { reject(err); });
  });
}


module.exports = router;
