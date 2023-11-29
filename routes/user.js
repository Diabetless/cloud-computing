const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { registerHandler, loginHandler, getUserInfo, editUserAccount } = require('../controller/user');
const { uploadBMI, uploadBloodSugar, getUserHealthData } = require('../controller/health');
const userVerification = require('../middleware/user_verif');

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.get('/', getUserInfo);

router.put('/edit-profile', upload.single('image'), editUserAccount);

router.post('/bmi', userVerification, uploadBMI);

router.post('/blood-sugar', userVerification, uploadBloodSugar);

router.get('/health', getUserHealthData);

module.exports = router;