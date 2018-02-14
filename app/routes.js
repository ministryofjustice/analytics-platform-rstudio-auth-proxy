const { ensureLoggedIn } = require('connect-ensure-login');
const express = require('express');
const passport = require('passport');
const uuidv4 = require('uuid/v4');

const config = require('./config');
const authorization = require('./middleware/authorization');
const proxy = require('./proxy');


const router = new express.Router();

const RETURN_TO = encodeURI(`${config.app.protocol}://${config.app.host}`);
const SSO_LOGOUT_URL = `https://${config.auth0.domain}${config.auth0.sso_logout_url}?returnTo=${RETURN_TO}&client_id=${config.auth0.clientID}`;


router.get('/login', (req, res, next) => {
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
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  },
]);

router.all(/.*/, [
  ensureLoggedIn('/login'),
  authorization,
  (req, res) => {
    parseBody(req).then((body) => {
      req.body = body;
      proxy.web(req, res);
    });
  },
]);

function parseBody(req) {
  let body = [];
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => { body.push(chunk); });
    req.on('end', () => { resolve(body); });
    req.on('error', (err) => { reject(err); });
  });
}


module.exports = router;
