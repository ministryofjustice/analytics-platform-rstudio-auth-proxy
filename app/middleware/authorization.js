const config = require('../config');
const log = require('bole')('middleware');


function isAuthorized(req) {
  try {
    return req.user.nickname.toLowerCase() === config.rstudio.user;
  } catch (error) {
    log.error('Error while checking user nickname: ', error);
  }

  return false;
}

module.exports = (req, res, next) => {
  if (isAuthorized(req)) {
    next();
  } else {
    const err = new Error('User is not authorized');
    if (Object.prototype.hasOwnProperty.call(res, 'end')) {
      // if res is a stream / socket instead of a ServerResponse then close it
      res.end();
      throw err;
    } else {
      // else set the status to 403 because it's a http.ServerResponse
      res.sendStatus(403);
    }
    next(err);
  }
};
