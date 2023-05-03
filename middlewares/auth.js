const jwt = require('jsonwebtoken');
const { NotFoundError, UnauthorizedError } = require('../utils/errors');

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    return next(new NotFoundError('Токен не найден'));
  }

  let payload;

  try {
    payload = jwt.verify(req.cookies.jwt, 'secret-key');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;
  return next();
};
