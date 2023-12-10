const db = require("../util/connect_db");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const jwtKey = process.env.JWT_KEY;

const getToken = (headers) => {
  const authorizationHeader = headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.substring(7); // Remove 'Bearer ' from the header
  } else {
    const error = new Error("You need to login");
    error.status = 401;
    throw error;
  }
};

const uploadBMI = async (req, res, next) => {
  try {
    const { height, weight } = req.body;
    const date = new Date();

    const healthRef = db.collection("personal_health");
    const decoded = jwt.verify(req.token, jwtKey);
    const uniqueId = uuidv4();

    let currentUserHealth = await healthRef
      .where("userId", "==", decoded.userId)
      .get();
    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();
    if (!currentHealthData.BMIData) {
      await healthRef.doc(healthDoc.id).update({
        BMIData: [
          {
            _id: uniqueId,
            height,
            weight,
            date,
          },
        ],
      });
    } else {
      const updatedBMIData = [
        ...currentHealthData.BMIData,
        {
          _id: uniqueId,
          height,
          weight,
          date,
        },
      ];
      await healthRef.doc(healthDoc.id).update({ BMIData: updatedBMIData });
    }

    res.status(201).json({
      status: "Success",
      message: "BMI data uploaded successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const uploadBloodSugar = async (req, res, next) => {
  try {
    const { bloodSugarLevel } = req.body;
    const date = new Date();

    const healthRef = db.collection("personal_health");
    const decoded = jwt.verify(req.token, jwtKey);
    const uniqueId = uuidv4();

    let currentUserHealth = await healthRef
      .where("userId", "==", decoded.userId)
      .get();
    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();
    if (!currentHealthData.bloodSugarData) {
      await healthRef.doc(healthDoc.id).update({
        bloodSugarData: [
          {
            _id: uniqueId,
            level: bloodSugarLevel,
            date,
          },
        ],
      });
    } else {
      const updatedBloodSugarData = [
        ...currentHealthData.bloodSugarData,
        {
          _id: uniqueId,
          level: bloodSugarLevel,
          date,
        },
      ];
      await healthRef
        .doc(healthDoc.id)
        .update({ bloodSugarData: updatedBloodSugarData });
    }
    res.status(201).json({
      status: "Success",
      message: "Blood sugar data uploaded successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getUserHealthData = async (req, res, next) => {
  try {
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedhealthRef = await db
      .collection("personal_health")
      .where("userId", "==", decoded.userId)
      .get();
    let BMIData, bloodSugarData;
    if (loggedhealthRef.docs[0].data().BMIData) {
      BMIData = loggedhealthRef.docs[0].data().BMIData.map((doc) => {
        const dateObject = new Date(doc.date._seconds * 1000);
        const formattedDate = dateObject.toLocaleString("en-US", {
          timeZone: "UTC",
          timeZoneName: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
        return {
          _id: doc._id || "",
          weight: doc.weight,
          height: doc.height,
          date: formattedDate,
        };
      });
    }
    if (loggedhealthRef.docs[0].data().bloodSugarData) {
      bloodSugarData = loggedhealthRef.docs[0]
        .data()
        .bloodSugarData.map((doc) => {
          const dateObject = new Date(doc.date._seconds * 1000);
          const formattedDate = dateObject.toLocaleString("en-US", {
            timeZone: "UTC",
            timeZoneName: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          });
          return {
            _id: doc._id || "",
            level: doc.level,
            date: formattedDate,
          };
        });
    }
    res.status(200).json({
      status: "Success",
      message: "Succesfully Fetch User Health Data",
      BMIData: BMIData || null,
      bloodSugarData: bloodSugarData || null,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteBMIDataById = async (req, res, next) => {
  try{
    const id = req.params.id;
    const healthRef = db.collection("personal_health");
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);

    let currentUserHealth = await healthRef
      .where("userId", "==", decoded.userId)
      .get();

    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();

    const listBMIData =  currentHealthData.BMIData;
    const indexData = listBMIData.findIndex((it) => it._id === id);

    
    if(indexData === -1){
      const error = new Error("BMI Data not found");
      error.status = 404;
      throw error;
    }

    listBMIData.splice(indexData, 1);

    await healthRef.doc(healthDoc.id).update({ BMIData: listBMIData });
  
    res.status(200).json({
      status: "Success",
      message: "Succesfully Delete BMI Data",
    });

  }catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

const deleteBloodSugarDataById = async (req, res, next) => {
  try{
    const id = req.params.id;

    const healthRef = db.collection("personal_health");
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);

    let currentUserHealth = await healthRef
      .where("userId", "==", decoded.userId)
      .get();

    const healthDoc = currentUserHealth.docs[0];
    const currentHealthData = healthDoc.data();

    const listBloodSugarData =  currentHealthData.bloodSugarData;
    const indexData = listBloodSugarData.findIndex((it) => it._id === id);

    
    if(indexData === -1){
      const error = new Error("Blood Sugar not found");
      error.status = 404;
      throw error;
    }

    listBloodSugarData.splice(indexData, 1);

    await healthRef.doc(healthDoc.id).update({ bloodSugarData: listBloodSugarData });
  
    res.status(200).json({
      status: "Success",
      message: "Succesfully Delete Blood Sugar Data",
    });

  }catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

module.exports = {
  uploadBMI,
  uploadBloodSugar,
  getUserHealthData,
  deleteBMIDataById,
  deleteBloodSugarDataById
};
