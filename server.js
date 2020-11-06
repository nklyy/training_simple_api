// Libs
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const passport = require('./utils/passportSetup');

// Routs
const { router } = require('./routers/auth.router');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Session

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routs
app.use('/auth', router);

const optMongo = {
  promiseLibrary: global.Promise,
  poolSize: 50, // Количество одновременных подключений
  keepAlive: 30000, // Время сколько будет проверят живой конекшен или нет
  connectTimeoutMS: 5000, // Соединение 5 сек
  useNewUrlParser: true, // Для парсинга ссылки
  useFindAndModify: false, // Что бы можно было модифицировать
  useCreateIndex: true, // Для создания индексов
  useUnifiedTopology: true,
  // Отключаем автоматическое создание индексов.
  // Что бы создать индексы надо воспользоваться командой createIndexes.
  autoIndex: false,
};

async function start() {
  try {
    await mongoose.connect(process.env.DB, optMongo);

    app.listen(PORT, () => {
      console.log(`Server has been started on ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
