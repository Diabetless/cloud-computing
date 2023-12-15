const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const postFoodsData = require('../controller/foods')

router.post('/', upload.single('image'), postFoodsData);

module.exports = router;