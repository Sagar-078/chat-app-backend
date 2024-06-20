const express = require("express");
const router = express.Router();


const { auth } = require("../midddleware/auth");
const { chatrouter, getchat, creategroup, groupNameUpdate,
        addToGroup, removeFromGroup, updateGroupIcon, showUserForAdd, 
        exitFromGroup,
        deleteChat} = require("../controller/chatcontroller");


    router.post("/chatrouter", auth, chatrouter); // for access chat or create one to one
    router.get("/getchat", auth, getchat); // for get all the chat of a user
    router.post("/groupcreation", auth, creategroup); // for creatiing group chat
    router.put("/updategroupname", auth, groupNameUpdate); // for change group name
    router.post("/updategroupicon",auth, updateGroupIcon);
    router.get("/showUserForAdd/:groupId", auth, showUserForAdd);
    router.put("/addtogroup", auth, addToGroup); // for add some one to group
    router.put("/removefromgroup", auth, removeFromGroup); // for exist from group
    router.put("/exitfromgroup", auth, exitFromGroup);
    router.put("/deleteChat", auth, deleteChat);


module.exports = router;