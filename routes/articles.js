const express = require('express');
const router = express.Router();

const { postArticleHandler, getAllArtilcesHandler, getArticleByIdHandler } = require('../controller/articles');

router.post('/', postArticleHandler);
router.get('/', getAllArtilcesHandler);
router.get('/:id', getArticleByIdHandler);

module.exports = router;