const predict = require("../util/predictImage");

const predictFood = async(req,res,next)=>{
  try {
    if(req.file){
      const result = await predict(req.file.buffer);
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