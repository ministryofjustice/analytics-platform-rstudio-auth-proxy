var config = require('./config');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var express = require('express');
var authorisation = require('./authorisation');
var passport = require('passport');
var proxy = require('./proxy');
var router = new express.Router();
const uuidv4 = require('uuid/v4');


const RETURN_TO = encodeURI(`${config.app.protocol}://${config.app.host}`);
const SSO_LOGOUT_URL = `https://${config.auth0.domain}${config.auth0.sso_logout_url}?returnTo=${RETURN_TO}&client_id=${config.auth0.clientID}`;


router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) {
    if (/^http/.test(req.session.returnTo)) {
      res.send(400, 'URL must be relative');
    } else {
      res.redirect(req.session.returnTo);
    }
  } else {
    passport.authenticate('auth0-oidc', {
      state: uuidv4(),
    })(req, res, next);
  }
});

function logout(req, res) {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie(config.session.name);
    res.redirect(SSO_LOGOUT_URL);
  });
}

router.get('/logout', logout);
router.get('/auth-sign-out', logout);

router.get('/callback', [
  passport.authenticate('auth0-oidc', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/');
  }
]);

router.all(/.*/, [
  ensureLoggedIn('/login'),
  authorisation,
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
