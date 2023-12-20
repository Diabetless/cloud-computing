const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { postMealsHandler, getAllMealsHandler, getMealsByIdHandler, putMealsHandler } = require('../controller/meals');

router.post('/', upload.single('image'), postMealsHandler);
router.get('/', getAllMealsHandler);
router.put('/:id', upload.single('image'), putMealsHandler);
router.get('/:id', getMealsByIdHandler);

module.exports = router;