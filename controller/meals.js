require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../util/connect_db');
const { v4: uuidv4 } = require('uuid')
const bucket = require('../util/connect_storage')

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


const postMealsHandler = async (req, res, next) => {
  try{
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await db.collection('users').doc(decoded.userId).get();
    if (!loggedUserRef.exists) {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    }

    const mealsRef = db.collection('meals');
    const uniqueId = uuidv4();
    let { title, content, glycemicIndex, glycemicLoad, calorie, protein, carbs, fats } = req.body;
    const file = req.file;

    if( !title || !content || !glycemicIndex 
      || !glycemicLoad || !calorie || !protein 
      || !carbs || !fats || !file ){
      const error = new Error("The Title, Content, Glycemic Index, Glycemic Load, Calorie, Protein, Carbs, Fats, or Image required");
      error.status = 400;
      throw error;
    }

    glycemicIndex = parseFloat(glycemicIndex);
    glycemicLoad = parseFloat(glycemicLoad);
    calorie = parseFloat(calorie);
    protein = parseFloat(protein);
    carbs = parseFloat(carbs);
    fats = parseFloat(fats);

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
        glycemicIndex,
        glycemicLoad,
        calorie,
        protein,
        carbs,
        fats,
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
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await db.collection('users').doc(decoded.userId).get();
    if (!loggedUserRef.exists) {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    }

    const id = req.params.id;
    const mealsRef = db.collection('meals').doc(`${id}`);
    const doc = await mealsRef.get();
    const mealData = doc.data();

    if(!mealData){
      const error = new Error("Meals not found");
      error.status = 404;
      throw error;
  }

  let { title, content, glycemicIndex, glycemicLoad, calorie, protein, carbs, fats } = req.body;
    const file = req.file;

    if(glycemicIndex) glycemicIndex = parseFloat(glycemicIndex);
    if(glycemicLoad) glycemicLoad = parseFloat(glycemicLoad);
    if(calorie) calorie = parseFloat(calorie);
    if(protein) protein = parseFloat(protein);
    if(carbs) carbs = parseFloat(carbs);
    if(fats) fats = parseFloat(fats);

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
          ...(glycemicIndex !== undefined ? { glycemicIndex } : {}),
          ...(glycemicLoad !== undefined ? { glycemicLoad } : {}),
          ...(calorie !== undefined ? { calorie } : {}),
          ...(protein !== undefined ? { protein } : {}),
          ...(carbs !== undefined ? { carbs } : {}),
          ...(fats !== undefined ? { fats } : {}),
          imageUrl,
        })
      });

      blobStream.end(file.buffer);
    }else{
      await mealsRef.set({
        ...mealData,
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(glycemicIndex !== undefined ? { glycemicIndex } : {}),
        ...(glycemicLoad !== undefined ? { glycemicLoad } : {}),
        ...(calorie !== undefined ? { calorie } : {}),
        ...(protein !== undefined ? { protein } : {}),
        ...(carbs !== undefined ? { carbs } : {}),
        ...(fats !== undefined ? { fats } : {}),
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
      glycemicIndex: doc.data().glycemicIndex,
      glycemicLoad: doc.data().glycemicLoad,
      calorie: doc.data().calorie,
      protein: doc.data().protein,
      carbs: doc.data().carbs,
      fats: doc.data().fats,
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