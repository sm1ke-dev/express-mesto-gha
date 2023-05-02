const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно заполненные данные' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .orFail(() => {
            throw new Error('"id" is not found');
          })
          .then((cards) => res.send({ data: cards }))
          .catch((err) => {
            if (err.message === '"id" is not found') {
              res.status(NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
            } else if (err.name === 'CastError') {
              res.status(BAD_REQUEST).send({ message: 'Некорректно введенный id' });
            } else {
              res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
            }
          });
      } else {
        return Promise.reject(new Error('Not user card'));
      }
    })
    .catch((err) => {
      if (err.message === 'Not user card') {
        res.status(BAD_REQUEST).send({ message: 'Вы не можете удалить чужую карточку' });
      }
    });
};

const likeCard = (req, res) => {
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
        res.status(NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
      } else if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно введенный id' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const dislikeCard = (req, res) => {
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
        res.status(NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
      } else if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно введенный id' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
