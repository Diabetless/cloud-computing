require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../util/connect_db');
const { v4: uuidv4 } = require('uuid')

const postArticleHandler = async (req, res, next) => {
  try{
    const articlesRef = db.collection('articles');

    const uniqueId = uuidv4();
    const { title, content } = req.body;
    const postDate = new Date().toDateString();


    const newArticleRef = articlesRef.doc(`${uniqueId}`);
    await newArticleRef.set({
      _id: uniqueId,
      title,
      content,
      postDate,
    })

    res.status(201).json({
      status: "Success",
      message: "Article Added Successfully"
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