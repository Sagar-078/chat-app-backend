const express = require("express");
const router = express.Router();

// import handler from controler
const {signUp, login, sendOTP, changePassword} = require("../controller/authrization");
const {auth} = require("../midddleware/auth");


// define router 
router.post("/sendotp", sendOTP);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/changepassword", auth, changePassword);


// export router
module.exports = router;