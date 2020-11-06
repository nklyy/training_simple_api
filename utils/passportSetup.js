const { Strategy } = require('passport-http-bearer');
const passport = require('passport');
const userModel = require('../model/user.model');
const tokenModel = require('../model/token.model');

passport.use(new Strategy(async (token, done) => {
  // Ищем токен.
  const userToken = await tokenModel.findOne({ token });

  if (!userToken) {
    return done(null, false);
  }

  // Ищем пользователя.
  const user = await userModel.findOne({ _id: userToken.userId }).select('-password');

  if (!user) {
    return done(null, false);
  }

  // Продлеваем время токена при запросе.
  const updateUser = await tokenModel.findOneAndUpdate({ userId: user._id }, { $set: { create: Date.now() } });

  if (!updateUser) {
    return done(null, false);
  }

  // Если все успешно возвращаем пользователя в req.user.
  return done(null, user);
}));

module.exports = passport;
