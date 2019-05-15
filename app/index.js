require('dotenv').config();
const bole = require('bole');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const Auth0Strategy = require('passport-auth0-openidconnect').Strategy;
const authorization = require('./middleware/authorization');
const { compose } = require('compose-middleware');

const config = require('./config');
const errors = require('./errors');
const routes = require('./routes');


const app = express();
app.set('views', path.join(__dirname, 'views'));

// add before logging to avoid favicon requests in logs
app.use(require('serve-favicon')(path.join(__dirname, 'favicon.ico')));

bole.output({ level: config.log.level, stream: process.stdout });

const logger = morgan('combined');
const cookieParser = require('cookie-parser')();
const session = require('express-session')(config.session);

app.use(logger);
app.use(cookieParser);
app.use(session);

const strategy = new Auth0Strategy(
  config.auth0,
  ((req, issuer, audience, profile, accessToken, refreshToken, params, callback) => {
    req.session.id_token = params.id_token;

    return callback(null, profile._json);
  }),
);
// Original implementation in `passport-openidconnect` ignore options by
// returning `{}`.
//
// `passport-auth0-openidconnect` is supposed to override it but it doesn't.
//
// See: https://github.com/siacomuzzi/passport-openidconnect/blob/master/lib/strategy.js#L338
Auth0Strategy.prototype.authorizationParams = (options) => options;
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const initialize = passport.initialize();
const passportSession = passport.session();
app.use(initialize);
app.use(passportSession);

app.use(routes);
app.use(errors);
app.set('websocketMiddleware', compose([
  logger,
  cookieParser,
  session,
  initialize,
  passportSession,
  authorization,
]));

module.exports = app;
