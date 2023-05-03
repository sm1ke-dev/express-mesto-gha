const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  NotFoundError, BadRequestError, UnauthorizedError, ConflictingRequestError,
} = require('../utils/errors');
const User = require('../models/user');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } if (err.name === 'CastError') {
        throw new BadRequestError('Некорректно введенный id');
      }
      throw err;
    })
    .catch(next);
};

const createUser = (req, res, next) => {
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
        throw new BadRequestError('Некорректно заполненные данные');
      } if (err.code === 11000) {
        throw new ConflictingRequestError('Пользователь с таким Email уже существует');
      }
      throw err;
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
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
        throw new BadRequestError('Некорректно заполненные данные');
      } if (err.message === 'User is not found') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      throw err;
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
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
        throw new BadRequestError('Некорректно заполненные данные');
      } if (err.message === 'User is not found') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      throw err;
    })
    .catch(next);
};

const getMyInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new Error('"id" is not found');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === '"id" is not found') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } if (err.name === 'CastError') {
        throw new BadRequestError('Некорректно введенный id');
      }
      throw err;
    })
    .catch(next);
};

const login = (req, res, next) => {
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
    .catch(() => {
      next(new UnauthorizedError('Ошибка авторизации'));
    });
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
