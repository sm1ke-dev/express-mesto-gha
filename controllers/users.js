const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Что-то пошло не так' }));
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        res.status(404).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректно введенный id' });
      } else {
        res.status(500).send({ message: 'Что-то пошло не так' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректно заполненные данные' });
      } else {
        res.status(500).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректно заполненные данные' });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(500).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректно заполненные данные' });
      } else if (err.name === 'CastError') {
        res.status(404).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(500).send({ message: 'Что-то пошло не так' });
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
