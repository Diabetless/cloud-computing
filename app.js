require('dotenv').config();
const express = require("express");
const cors = require('cors')
const app = express();

const userRoutes = require('./routes/user')
const articlesRoutes = require('./routes/articles')
const mealsRoutes = require('./routes/meals')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/users', userRoutes);
app.use('/articles', articlesRoutes);
app.use('/meals', mealsRoutes);

app.use('/', (req,res,next)=>{
  res.status(404).json({
    status: 'NOT FOUND!!!',
    message: 'Resource Not Found!'
  })
})

app.listen(5000, ()=>{
  console.log(`Server is listening on PORT 5000`);
})