const NotFoundError = require('./errors/not-found-err');
const BadRequestError = require('./errors/bad-request-err');
const UnauthorizedError = require('./errors/unauthorized-err');
const ConflictingRequestError = require('./errors/conflicting-request-err');
const ForbiddenError = require('./errors/forbidden-err');

module.exports = {
  NotFoundError, BadRequestError, UnauthorizedError, ConflictingRequestError, ForbiddenError,
};
