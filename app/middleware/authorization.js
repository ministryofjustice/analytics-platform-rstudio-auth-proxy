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

module.exports = function (req, res, next) {
  if (isAuthorized(req)) {
    next();
  } else {
    res.sendStatus(403);
    next(new Error('User is not authorized'));
  }
};
