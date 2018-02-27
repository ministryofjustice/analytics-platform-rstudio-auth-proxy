const config = module.exports;


config.app = {
  protocol: process.env.APP_PROTOCOL || 'http',
  host: process.env.APP_HOST || 'localhost:3000',
};

config.express = {
  port: process.env.EXPRESS_PORT || 3000,
  host: process.env.EXPRESS_HOST || '127.0.0.1',
};

config.log = {
  level: process.env.LOG_LEVEL || 'debug',
};

config.session = {
  name: 'session',
  resave: true,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET || 'shh-its-a-secret',
  cookie: {
    // `COOKIE_MAXAGE` in seconds (defaults to 1 hour = 3,600,000 ms)
    maxAge: (Number.parseInt(process.env.COOKIE_MAXAGE, 10) || 3600) * 1000,
  },
};

config.auth0 = {
  callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  domain: process.env.AUTH0_DOMAIN,
  passReqToCallback: true,
  prompt: 'none',
  scope: 'profile',
  sso_logout_url: '/v2/logout',
};

config.proxy = {
  target: {
    host: process.env.PROXY_TARGET_HOST,
    port: process.env.PROXY_TARGET_PORT,
  },
  ws: true,
  preserveHeaderKeyCase: true,
  proxyTimeout: process.env.PROXY_TIMEOUT || (24 * 60 * 60 * 1000),
};

config.rstudio = {
  user: process.env.RSTUDIO_USER || process.env.USER,
  duration: (24 * 60 * 60 * 1000),
  key: process.env.SECURE_COOKIE_KEY,
};
