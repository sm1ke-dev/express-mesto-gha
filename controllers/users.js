const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, CONFLICT_REQUEST,
} = require('../utils/errors');
const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' }));
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        res.status(NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно введенный id' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно заполненные данные' });
      } else if (err.code === 11000) {
        res.status(CONFLICT_REQUEST).send({ message: 'Пользователь с таким Email уже существует' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new Error('User is not found');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно заполненные данные' });
      } else if (err.message === 'User is not found') {
        res.status(NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new Error('User is not found');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно заполненные данные' });
      } else if (err.message === 'User is not found') {
        res.status(NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const getMyInfo = (req, res) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        res.status(NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Некорректно введенный id' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });
      res.send({ token });
    })
    .catch((err) => res.status(401).send({ message: err.message }));
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  getMyInfo,
  login,
};
