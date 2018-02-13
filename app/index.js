require('dotenv').config();
var bole = require('bole');
var config = require('./config');
var morgan = require('morgan');
var nunjucks = require('nunjucks');
var passport = require('passport');
var path = require('path');
const Auth0Strategy = require('passport-auth0-openidconnect').Strategy;


var app = require('express')();
app.set('views', path.join(__dirname, 'views'));

// add before logging to avoid favicon requests in logs
app.use(require('serve-favicon')(path.join(__dirname, 'favicon.ico')));

bole.output({level: config.log.level, stream: process.stdout});
app.use(morgan('combined'));

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

app.use(require('cookie-parser')());
app.use(require('express-session')(config.session));

strategy = new Auth0Strategy(
  config.auth0,
  ((req, issuer, audience, profile, accessToken, refreshToken, params, callback) => {
    req.session.id_token = params.id_token;
    return callback(null, profile._json);
  }),
);
passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./routes'));
app.use(require('./errors'));


module.exports = app;
