const express = require('express');
const router = express.Router();

const { registerHandler, loginHandler, getUserInfo } = require('../controller/user')

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.get('/', getUserInfo);

module.exports = router;