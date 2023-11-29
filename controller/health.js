const db = require('../util/connect_db');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const jwtKey = process.env.JWT_KEY;

const getToken = (headers) => {
  const authorizationHeader = headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      return (authorizationHeader.substring(7)); // Remove 'Bearer ' from the header
  }
  else {
      const error = new Error("You need to login");
      error.status = 401;
      throw error;
  }
}

const uploadBMI = async (req, res, next) => {
  try {
    const { height, weight } = req.body;
    const date = new Date();

    const healthRef = db.collection('personal_health');
    const decoded = jwt.verify(req.token, jwtKey);

    let currentUserHealth = await healthRef.where('userId', '==', decoded.userId).get();
    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();
    if(!currentHealthData.BMIData){
      await healthRef.doc(healthDoc.id).update({
        BMIData: [
          {
            height,
            weight,
            date
          }
        ]
      });
    }else{
      const updatedBMIData = [
        ...currentHealthData.BMIData,
        {
          height,
          weight,
          date
        }
      ];
      await healthRef.doc(healthDoc.id).update({ bloodSugarData: updatedBMIData });
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
    if(!currentHealthData.bloodSugarData){
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
          level: bloodSugarLevel,
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

const getUserHealthData = async(req,res,next)=>{
  try {
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedhealthRef = await db.collection('personal_health').where('userId', '==', decoded.userId).get();
    res.status(200).json({
      status: "Success",
      message: "Succesfully Fetch User Health Data",
      BMIData: loggedhealthRef.docs[0].BMIData || null,
      bloodSugarData: loggedhealthRef.docs[0].bloodSugarData || null
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = {
  uploadBMI, uploadBloodSugar, getUserHealthData
}