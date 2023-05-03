const {
  NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError,
} = require('../utils/errors');
const Card = require('../models/card');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Некорректно заполненные данные');
      }
      throw err;
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .orFail(() => {
            throw new Error('"id" is not found');
          })
          .then((cards) => res.send({ data: cards }))
          .catch((err) => {
            if (err.message === '"id" is not found') {
              throw new NotFoundError('Карточка с указанным id не найдена');
            } if (err.name === 'CastError') {
              throw BadRequestError('Некорректно введенный id');
            }
            throw err;
          })
          .catch(next);
      } else {
        return Promise.reject(new Error('Not user card'));
      }
    })
    .catch((err) => {
      console.log('Нет такой карточки =>', err);
      if (err.message === 'Not user card') {
        throw new ForbiddenError('Вы не можете удалить чужую карточку');
      } else if (err.message === '"id" is not found') {
        throw new NotFoundError('Карточка с указанным id не найдена');
      }
      throw err;
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((card) => card.populate('likes'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } if (err.name === 'CastError') {
        throw new BadRequestError('Некорректно введенный id');
      }
      throw err;
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } if (err.name === 'CastError') {
        throw new BadRequestError('Некорректно введенный id');
      }
      throw err;
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
