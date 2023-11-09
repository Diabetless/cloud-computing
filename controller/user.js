//file ini berisi controller yang terkait dengan user account
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../util/connect_db');
const jwt = require('jsonwebtoken');

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

const registerHandler = async(req,res,next)=>{
  try {
    const usersref = db.collection('users');

    //ambil data dari request body
    const { fullName, email, username, password } = req.body;

    const registeredEmail = await usersref.where('email', '==', email).get();

    if(!registeredEmail.empty){
      const error = new Error("Email has been registered");
      error.status = 400;
      throw error;
    }

    const newUserRef = usersref.doc();

    const hashedPassword = await bcrypt.hash(password, 10);

    await newUserRef.set({
      fullName,
      email,
      username,
      password: hashedPassword
    })

    const tokenPayload = {
      userId: newUserRef.id,
    }

    const token = jwt.sign(tokenPayload, jwtKey, {
      algorithm: 'HS256'
    });

    res.status(201).json({
      status: "Success",
      message: "Register Successfull",
      token
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const loginHandler = async(req,res,next)=>{
  try {
    const usersref = db.collection('users');
    const { email, password } = req.body;
    let currentUser = await usersref.where('email', '==', email).get();
    if(currentUser.empty){
      const error = new Error("Wrong email or password");
      error.status = 400;
      throw error;
    }
    const userData = currentUser.docs[0].data();
    const hashedPassword = userData.password;

    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if(!isPasswordMatch){
      const error = new Error("Wrong email or password");
      error.status = 400;
      throw error;
    }

    const tokenPayload = {
      userId: currentUser.docs[0].id,
    }

    const token = jwt.sign(tokenPayload, jwtKey, {
      algorithm: 'HS256'
    });

    res.status(200).json({
      status: "Success",
      message: "Login Successfull",
      token
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const getUserInfo = async(req,res,next)=>{
  try {
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await db.collection('users').doc(decoded.userId).get()
    const loggedUser = await loggedUserRef.data();
    if (!loggedUser.exists) {
      res.status(200).json({
        status: "Success",
        message: "Successfully fecth user data",
        user:{
          fullName : loggedUser.fullName,
          email: loggedUser.email,
          username: loggedUser.username,
          profilePicture: loggedUser.profilePicture || ""
        }
      })
    } else {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    }
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = {
  registerHandler, loginHandler, getUserInfo
}