const predict = require("../util/predictImage");
const recomendation = require("../util/recomendation");

const predictFood = async(req,res,next)=>{
  try {
    if(req.file){
      const predictResult = await predict(req.file.buffer);
      const result = []

      for (const predicted of predictResult) {
        const data =  await recomendation(predicted);
        result.push(data);
      }

      res.status(200).json({
        status: "Success",
        result
      })
    }else{
      const error = new Error("image is empty");
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

module.exports = predictFood;