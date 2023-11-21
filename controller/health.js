const db = require('../util/connect_db');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const jwtKey = process.env.JWT_KEY;

const uploadBMI = async (req, res, next) => {
  try {
    const { height, weight } = req.body;
    const date = new Date();

    const healthRef = db.collection('personal_health');
    const decoded = jwt.verify(req.token, jwtKey);

    let currentUserHealth = await healthRef.where('userId', '==', decoded.userId).get();

    if (!currentUserHealth.empty) {
      const healthDoc = currentUserHealth.docs[0];
      const currentHealthData = healthDoc.data();
      const updatedBMIData = [
        ...currentHealthData.BMIData,
        {
          height,
          weight,
          date
        }
      ];
      await healthRef.doc(healthDoc.id).update({ BMIData: updatedBMIData });
    } else {
      await healthRef.add({
        userId: decoded.userId,
        BMIData: [
          {
            height,
            weight,
            date
          }
        ]
      });
    }
    res.status(201).json({
      status: 'Success',
      message: 'BMI data uploaded successfully'
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: 'Error',
      message: error.message
    });
  }
};

const uploadBloodSugar = async (req, res, next) => {
  try {
    const { bloodSugarLevel } = req.body;
    const date = new Date();

    const healthRef = db.collection('personal_health');
    const decoded = jwt.verify(req.token, jwtKey);

    let currentUserHealth = await healthRef.where('userId', '==', decoded.userId).get();
    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();
    if(!currentHealthData.bloodSugarLevel){
      await healthRef.doc(healthDoc.id).update({
        bloodSugarData: [
          {
            level: bloodSugarLevel,
            date
          }
        ]
      });
    }else{
      const updatedBloodSugarData = [
        ...currentHealthData.bloodSugarData,
        {
          bloodSugarLevel,
          date
        }
      ];
      await healthRef.doc(healthDoc.id).update({ bloodSugarData: updatedBloodSugarData });
    }
    res.status(201).json({
      status: 'Success',
      message: 'Blood sugar data uploaded successfully'
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = {
  uploadBMI, uploadBloodSugar
}