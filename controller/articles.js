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

    const blob = bucket.file(`articles-image/${new Date().getTime()}-${file.originalname}`);
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

const putArticleHandler = async (req, res, nex) => {
  try{
    const id = req.params.id;
    const articleRef = db.collection('articles').doc(`${id}`);
    const doc = await articleRef.get();
    const articleData = doc.data();

    if(!articleData){
      const error = new Error("Article not found");
      error.status = 404;
      throw error;
  }

    const { title, content } = req.body;
    const file = req.file;

    if(file){
      const blob = bucket.file(`articles-image/${new Date().getTime()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        const error = new Error("Image Failed to Upload");
        error.status = 500;
        throw error;
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        await articleRef.set({
          ...articleData,
          title,
          content,
          imageUrl,
        })
      });

      blobStream.end(file.buffer);
    }else{
      await articleRef.set({
        ...articleData,
        title,
        content,
      })
    }

    res.status(200).json({
      status: "Success",
      message: "Article Updated Successfully"
    })

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
      message: "Successfully fetch all article",
      article: data
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

    if(!data){
      const error = new Error("Article not found");
      error.status = 404;
      throw error;
  }

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch article",
      article: data
    })
    
  }catch(error){
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = { postArticleHandler, getAllArtilcesHandler, getArticleByIdHandler, putArticleHandler }