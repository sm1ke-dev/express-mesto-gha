const express = require('express');
const mongoose = require('mongoose');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', { useNewUrlParser: true });

app.use((req, res, next) => {
  req.user = {
    _id: '644ad635cc9c8f4bd82e5087',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.post('/signin', login);
app.post('/signup', createUser);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
