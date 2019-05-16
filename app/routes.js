const { ensureLoggedIn } = require('connect-ensure-login');
const express = require('express');
const passport = require('passport');

const config = require('./config');
const authorization = require('./middleware/authorization');
const proxy = require('./proxy');


const router = new express.Router();

const RETURN_TO = encodeURI(`${config.app.protocol}://${config.app.host}`);
const SSO_LOGOUT_URL = `https://${config.auth0.domain}${config.auth0.sso_logout_url}?returnTo=${RETURN_TO}&client_id=${config.auth0.clientID}`;


router.get('/healthz', (req, res) => res.sendStatus(200));

router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    if (/^http/.test(req.session.returnTo)) {
      res.send(400, 'URL must be relative');
    } else {
      res.redirect(req.session.returnTo);
    }
  } else {
    passport.authenticate(
      'auth0-oidc',
      { prompt: req.query.prompt || config.auth0.prompt },
    )(req, res, next);
  }
});

router.get(['/logout', '/auth-sign-out'], (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie(config.session.name);
    res.redirect(SSO_LOGOUT_URL);
  });
});

router.get('/callback', [
  passport.authenticate('auth0-oidc', { failureRedirect: '/login?prompt=true' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  },
]);

router.all(/.*/, [
  ensureLoggedIn('/login'),
  authorization,
  (req, res) => {
    proxy.web(req, res);
  },
]);


module.exports = router;
