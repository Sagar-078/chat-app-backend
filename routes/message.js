const express = require("express");
const router = express.Router();

const { auth } = require("../midddleware/auth");
const {messageHnadler, getAllMessages} = require("../controller/Messagecontroller");
const { getchatdetails } = require("../controller/chatcontroller");


router.post("/sendMessage", auth, messageHnadler);
router.post("/getAllMessages", auth, getAllMessages);
router.get("/getchatdetails/:chatId", auth, getchatdetails);


module.exports = router;