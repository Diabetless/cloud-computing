const express = require('express');
const router = express.Router();

const postArticleHandler = require('../controller/articles');

router.post('/', postArticleHandler);

module.exports = router;