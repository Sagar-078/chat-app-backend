const express = require("express");
const router = express.Router();
const { auth } = require("../midddleware/auth");

const {sendForgotePasswordToken, verifyForgoteOtp, forgotePasswordUpdate} = require("../controller/forgotePassword");
const {getallusers, updateAdditionalDetails, 
        deleteAccount, getAllUserDetails, updateProfile, getAllOfUsersArr,
        getUserByToken} = require("../controller/usercontroller");

router.get("/getallusers", auth, getallusers); // by seach
//router.put("/updateAdditionalDetails", auth, updateAdditionalDetails);
router.delete("/deleteAccount", auth, deleteAccount);
router.post("/getAllUserDetails", auth, getAllUserDetails);
router.put("/updateProfile", auth, updateProfile);
//router.get("/getAllOfUsersArr", auth, getAllOfUsersArr)

router.post("/sendForgotePasswordToken", sendForgotePasswordToken);
router.post("/verifyForgoteOtp", verifyForgoteOtp);
router.post("/forgotePasswordUpdate", forgotePasswordUpdate);

router.post("/getUserByToken",auth, getUserByToken);

module.exports = router;