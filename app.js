require('dotenv').config();
const express = require("express");
const cors = require('cors')
const app = express();
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./API_DOC.yml')

const userRoutes = require('./routes/user')
const articlesRoutes = require('./routes/articles')
const mealsRoutes = require('./routes/meals')
const foodsRoutes = require('./routes/foods')
const predictFood = require('./util/predictImage');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/users', userRoutes);
app.use('/articles', articlesRoutes);
app.use('/meals', mealsRoutes);
app.use('/foods', foodsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', (req,res,next)=>{
  res.status(404).json({
    status: 'NOT FOUND!!!',
    message: 'Resource Not Found!'
  })
})

app.listen(5000, ()=>{
  console.log(`Server is listening on PORT 5000`);
})