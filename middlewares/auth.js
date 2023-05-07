const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    return next(new UnauthorizedError('Токен не найден'));
  }

  let payload;

  try {
    payload = jwt.verify(req.cookies.jwt, 'secret-key');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  res.cookie('user', payload, {
    maxAge: 3600000 * 24 * 7,
    httpOnly: true,
  });
  return next();
};
