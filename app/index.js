require('dotenv').config();
var bole = require('bole');
var config = require('./config');
var morgan = require('morgan');
var nunjucks = require('nunjucks');
var passport = require('passport');
var path = require('path');
var Auth0Strategy = require('passport-auth0');


var app = require('express')();
app.set('views', path.join(__dirname, 'views'));

bole.output({level: config.log.level, stream: process.stdout});
app.use(morgan('combined'));

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

app.use(require('cookie-parser')());
app.use(require('express-session')(config.session));

passport.use(new Auth0Strategy(
  config.auth0,
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
));

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
