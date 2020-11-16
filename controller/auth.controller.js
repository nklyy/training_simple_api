// Lib
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const bc = require('bcrypt');

// Model
const tokenModel = require('../model/token.model');
const userModel = require('../model/user.model');

require('dotenv').config();

// Model Controller
const UserModelController = require('./modelControllers/auth.m.controller');

class UserController {
  static async signin(req, res) {
    try {
      const user = await userModel.findOne({ userId: req.body.id });

      if (!user) {
        throw new Error('User not found!');
      }

      const pass = await bc.compare(req.body.password, user.password);

      if (!pass) {
        throw new Error('Incorrect password!');
      }

      const token = jwt.sign({ id: user.userId, password: user.password }, process.env.PASSWORD_JWT);
      await tokenModel.create({ userId: user._id, token });

      res.status(200).json({ token });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  static async signup(req, res) {
    try {
      const data = await UserModelController.createUser(req.body);
      const token = jwt.sign({ id: data.userId, password: data.password }, process.env.PASSWORD_JWT);

      res.status(201).json({ token });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  static async info(req, res) {
    try {
      res.status(200).json({ id: req.user.userId, type: req.user.isEmail ? 'email' : 'phone' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  static async logout(req, res) {
    try {
      const { all } = req.query;

      if (typeof all === 'string' && all === 'true') {
        await tokenModel.deleteMany({ userId: req.user._id });
        req.logout();
      }

      if (typeof all === 'string' && all === 'false') {
        const token = req.header('authorization').split(' ')[1];
        await tokenModel.findOneAndDelete({ token });
        req.logout();
      }

      res.sendStatus(204);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  static async latency(req, res) {
    try {
      exec('ping google.com', { encoding: 'binary' }, (err, stdout, stderr) => {
        if (err) {
          throw err;
        }

        // Для декодирования в русский, без этого у меня были иероглифы.
        const convert = iconv.decode(stdout, 'cp866');

        res.status(200).json(`${convert.match(/Среднее.=.\d+/)[0]}мс`);
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

module.exports = UserController;
