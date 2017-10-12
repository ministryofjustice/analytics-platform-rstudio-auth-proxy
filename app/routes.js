var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var express = require('express');
var middleware = require('./middleware');
var passport = require('passport');
var router = new express.Router();


router.get('/login', function(req, res){
  res.render('login.html', {env: process.env});
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
);

router.all(/.*/, [
  ensureLoggedIn,
  middleware.denyUnauthorized,
  function(req, res, next) {

    if (req.method === 'POST') {
      proxyPostRequest(req, res);

    } else {
      proxy.web(req, res);
    }
  }
]);

function proxyPostRequest(req, res) {
  req.body = '';
  req.addListener('data', function (chunk) {
    req.body += chunk;
  });
  req.addListener('end', function () {
    proxy.web(req, res);
  });
}

module.exports = router;
