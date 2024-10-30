const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

exports.auth = async(req, res, next) => {

  try{

    const token = req.cookies.token || req.body.token                           
                    || req.header("Authorization").replace("Bearer ", "");

    if(!token){
      return res.status(401).json({
        success: false,
        message: "token is missing !"
      })
    }

    try{

      const decode = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decode
    }catch(error){

      console.log("error while decode the token =>>>", error);
      return res.status(400).json({
        success: false,
        message: "token is invalid"
      })

    }

    next();

  }catch(error){

    console.log("error while create token =>>", error);

    return res.status(401).json({
      success: false,
      message: "error while create token"
    })
  }
};
