var config = require('./config');


module.exports.denyUnauthorized = function (req, res, next) {

  if (isAuthorized(req)) {
    next();

  } else {
    res.sendStatus(403);
    next(new Error('User is not authorized'));
  }
};

function isAuthorized(req) {
  try {
    return req.user.nickname.toLowerCase() === config.rstudio.user;

  } catch (error) {
    // do nothing
  }

  return false;
}
