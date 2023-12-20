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

const postFoodsData =  async (req, res, next) => {
  try{
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await db.collection('users').doc(decoded.userId).get();
    if (!loggedUserRef.exists) {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    }
    const userData = loggedUserRef.data();
    if(userData.role !== "admin"){
      const error = new Error("You don't have permission!");
      error.status = 401;
      throw error;
    }
    const foodsRef = db.collection('foods');
    let { 
      GL, GL_Level, GI, GI_Level, Calories, Carbohydrates, 
      Fats, Proteins, name, serving, tags, type 
    } = req.body
    const  file = req.file;

    if(!(GL && GL_Level && GI && GI_Level && Calories && Carbohydrates && Fats && Proteins && name && serving && tags && type && file)){
      const error = new Error("Required field is empty"); 
      error.status = 400;
      throw error;
    }

    GI = parseFloat(GI);
    GL = parseFloat(GL);
    Calories = parseFloat(Calories);
    Carbohydrates = parseFloat(Carbohydrates);
    Fats = parseFloat(Fats);
    Proteins = parseFloat(Proteins);

    const blob = bucket.file(`foods-image/${new Date().getTime()}-${file.originalname}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      const error = new Error("Image Failed to Upload");
      error.status = 500;
      throw error;
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const newFoodRef = foodsRef.doc();
      await newFoodRef.set({
        GL,
        GL_Level,
        GI,
        GI_Level,
        Calories,
        Carbohydrates,
        Fats,
        Proteins,
        name,
        serving,
        tags,
        type,
        imageUrl,
      })

      res.status(201).json({
        status: "Success",
        message: "Foods Added Successfully"
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

module.exports = postFoodsData;