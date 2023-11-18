const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { registerHandler, loginHandler, getUserInfo, editUserAccount } = require('../controller/user')

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.get('/', getUserInfo);

router.put('/edit-profile', upload.single('image'), editUserAccount);

module.exports = router;