const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { postArticleHandler, getAllArtilcesHandler, getArticleByIdHandler, putArticleHandler } = require('../controller/articles');

router.post('/', upload.single('image'), postArticleHandler);
router.get('/', getAllArtilcesHandler);
router.put('/:id', upload.single('image'), putArticleHandler);
router.get('/:id', getArticleByIdHandler);

module.exports = router;