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


    const newArticleRef = articlesRef.doc();
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

module.exports = postArticleHandler