const { Router } = require('express');

// Lib
const passport = require('passport');

// Controllers
const UserController = require('../controller/auth.controller');
const authenticate = require('../utils/authenticate');

const router = Router();

router.post('/signin', UserController.signin);
router.post('/signup', UserController.signup);

router.get('/info', authenticate, UserController.info);
router.get('/logout', authenticate, UserController.logout);
router.get('/latency', authenticate, UserController.latency);

module.exports = { router };
