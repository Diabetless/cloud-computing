const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const { registerHandler, loginHandler, getUserInfo, editUserAccount, editUserProfilePicture } = require('../controller/user');
const { uploadBMI, uploadBloodSugar, getUserHealthData, deleteBMIDataById, deleteBloodSugarDataById } = require('../controller/health');
const userVerification = require('../middleware/user_verif');

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.get('/', getUserInfo);

router.put('/edit-profile', editUserAccount);

router.put('/profile-picture', upload.single('image'), editUserProfilePicture);

router.post('/bmi', userVerification, uploadBMI);

router.delete('/bmi/:id', userVerification, deleteBMIDataById);

router.post('/blood-sugar', userVerification, uploadBloodSugar);

router.delete('/blood-sugar/:id', userVerification, deleteBloodSugarDataById);

router.get('/health', getUserHealthData);

module.exports = router;