const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { postMealsHandler, getAllMealsHandler, getMealsByIdHandler, putMealsHandler } = require('../controller/meals');
const predictFood = require('../controller/predictFood');

router.post('/', upload.single('image'), postMealsHandler);
router.get('/', getAllMealsHandler);
router.put('/:id', upload.single('image'), putMealsHandler);
router.get('/:id', getMealsByIdHandler);
router.post('/detect-food', upload.single('image'), predictFood);

module.exports = router;