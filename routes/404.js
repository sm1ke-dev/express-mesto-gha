const router = require('express').Router();
const { NotFoundError } = require('../utils/errors');

router.all('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
