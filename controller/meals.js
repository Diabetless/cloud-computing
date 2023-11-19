require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../util/connect_db');
const { v4: uuidv4 } = require('uuid')
const bucket = require('../util/connect_storage')

const postMealsHandler = async (req, res, next) => {
  try{
    const mealsRef = db.collection('meals');

    const uniqueId = uuidv4();
    let { title, content, calorie } = req.body;
    const file = req.file;

    if( !title || !content || !calorie || !file ){
      const error = new Error("The Title, Content, Calorie, or Image required");
      error.status = 400;
      throw error;
    }

    calorie = parseFloat(calorie);

    const blob = bucket.file(`meals-image/${new Date().getTime()}-${file.originalname}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      const error = new Error("Image Failed to Upload");
      error.status = 500;
      throw error;
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const postDate = new Date().toDateString();
      const newMealsRef = mealsRef.doc(`${uniqueId}`);
      await newMealsRef.set({
        _id: uniqueId,
        title,
        content,
        calorie,
        postDate,
        imageUrl,
      })

      res.status(201).json({
        status: "Success",
        message: "Meals Added Successfully"
      })
    });

    blobStream.end(file.buffer);
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const putMealsHandler = async (req, res, nex) => {
  try{
    const id = req.params.id;
    const mealsRef = db.collection('meals').doc(`${id}`);
    const doc = await mealsRef.get();
    const mealData = doc.data();

    if(!mealData){
      const error = new Error("Meals not found");
      error.status = 404;
      throw error;
  }

    let { title, content, calorie } = req.body;
    const file = req.file;

    if(calorie) calorie = parseFloat(calorie);

    if(file){
      const blob = bucket.file(`meals-image/${new Date().getTime()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        const error = new Error("Image Failed to Upload");
        error.status = 500;
        throw error;
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const splitExistingUrl = mealData.imageUrl.split('/')
        const fileName = splitExistingUrl[splitExistingUrl.length - 1]
        const pathToFile = `meals-image/${fileName}`
        await bucket.file(pathToFile).delete();

        await mealsRef.set({
          ...mealData,
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {}),
          ...(calorie !== undefined ? { calorie } : {}),
          imageUrl,
        })
      });

      blobStream.end(file.buffer);
    }else{
      await mealsRef.set({
        ...mealData,
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(calorie !== undefined ? { calorie } : {}),
      })
    }

    res.status(200).json({
      status: "Success",
      message: "Meals Updated Successfully"
    })

  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const getAllMealsHandler = async (req, res, next) => {
  try{
    const mealsRef = db.collection('meals');
    const snapshot = await mealsRef.get();

    const data = snapshot.docs.map(doc => ({
      _id: doc.data()._id,
      postDate: doc.data().postDate,
      title: doc.data().title,
      imageUrl: doc.data().imageUrl,
      calorie: doc.data().calorie,
    }))

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all meals",
      meal: data
    })
    
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const getMealsByIdHandler = async (req, res, next) => {
  try{
    const id = req.params.id;
    const mealsRef = db.collection('meals').doc(`${id}`);
    const doc = await mealsRef.get();
    const data = doc.data();

    if(!data){
      const error = new Error("Meals not found");
      error.status = 404;
      throw error;
  }

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch meal",
      meal: data
    })
    
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = { postMealsHandler, getAllMealsHandler, getMealsByIdHandler, putMealsHandler }