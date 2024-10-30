const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatappmodule");
const User = require("../models/userModel");
const messageModel = require("../models/messageModel");
const { uploadImageToCloudinary } = require("../utils/imageUploaderToCloudinary");
const {getio} = require('../socket/index')
// for two user chat
exports.chatrouter = async(req, res) => {
  try {
    const friendId = req.body.friendId;
    const myId = req.user.id;

    if(!myId || !friendId){
       return res.status(400).json({
        success: false,
        message: "Sorry user not prasent"
       });
    }

    const chat = await Chat.findOne({
        users:{$all:[myId,friendId]},isGroupChat:false
    })

    if(chat){
        return res.status(200).json({
            success:true,
            message:'Chat already exists',
            chatId:chat?._id
        })
    }
    
    const newchat =  await Chat.create({users:[myId,friendId]});
    const chatuser = await Chat.findById(newchat._id).populate({
        path:'users',
        match: { _id: friendId}
    });
    const io = getio();
    io.to(myId).emit('sidebarUpdated', chatuser)
    return res.status(200).json({
        success:true,
        message:'Chat ctreated',
        chatId:newchat?._id
    })
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
        success:'Server error',
        message:'Oh noooo',
        
    })
    
  }

};



exports.getchatdetails = async(req,res)=>{
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;
        if(!chatId || !userId){
            return res.status(500).json({
                success:false,
                message:'Invalid request'
            })
        }
        const chatdetails = await Chat.findById({_id:chatId}).populate({
            path:'users',
            match: { _id: { $ne: userId }}
        }).exec();
        const prevmessages = await messageModel.find({chat:chatId}).populate("sender");
        return res.status(200).json({
            success:true,
            message:'Okay',
            chatdetails,
            prevmessages
        })
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success:'Server error',
            message:'Oh noooo',
        })
    }
}

// get chats of a user
exports.getchat = async(req, res) => {
    try{
        const userId = req.user.id;
        if(!userId){}
        const chats = await Chat.find({users:{$in:[userId]}}).populate({
            path:'users',
            match: { _id: { $ne: userId }}
        }).sort({updatedAt:-1})
        .populate({
            path: 'latestMessage',
            populate: {
                path: 'sender', 
                select: 'name email profile'
            }
        })
        return res.status(200).json({
            success:true,
            message:'okay',
            chats
        })
    }catch(err){
        console.log("error while get all chats =>>", err);
        res.status(500).json({
            success: false,
            message: "error while get all chats"
        })
    }
};


// for create group chat
exports.creategroup = async(req, res) => {

    try{

        const {users, name} = req.body;
        const user = req.user.id;

        if(!users || !name || !user){
            return res.status(400).json({
                success: false,
                message: "fill all the details"
            })
        }


        if(users.length < 2){
            return res.status(500).json({
                success: false,
                message: "Please selecte more then two user"
            })
        }

        try{
            const groupChatCreate = await Chat.create({
                chatName: name,
                users: [...users,user],
                isGroupChat: true,
                groupAdmin: user,
                groupIcon: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
            });

            const fullGroupChat = await Chat.findOne({_id: groupChatCreate._id})
            .populate("users")
            .populate("groupAdmin")
            .populate("chatName")
            .populate("isGroupChat")
            .populate("groupIcon")


            const io = getio();
       
            
            users?.forEach(uid => {
                io.to(uid).emit('sidebarUpdated',groupChatCreate);
            });
            io.to(user).emit('sidebarUpdated',groupChatCreate);
             
           

            res.status(200).json({
                success: true,
                message: "successfully created a group chat",
                fullGroupChat
            });

        }catch(err){
            console.log("error while create group chat", err);
            res.status(400).jsoN({
                success: false,
                message: "error while create a group chat"
            })
        }

    }catch(error){

        console.log("error while create a group try again=>>", error);
        res.status(500).json({
            success: false,
            message: "try again err while create a group chat"
        });

    }
};


exports.groupNameUpdate = async(req, res) => {
    
    try{
        const {chatId, chatName} = req.body;

        if(!chatId || !chatName){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, {chatName})
        .populate("users")
        .populate("groupAdmin")

        if(!updatedChat){
            return res.status(400).json({
                success: false,
                message: "can't update chat"
            });
        }

        res.status(200).json({
            success: true,
            message: "successfully updated group name",
            updatedChat
        });

    }catch(error){
        console.log("error while update group name", error);
        res.status(500).json({
            success: false,
            message: "error while updated group name"
        });

    }

};


exports.updateGroupIcon = async(req, res) => {
    try{

        const groupIcon = req.files.groupIcon;
        const chatId = req.body.chatId;
        const image = await uploadImageToCloudinary(
            groupIcon,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        const updatedIcon = await Chat.findByIdAndUpdate(
            {_id: chatId},
            {groupIcon: image.secure_url},
            {new: true}
        );

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            updatedIcon
        })

    }catch(error){

        console.log("error while update profile picture =>>", error);
        res.status(500).json({
            success: false,
            message: "Please Select a valid image",
        })

    }
}


exports.showUserForAdd = async(req, res) => {
    try{
        
        const { groupId } = req.params;
        if(!groupId){
            return res.status(400).json({
                success:false,
                message:'GroupId not present'
            })
        }
        const chat = await Chat.findById(groupId);
        const otherusers = await User.find({_id: { $nin: chat.users }});
        return res.status(200).json({
            otherusers
        })
    }catch(error){
        console.log("error while add to group", error);
        res.status(500).json({
            success: false,
            message: "error while fetch user which not present in group"
        });
    }
}


exports.addToGroup =  async (req, res) => {
    
    try{

        const {groupId, userId} = req.body;

        const existUsers = await Chat.findOne({_id: groupId})

        if(existUsers.users.indexOf(userId) !== -1){
            return res.status(403).json({
                success: false,
                message: "user alrady exist",
            });
        }

        try{

            const addtogroupUser = await Chat.findByIdAndUpdate(groupId, 
                                                {$push:{users: userId}})

            const fullGroupchatUsers = await Chat.findOne({_id: addtogroupUser._id})
            .populate("users")
            .populate("groupAdmin")

            res.status(200).json({
                success: true,
                message: "success full push to group",
                fullGroupchatUsers
            })

        }catch(err){

            console.log("error while push to group a user =>>", err);
            res.status(400).json({
                success: false,
                message: "error occure while push to group user"
            })

        }

    }catch(err){

        console.log("error while add to group", err);
        res.status(500).json({
            success: false,
            message: "error while add to group please try again"
        });
    }
    
};


// remove from group
exports.removeFromGroup = async(req, res) => {
    try{

        const {groupId, userId} = req.body;

        if(!groupId || !userId){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
        }

        if(userId.length === 0){
            return res.status(404).json({
                success: false,
                message: "Please select user"
            })
        }

        // pull from group
        const removefromgroup = await Chat.findByIdAndUpdate({_id:groupId},
                                            {$pull: {users: {$in:userId}}}, {new:true})
                                                                    .populate("users")
                                                                    .populate("groupAdmin")

    

        // const fullGroupchatUsers = await Chat.findOne({_id: removefromgroup._id})
        //                                                     .populate("users")
        //                                                     .populate("groupAdmin")

        res.status(200).json({
            success: true,
            message: "successfully removed group chat",
            removefromgroup,
            
        });

    }catch(error){

        console.log("error while remove from group chat", error);
        res.status(500).json({
            success: false,
            message: "error while remove from group chat",
        });

    }
};


exports.exitFromGroup = async(req, res) => {
    try{

        const {groupId} = req.body
        const userId = req.user.id;

        if(!groupId || !userId){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
        }

        const exitfromgroup = await Chat.findByIdAndUpdate({_id:groupId}, 
                                                            {$pull: {users: userId}},
                                                                    {new:true}).populate("users")
                                                                                .populate("groupAdmin")


        res.status(200).json({
            success: true,
            message: "successfully exit group chat",
            exitfromgroup,
            
        });

    }catch(err){
        console.log("error while exit from group chat", err);
        res.status(500).json({
            success: false,
            message: "error while exit from group chat",
        });
    }
}

exports.deleteChat = async(req, res) => {
    try{
        const myId = req.user.id;
        const {chatId} = req.body;

        if(!chatId){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
        }

        const deletedChat = await Chat.findByIdAndDelete(chatId);

        if(!deletedChat){
            return res.status(404).json({
                success: false,
                message: "chat not found"
            })
        }
        
        const otherUserId = deletedChat.users.find(userId => userId.toString() !== myId);

        const io = getio();
        io.to(myId).emit('chatDeleted',deletedChat._id); 
        io.to(otherUserId.toString()).emit('chatDeleted', deletedChat._id);                                                                   


        res.status(200).json({
            success: true,
            message: "successfully delete chat",
            deletedChat,
            
        });

    }catch(err){

        console.log("error while exit from group chat", err);
        res.status(500).json({
            success: false,
            message: "error while delete chat",
        });

    }
}
