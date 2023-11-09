require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../util/connect_db');
const { v4: uuidv4 } = require('uuid')
const bucket = require('../util/connect_storage')

const postArticleHandler = async (req, res, next) => {
  try{
    const articlesRef = db.collection('articles');

    const uniqueId = uuidv4();
    const { title, content } = req.body;
    const file = req.file;

    if( !title || !content || !file){
      const error = new Error("The Title, Content, or Image required");
      error.status = 400;
      throw error;
    }

    const blob = bucket.file(`articles-image/${file.originalname}`);
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
      const newArticleRef = articlesRef.doc(`${uniqueId}`);
      await newArticleRef.set({
        _id: uniqueId,
        title,
        content,
        postDate,
        imageUrl,
      })

      res.status(201).json({
        status: "Success",
        message: "Article Added Successfully"
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

const getAllArtilcesHandler = async (req, res, next) => {
  try{
    const articlesRef = db.collection('articles');
    const snapshot = await articlesRef.get();

    const data = snapshot.docs.map(doc => ({
      _id: doc.data()._id,
      postDate: doc.data().postDate,
      title: doc.data().title,
    }))

    res.status(200).json({
      status: "Success",
      data
    })
    
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const getArticleByIdHandler = async (req, res, next) => {
  try{
    const id = req.params.id;
    const articlesRef = db.collection('articles').doc(`${id}`);
    const doc = await articlesRef.get();
    const data = doc.data();

    res.status(200).json({
      status: "Success",
      data
    })
    
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = { postArticleHandler, getAllArtilcesHandler, getArticleByIdHandler }