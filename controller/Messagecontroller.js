const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatappmodule");
const {getio} = require('../socket/index');

exports.messageHnadler = async(req, res) => {
    try{

        const {content, chatId} = req.body;

        if(!content || !chatId){
            return res.status(403).json({
                success: false,
                message: "details are required"
            });
        }

        // create a message
        
        var messageProp = {
            sender: req.user.id,
            content: content,
            chat: chatId
        } 
     
        var message = (await Message.create(messageProp));
        
        message = await message.populate("sender", "name profile");
        message = await message.populate("chat", "users");
        message = await User.populate(message, {
                                                    path: "chat.users",
                                                    select: "name email profile"
                                                });

        // update the latest message in Chat

        const chat = await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: message});
        const io = getio();
        io.to(chatId).emit("message_received",message);
        
        if(!chat.isGroupChat && !chat?.latestMessage){
            const friendId = chat.users[0].toString() === req.user.id ? chat.users[1]:chat.users[0];
            await chat.populate({
                path:'users',
                match: { _id:req.user.id}
            })
            io.to(friendId.toString()).emit('sidebarUpdated',chat);
        }
        res.status(200).json({
            success: true,
            message
        });


    }catch(error){
        console.log("error while send message =>> ", error);
        res.status(500).json({
            success: false,
            message: "error while send message"
        });

    }
}


exports.getAllMessages = async(req, res) => {

    try{

        const {chatId} = req.body;


        const messages = await Message.find({chat: chatId})
                                    .populate("sender", "name profile email")
                                    .populate("chat")
        
        res.status(200).json({
            success: true,
            message: "successfully get all messages",
            messages
        });

    }catch(error){
        console.log("error while get all message =>>>>", error);
        res.status(500).json({
            success: false,
            message: "error while get all message"
        })

    }

}


