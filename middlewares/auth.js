const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let payload;

  try {
    payload = jwt.verify(req.cookies.jwt, 'secret-key');
  } catch (err) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  next();
};
