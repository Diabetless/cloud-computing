require('dotenv').config();
const express = require("express");
const cors = require('cors')
const app = express();

const userRoutes = require('./routes/user')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/users', userRoutes);

app.use('/', (req,res,next)=>{
  res.status(404).json({
    status: 'NOT FOUND!!!',
    message: 'Resource Not Found!'
  })
})

app.use('/test-cicd', (req, res, next) => {
  res.status(200).json({
    status: 'WELCOME CICD!!',
    env: `${process.env.PORT} ${process.env.JWT_KEY}`
  })
})

app.listen(5000, ()=>{
  console.log(`Server is listening on PORT 5000`);
})