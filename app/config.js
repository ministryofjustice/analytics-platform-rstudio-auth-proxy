var join = require('path').join;
var config = module.exports;


config.express = {
  port: process.env.EXPRESS_PORT || 3000,
  host: process.env.EXPRESS_HOST || '127.0.0.1'
};

config.log = {
  level: process.env.LOG_LEVEL || 'debug'
};

config.session = {
  secret: process.env.COOKIE_SECRET || 'shh-its-a-secret',
  resave: true,
  saveUninitialized: true
};

config.auth0 = {
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

config.proxy = {
  target: {
    host: process.env.PROXY_TARGET_HOST,
    port: process.env.PROXY_TARGET_PORT
  },
  ws: true,
  preserveHeaderKeyCase: true,
  proxyTimeout: process.env.PROXY_TIMEOUT || (24 * 60 * 60 * 1000)
};

config.rstudio = {
  user: process.env.RSTUDIO_USER || process.env.USER,
  duration: (24 * 60 * 60 * 1000),
  key: process.env.SECURE_COOKIE_KEY
};
