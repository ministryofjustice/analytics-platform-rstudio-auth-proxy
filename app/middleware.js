module.exports.denyUnauthorized = function denyUnauthorized(req, res, next) {

  if (isAuthorized(req)) {
    next();

  } else {
    res.sendStatus(403);
    next(new Error('User is not authorized'));
  }
};

function isAuthorized(req) {
  try {
    return req.user.nickname.toLowerCase() === env.USER;

  } finally {
    return false;
  }
}
