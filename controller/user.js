require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../util/connect_db');
const jwt = require('jsonwebtoken');
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

const registerHandler = async(req,res,next)=>{
  try {
    const healthRef = db.collection('personal_health');

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

    await healthRef.add({
      userId: newUserRef.id,
    });

    res.status(201).json({
      status: "Success",
      message: "Register Successfull",
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
    };

    const token = jwt.sign(tokenPayload, jwtKey, {
      algorithm: 'HS256'
    });

    res.status(200).json({
      status: "Success",
      message: "Login Successfull",
      token,
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
    const loggedUserRef = await db.collection('users').doc(decoded.userId).get();
    if (!loggedUserRef.exists) {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    } 
    const loggedUser = await loggedUserRef.data();
    res.status(200).json({
      status: "Success",
      message: "Successfully fecth user data",
      user:{
        fullName : loggedUser.fullName,
        email: loggedUser.email,
        username: loggedUser.username,
        profilePicture: loggedUser.profilePicture || "",
        birthday: loggedUser.birthday || ""
      }
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const editUserAccount = async(req,res,next)=>{
  try {
    const usersref = db.collection('users');
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await usersref.doc(decoded.userId);
    const loggedUserData = await loggedUserRef.get();
    const { fullName, email, username, birthday } = req.body;
    if(email){
      const registeredEmail = await usersref.where('email', '==', email).get();
      if(!registeredEmail.empty ){
        if(registeredEmail.docs[0].id != decoded.userId){
          const error = new Error("Email has been registered");
          error.status = 400;
          throw error;
        }
      } 
    }
    await loggedUserRef.update({
      fullName: fullName || loggedUserData.fullName,
      username: username || loggedUserData.username,
      email: email || loggedUserData.email,
      birthday: birthday || loggedUserData.birthday || ""
    })
    res.status(200).json({
      status: "Success",
      message: "Succesfully update user profile"
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const editUserPassword = async(req,res,next)=>{
  try {
    const usersref = db.collection('users');
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await usersref.doc(decoded.userId);
    const loggedUserData = await loggedUserRef.get();
    const { password } = req.body;
    if(!password){
      const error = new Error("Password can't be empty!");
      error.status = 400;
      throw error;
    }
    await loggedUserRef.update({
      password: password
    })
    res.status(200).json({
      status: "Success",
      message: "Succesfully update user password"
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const editUserProfilePicture = async(req,res,next)=>{
  try {
    const usersref = db.collection('users');
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    const loggedUserRef = await usersref.doc(decoded.userId);
    if(req.file){
      try {
        const file = req.file;
        const fileExtension = file.originalname.split('.').pop();
        const blob = bucket.file(`user_profile/${decoded.userId}.${fileExtension}`);
        const blobStream = blob.createWriteStream();
        blobStream.on('error', (err) => {
          const error = new Error("Image Failed to Upload");
          error.status = 500;
          throw error;
        });
        blobStream.on('finish', async () => {
          await blob.makePublic();
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          await loggedUserRef.update({
            profilePicture: imageUrl
          })
        });
        blobStream.end(file.buffer);
      } catch (error) {
        console.log(error);
      }
    }else{
      const error = new Error("Image is empty!");
      error.status = 400;
      throw error;
    }
    res.status(200).json({
      status: "Success",
      message: "Succesfully update user profile"
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = {
  registerHandler, loginHandler, getUserInfo, editUserAccount, editUserProfilePicture, editUserPassword
}